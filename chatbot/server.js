const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure output-docs directory exists
const outputDir = path.join(__dirname, '..', 'output-docs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Serve files from output-docs directory
app.use('/output-docs', express.static(outputDir));

// Load templates
const loadTemplate = (templateName) => {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', templateName);
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf8');
    }
    return null;
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    return null;
  }
};

// Document types
const documentationTypes = [
  { id: 'ProjectOverview', name: 'Project Overview', description: 'Provides a high-level overview of the project, including vision, scope, and goals' },
  { id: 'Features', name: 'Feature Specifications', description: 'Details the features of the project, their priorities, and dependencies' },
  { id: 'Requirements', name: 'Requirements Documentation', description: 'Outlines functional and technical requirements for the project' },
  { id: 'TechStack', name: 'Tech Stack Documentation', description: 'Documents the technologies used in the project and justifications' },
  { id: 'Dependencies', name: 'Dependencies Documentation', description: 'Lists all project dependencies with versions and context' },
  { id: 'UserFlow', name: 'User Flows', description: 'Maps out the user journeys through the application' },
  { id: 'Implementation', name: 'Implementation Standards', description: 'Defines coding standards and implementation practices' },
  { id: 'ProjectStructure', name: 'Project Structure', description: 'Documents the organization of files and directories' }
];

// Generate project folder path
const generateProjectFolder = (projectName) => {
  const sanitizedProjectName = projectName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const projectPath = path.join(outputDir, sanitizedProjectName);
  
  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath, { recursive: true });
  }
  
  return projectPath;
};

// Generate filename based on document type
const generateFilename = (docType) => {
  return `${docType.toLowerCase()}.md`;
};

// Save documentation to file
const saveDocumentation = (projectPath, filename, content) => {
  const filePath = path.join(projectPath, filename);
  fs.writeFileSync(filePath, content);
  return filePath;
};

// New API endpoint to get available documents
app.get('/api/documents', (req, res) => {
  try {
    // Get all documents recursively from output-docs directory and subfolders
    const documents = getAllDocuments(outputDir);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// New API endpoint to upload project documents to MCP server
app.post('/api/upload-to-mcp', async (req, res) => {
  try {
    const { projectName } = req.body;
    
    if (!projectName) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    const projectPath = path.join(outputDir, projectName);
    
    // Check if project directory exists
    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const uploadResults = [];
    const failedUploads = [];
    
    // Get all markdown files in the project directory
    const files = fs.readdirSync(projectPath);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    // MCP server URL (from environment or default)
    const mcpUrl = process.env.MCP_URL || "http://localhost:3000/context";
    
    // Upload each file
    for (const fileName of markdownFiles) {
      try {
        const filePath = path.join(projectPath, fileName);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Format payload for MCP server
        const payload = {
          id: fileName,
          type: "text/markdown",
          content: content,
          created_at: new Date().toISOString()
        };
        
        // Send to MCP server
        const response = await fetch(mcpUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          uploadResults.push({ fileName, success: true });
        } else {
          const errorText = await response.text();
          failedUploads.push({ fileName, status: response.status, error: errorText });
        }
      } catch (error) {
        failedUploads.push({ fileName, error: error.message });
      }
    }
    
    res.json({
      success: failedUploads.length === 0,
      uploaded: uploadResults,
      failed: failedUploads,
      totalUploaded: uploadResults.length,
      totalFailed: failedUploads.length,
      totalFiles: markdownFiles.length
    });
  } catch (error) {
    console.error('Error uploading to MCP:', error);
    res.status(500).json({ error: 'Failed to upload documents to MCP server' });
  }
});

// Recursively get all markdown documents from directory and subdirectories
function getAllDocuments(dir, baseDir = outputDir) {
  const documents = [];
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively get documents from subdirectories
      const subdirDocs = getAllDocuments(filePath, baseDir);
      documents.push(...subdirDocs);
    } else if (file.endsWith('.md')) {
      try {
        // Get relative path from the output-docs directory
        const relativePath = path.relative(baseDir, filePath);
        // Get the folder name (project name)
        const folderName = path.dirname(relativePath) === '.' ? null : path.dirname(relativePath);
        
        // Instead of parsing the filename, use the file's creation timestamp
        const creationTime = stat.birthtime || stat.mtime;
        
        // For document type and project name, still parse the filename
        // but handle potential errors more gracefully
        let documentType = 'doc';
        let projectNameFromFile = '';
        
        // Try to parse filename patterns like "docType-projectName-timestamp.md"
        if (file.includes('-')) {
          const parts = file.split('-');
          // First part is typically the document type
          documentType = parts[0] || 'doc';
          
          // If we have more parts, everything except first and last could be project name
          if (parts.length > 2) {
            // Remove the file extension from the last part
            const lastPart = parts[parts.length - 1].replace('.md', '');
            // Check if last part looks like a timestamp
            const isLastPartTimestamp = /^\d{4}/.test(lastPart);
            
            if (isLastPartTimestamp) {
              // Last part is likely a timestamp, so project name is everything in between
              projectNameFromFile = parts.slice(1, -1).join('-');
            } else {
              // Last part isn't a timestamp, so include it in the project name
              projectNameFromFile = parts.slice(1).join('-').replace('.md', '');
            }
          } else {
            // If only two parts, second part might be project name
            projectNameFromFile = parts[1] ? parts[1].replace('.md', '') : '';
          }
        } else {
          // Filename doesn't follow our pattern, use the filename without extension
          documentType = 'doc';
          projectNameFromFile = file.replace('.md', '');
        }
        
        // Use folder name as project name if available, otherwise use from filename
        const projectName = folderName || projectNameFromFile;
        
        documents.push({
          id: relativePath.replace('.md', ''),
          fileName: relativePath,
          documentType: documentType,
          projectName: projectName,
          createdAt: creationTime.toISOString(),
          // Content will be loaded when a specific document is requested
          content: null,
          // Include folder information for organization
          folder: folderName
        });
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
        // Continue processing other files even if one fails
      }
    }
  });
  
  return documents;
}

