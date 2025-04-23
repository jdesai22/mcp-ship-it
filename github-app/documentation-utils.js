import fs from "fs";
import { validFileExtensions, templatesDir } from "./config.js";
import { getFilesRecursively, getFileContent } from "./github-utils.js";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configure OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Document types for generating technical documentation
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

/**
 * Ensure output directories exist
 * @param {string} repoName - Repository name
 * @returns {Object} - Information about repo directory
 */
function ensureOutputDirectories(repoName) {
  // Create output_docs directory if it doesn't exist
  if (!fs.existsSync('./output_docs')) {
    fs.mkdirSync('./output_docs', { recursive: true });
  }
  
  // Check if repository folder exists in output_docs
  const repoFolder = `./output_docs/${repoName}`;
  const repoFolderExists = fs.existsSync(repoFolder);
  
  // Create repo folder if it doesn't exist
  if (!repoFolderExists) {
    fs.mkdirSync(repoFolder, { recursive: true });
    console.log(`Created repository folder: ${repoFolder}`);
  }

  return { repoFolder, repoFolderExists };
}

/**
 * Load or create file contents dictionary
 * @param {string} repoFolder - Path to repository folder
 * @returns {Object} - File contents dictionary
 */
function loadFileDictionary(repoFolder) {
  let fileContentsDict = {};
  const dictionaryFilePath = `${repoFolder}/file_dictionary.json`;
  
  // If the dictionary file exists, load it
  if (fs.existsSync(dictionaryFilePath)) {
    try {
      fileContentsDict = JSON.parse(fs.readFileSync(dictionaryFilePath, 'utf8'));
      console.log(`Loaded existing file dictionary from ${dictionaryFilePath}`);
    } catch (error) {
      console.error(`Error loading existing file dictionary: ${error.message}`);
    }
  }

  return { fileContentsDict, dictionaryFilePath };
}

/**
 * Scan repository and update file dictionary
 * @param {Object} octokit - Octokit instance
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name 
 * @param {string} branch - Branch name
 * @param {Object} fileContentsDict - File contents dictionary
 * @returns {Object} - Updated file contents dictionary
 */
async function scanRepository(octokit, owner, repo, branch, fileContentsDict) {
  console.log(`Scanning repository for ${validFileExtensions.join(', ')} files...`);
  
  // Get all files in the repository
  const files = await getFilesRecursively(octokit, owner, repo, '', branch);
  
  // Filter files to only include files with valid extensions
  const filteredFiles = files.filter(file => {
    const fileName = file.path.toLowerCase();
    return validFileExtensions.some(ext => fileName.endsWith(ext));
  });
  
  // Fetch and store the content of each file
  for (const file of filteredFiles) {
    try {
      console.log(`Fetching content for ${file.path}...`);
      const content = await getFileContent(octokit, owner, repo, file.path, branch);
      fileContentsDict[file.path] = content;
    } catch (error) {
      console.error(`Error processing ${file.path}: ${error.message}`);
      fileContentsDict[file.path] = `Error: ${error.message}`;
    }
  }
  
  console.log(`Repository ${validFileExtensions.join(', ')} files scanned: ${Object.keys(fileContentsDict).length}`);
  
  return fileContentsDict;
}

/**
 * Create a task document from a commit
 * @param {Object} commit - Commit data
 * @param {string} branch - Branch name
 * @param {string} repoFolder - Repository folder path
 * @param {Object} octokit - Octokit instance
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {boolean} isMainBranch - Whether branch is main
 * @param {Object} fileContentsDict - File content dictionary
 * @returns {Object} - Information about processing
 */
async function createTaskDocument(commit, branch, repoFolder, octokit, owner, repo, isMainBranch, fileContentsDict) {
  const sha = commit.id;
  const shortSha = sha.substring(0, 7);
  const message = commit.message;
  const author = commit.author.name;
  const timestamp = commit.timestamp;
  
  // Get file extensions from modified files (for tags)
  const fileExtensions = new Set();
  const modifiedFiles = commit.modified || [];
  modifiedFiles.forEach(file => {
    const ext = file.match(/\.([^.]+)$/);
    if (ext) {
      fileExtensions.add(ext[1]);
    }
  });
  
  // Create tags from branch and file extensions
  const tags = [`branch:${branch}`, ...Array.from(fileExtensions).map(ext => `lang:${ext}`)];
  
  // Extract title from the commit message (first line)
  const title = message.split('\n')[0];
  
  // Sanitize title for YAML frontmatter
  const sanitizedTitle = title.replace(/"/g, '\\"');
  
  // Create safe filenames
  const filenameSafeTitle = title
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 50)
    .trim();
  
  const filenameSafeBranch = branch
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .trim();
  
  console.log(`Processing commit: ${shortSha}`);
  console.log(`Author: ${author}`);
  console.log(`Date: ${timestamp}`);
  console.log(`Message: ${title}`);
  console.log(`Branch: ${branch}`);
  
  // Prepare content for the task markdown file with frontmatter
  let taskContent = `---
title: "${sanitizedTitle}"
date: "${timestamp}"
author: "${author}"
commit: "${sha}"
shortCommit: "${shortSha}"
branch: "${branch}"
tags: [${tags.map(tag => `"${tag}"`).join(', ')}]
files:
${modifiedFiles.map(file => `  - "${file}"`).join('\n')}
---

# Task: ${title}\n\n`;
  taskContent += `## Commit Details\n\n`;
  taskContent += `- **Commit:** ${sha}\n`;
  taskContent += `- **Author:** ${author}\n`;
  taskContent += `- **Date:** ${timestamp}\n`;
  taskContent += `- **Branch:** ${branch}\n\n`;
  taskContent += `## Commit Message\n\n\`\`\`\n${message}\n\`\`\`\n\n`;
  taskContent += `## Modified Files\n\n`;
  
  // Track if any valid extension files were modified
  let validFileModified = false;
  
  // Process only the modified files from this commit
  if (modifiedFiles.length > 0) {
    console.log(`Files modified in this commit: ${modifiedFiles.length}`);
    
    // Log the content of the files that were changed
    for (const modifiedFile of modifiedFiles) {
      console.log(`Processing modified file: ${modifiedFile}`);
      taskContent += `### ${modifiedFile}\n\n`;
      
      try {
        const content = await getFileContent(octokit, owner, repo, modifiedFile, sha);
        
        // Add file content to task markdown
        taskContent += `\`\`\`\n${content}\n\`\`\`\n\n`;
        
        // If this is a file with a valid extension, update our dictionary
        const isValidExtension = validFileExtensions.some(ext => 
          modifiedFile.toLowerCase().endsWith(ext)
        );
        
        if (isValidExtension) {
          validFileModified = true;
          // Only update dictionary if on main branch
          if (isMainBranch) {
            console.log(`Updating dictionary with changes to ${modifiedFile}`);
            fileContentsDict[modifiedFile] = content;
          }
        }
      } catch (error) {
        console.error(`Error fetching content for ${modifiedFile}: ${error.message}`);
        taskContent += `*Error fetching content: ${error.message}*\n\n`;
      }
    }
  } else {
    taskContent += `*No files were modified in this commit.*\n\n`;
  }
  
  // Write the task markdown file
  const taskFilename = `${repoFolder}/task_${filenameSafeBranch}_${filenameSafeTitle}_${shortSha}.md`;
  fs.writeFileSync(taskFilename, taskContent);
  console.log(`Task documentation created: ${taskFilename}`);
  
  return { validFileModified, fileContentsDict };
}

/**
 * Save file dictionary if necessary
 * @param {boolean} isMainBranch - Whether branch is main
 * @param {Object} fileContentsDict - File contents dictionary 
 * @param {string} dictionaryFilePath - Path to dictionary file
 */
function saveFileDictionary(isMainBranch, fileContentsDict, dictionaryFilePath) {
  if (isMainBranch && Object.keys(fileContentsDict).length > 0) {
    fs.writeFileSync(dictionaryFilePath, JSON.stringify(fileContentsDict, null, 2));
    console.log(`Updated file dictionary saved to ${dictionaryFilePath}`);
  }
}