// Handle chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, projectDetails } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }
    
    // Load the workflow template to guide the AI response
    const metaWorkflowTemplate = loadTemplate('meta-workflow-integration-template.md');
    
    // Build the system message with instructions for documentation generation
    const systemMessage = {
      role: 'system',
      content: `You are a technical documentation assistant that helps users create comprehensive project documentation following the Windsurf Meta-Workflow methodology. 
      
Your task is to generate detailed technical documentation based on the user's project description and requirements.

Follow these guidelines:
1. Use the provided template structure for consistency
2. Ask clarifying questions if the user's input lacks detail
3. Generate thorough, detailed content for each section of the documentation
4. Include memory context and version history as per Windsurf methodology
5. Incorporate self-critique sections as described in the methodology
6. Format the content properly using Markdown

The Windsurf Meta-Workflow Template provides the structure to follow:

${metaWorkflowTemplate ? metaWorkflowTemplate : "Template not available, use standard documentation structure."}

If the user asks for a specific document type (like "Project Overview" or "Tech Stack"), focus on generating that document. Otherwise, help them determine what documentation they need.

Always include a "Memory Context" section that shows relationships with other documents, a "Version History" table, and a "Documentation Self-Critique" section in the generated documentation.`
    };
    
    // Add system message to the beginning of messages array
    const allMessages = [systemMessage, ...messages];
    
    // Make API request to OpenAI
    const apiUrl = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
    const modelName = process.env.MODEL_NAME || 'gpt-4.1-nano';
    
    if (projectDetails && projectDetails.generateAll && projectDetails.name) {
      // Create project folder
      const projectPath = generateProjectFolder(projectDetails.name);
      const savedFilePaths = [];
      
      // Generate each document type
      for (const docType of documentationTypes) {
        // Create a modified message specifically for this document type
        const docTypeMessage = {
          role: 'user',
          content: `Please generate the "${docType.name}" documentation for my project named "${projectDetails.name}". Here's the information about my project: ${messages[messages.length - 1].content}`
        };
        
        // Create a specific message array for this document type
        const docTypeMessages = [systemMessage];
        
        // Only add previous conversation context if it exists and makes sense
        if (messages.length > 1) {
          docTypeMessages.push(...messages.slice(0, -1));
        }
        
        // Add the document-specific request
        docTypeMessages.push(docTypeMessage);
        
        // Call OpenAI API for this document type
        const completion = await openai.chat.completions.create({
          messages: docTypeMessages,
          model: modelName,
          temperature: 0.7,
          max_tokens: 4000,
        });
        
        const generatedContent = completion.choices[0].message.content;
        
        // Save the document
        const filename = generateFilename(docType.id);
        const filePath = saveDocumentation(projectPath, filename, generatedContent);
        
        savedFilePaths.push({
          type: docType.name,
          path: path.relative(path.join(__dirname, '..'), filePath)
        });
      }
      
      // Create index.md in the project folder
      const indexContent = `# ${projectDetails.name} - Documentation Index\n\n` +
        `Generated on: ${new Date().toLocaleString()}\n\n` +
        `## Document Types\n\n` +
        savedFilePaths.map(file => `- [${file.type}](./${path.basename(file.path)})`).join('\n');
      
      const indexPath = saveDocumentation(projectPath, 'index.md', indexContent);
      savedFilePaths.push({
        type: 'Index',
        path: path.relative(path.join(__dirname, '..'), indexPath)
      });
      
      // Return all saved file paths
      res.json({
        message: {
          role: 'assistant',
          content: `All documentation has been generated for "${projectDetails.name}" and saved to the project folder. You can access the documents here: ${savedFilePaths.map(file => file.path).join(', ')}`
        },
        filePaths: savedFilePaths,
        projectPath: path.relative(path.join(__dirname, '..'), projectPath)
      });
    } else {
      // Single document generation (original behavior)
      const completion = await openai.chat.completions.create({
        messages: allMessages,
        model: modelName,
        temperature: 0.7,
        max_tokens: 4000,
      });
      
      const generatedContent = completion.choices[0].message.content;
      let filePath = null;
      
      // Save the documentation if a project name is provided
      if (projectDetails && projectDetails.name && projectDetails.documentType) {
        const projectPath = generateProjectFolder(projectDetails.name);
        const filename = generateFilename(projectDetails.documentType);
        filePath = saveDocumentation(projectPath, filename, generatedContent);
      }
      
      res.json({
        message: completion.choices[0].message,
        filePath: filePath ? path.relative(path.join(__dirname, '..'), filePath) : null
      });
    }
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

// Routes for documentation types
app.get('/api/documentation-types', (req, res) => {
  res.json(documentationTypes);
});

// Start server
app.listen(PORT, () => {
  console.log(`Documentation chatbot server running on port ${PORT}`);
}); 