/**
 * Load template from templates directory
 * @param {string} templateName - Name of the template file
 * @returns {string|null} - Template content
 */
function loadTemplate(templateName) {
  try {
    const templatePath = path.join(process.cwd(), templatesDir, templateName);
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf8');
    }
    return null;
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    return null;
  }
}

/**
 * Generate filename based on document type
 * @param {string} docType - Document type ID
 * @returns {string} - Generated filename
 */
function generateFilename(docType) {
  return `${docType.toLowerCase()}.md`;
}

/**
 * Save documentation to file
 * @param {string} projectPath - Path to project directory
 * @param {string} filename - Name of the file
 * @param {string} content - Content to save
 * @returns {string} - Path to saved file
 */
function saveDocumentation(projectPath, filename, content) {
  const filePath = path.join(projectPath, filename);
  fs.writeFileSync(filePath, content);
  return filePath;
}

/**
 * Clean the generated content by removing introductory and concluding remarks
 * @param {string} content - The raw content from the LLM
 * @return {string} - The cleaned content
 */
function cleanGeneratedContent(content) {
  // Remove any "Thank you for..." or "Based on your inputs..." introductory text
  content = content.replace(/^(Thank you for.*?\n|Based on your inputs.*?\n|I will now generate.*?\n)+/i, '');
  
  // Remove any markdown separator at the beginning if it exists
  content = content.replace(/^---\n/, '');
  
  // Remove any concluding questions or offers for additional help
  content = content.replace(/\n+(Would you like me to.*?|Let me know if.*?|Do you need.*?|I can also.*?)$/i, '');
  
  // If there's a trailing markdown separator, keep the content before it
  const lastSeparatorIndex = content.lastIndexOf('\n---\n');
  if (lastSeparatorIndex > content.length / 2) { // Only trim if separator is in the latter half
    content = content.substring(0, lastSeparatorIndex);
  }
  
  return content.trim();
}

/**
 * Generate technical documentation for a repository using OpenAI and file dictionary
 * @param {string} repoName - Repository name
 * @param {Object} octokit - Octokit instance
 * @param {string} owner - Repository owner
 * @param {boolean} isFirstPush - Whether this is the first push to main
 * @returns {Promise<Object>} - Information about generated documentation
 */
async function genTechnicalDocs(repoName, octokit, owner, isFirstPush) {
  try {
    console.log(`Generating technical documentation for ${repoName}...`);
    
    // Skip if this is not the first push to main
    if (!isFirstPush) {
      console.log('Not the first push to main branch. Skipping technical documentation generation.');
      return { success: false, reason: 'Not the first push to main branch' };
    }
    
    // Ensure we have a repo folder and load the file dictionary
    const { repoFolder } = ensureOutputDirectories(repoName);
    const { fileContentsDict, dictionaryFilePath } = loadFileDictionary(repoFolder);
    
    // Check if dictionary exists and has content
    if (!fs.existsSync(dictionaryFilePath) || Object.keys(fileContentsDict).length === 0) {
      console.error('File dictionary not found or empty. Cannot generate documentation.');
      return { success: false, reason: 'File dictionary not found or empty' };
    }
    
    // Create docs directory within repo folder
    const docsFolder = path.join(repoFolder, 'docs');
    if (!fs.existsSync(docsFolder)) {
      fs.mkdirSync(docsFolder, { recursive: true });
    }
    
    // Load the meta-workflow template
    const metaWorkflowTemplate = loadTemplate('meta-workflow-integration-template.md');
    if (!metaWorkflowTemplate) {
      console.error('Meta workflow template not found. Using default template structure.');
    }
    
    // Prepare the repo context from file dictionary
    const repoContext = prepareRepoContext(fileContentsDict);
    
    // Create the system message with instructions
    const systemMessage = {
      role: 'system',
      content: `You are a technical documentation assistant that helps create comprehensive project documentation following the Windsurf Meta-Workflow methodology. 
      
Your task is to generate detailed technical documentation based on the repository's code and structure.

Follow these guidelines:
1. Use the provided template structure for consistency
2. Generate thorough, detailed content for each section of the documentation
3. Include memory context and version history as per Windsurf methodology
4. Incorporate self-critique sections as described in the methodology
5. Format the content properly using Markdown

The Windsurf Meta-Workflow Template provides the structure to follow:

${metaWorkflowTemplate ? metaWorkflowTemplate : "Template not available, use standard documentation structure."}

Always include a "Memory Context" section that shows relationships with other documents, a "Version History" table, and a "Documentation Self-Critique" section in the generated documentation.`
    };
    
    const savedFilePaths = [];
    
    // Generate each document type
    for (const docType of documentationTypes) {
      console.log(`Generating ${docType.name} documentation...`);
      
      // Create a specific message for this document type
      const docTypeMessage = {
        role: 'user',
        content: `Please generate the "${docType.name}" documentation for the repository named "${repoName}". 
        
Here's the information about the repository code and structure:

${repoContext}

IMPORTANT: Provide ONLY the markdown content for the documentation. Do not include any introductory text or concluding text. Start directly with the markdown content and end with the last relevant section.`
      };
      
      // Create message array for this document type
      const docTypeMessages = [systemMessage, docTypeMessage];
      
      // Call OpenAI API
      const modelName = process.env.MODEL_NAME || 'gpt-4.1-nano';
      
      try {
        const completion = await openai.chat.completions.create({
          messages: docTypeMessages,
          model: modelName,
          temperature: 0.7,
          max_tokens: 4000,
        });
        
        let generatedContent = completion.choices[0].message.content;
        
        // Clean the content
        generatedContent = cleanGeneratedContent(generatedContent);
        
        // Save the document
        const filename = generateFilename(docType.id);
        const filePath = saveDocumentation(docsFolder, filename, generatedContent);
        
        savedFilePaths.push({
          type: docType.name,
          path: path.relative(process.cwd(), filePath)
        });
        
        console.log(`Generated and saved ${docType.name} documentation.`);
      } catch (error) {
        console.error(`Error generating ${docType.name} documentation:`, error);
      }
    }
    
    // Create index.md in the docs folder
    const indexContent = `# ${repoName} - Documentation Index\n\n` +
      `Generated on: ${new Date().toLocaleString()}\n\n` +
      `## Document Types\n\n` +
      savedFilePaths.map(file => `- [${file.type}](./${path.basename(file.path)})`).join('\n');
    
    const indexPath = saveDocumentation(docsFolder, 'index.md', indexContent);
    savedFilePaths.push({
      type: 'Index',
      path: path.relative(process.cwd(), indexPath)
    });
    
    console.log(`Technical documentation generation completed for ${repoName}.`);
    return {
      success: true,
      filePaths: savedFilePaths,
      docsFolder: path.relative(process.cwd(), docsFolder)
    };
  } catch (error) {
    console.error('Error generating technical documentation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Prepare repository context from file dictionary for the LLM
 * @param {Object} fileContentsDict - File contents dictionary
 * @returns {string} - Formatted repository context
 */
function prepareRepoContext(fileContentsDict) {
  const files = Object.keys(fileContentsDict);
  
  if (files.length === 0) {
    return 'No files found in the repository.';
  }
  
  let context = `The repository contains ${files.length} files:\n\n`;
  
  // Add file list with extensions
  context += '## File Structure\n\n';
  files.forEach(filePath => {
    context += `- ${filePath}\n`;
  });
  
  // Add file contents (limit to prevent token overflow)
  context += '\n## File Contents\n\n';
  files.forEach((filePath, index) => {
    if (index < 30) { // Limit number of files to include full content
      context += `### ${filePath}\n\n\`\`\`\n${fileContentsDict[filePath]}\n\`\`\`\n\n`;
    }
  });
  
  // If more than 30 files, include summary of remaining files
  if (files.length > 30) {
    context += `\n\n...and ${files.length - 30} more files (not shown for brevity).\n\n`;
  }
  
  return context;
}

export {
  ensureOutputDirectories,
  loadFileDictionary,
  scanRepository,
  createTaskDocument,
  saveFileDictionary,
  genTechnicalDocs
}; 