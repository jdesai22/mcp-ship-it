import fs from 'fs';
import path from 'path';

// Define the path to the output documents directory
const outputDir = process.env.OUTPUT_DOCS_DIR || path.join(process.cwd(), '..', 'output-docs');

// Ensure the output documents directory exists
export const ensureOutputDirectory = (): void => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
};

// Generate project folder path
export const generateProjectFolder = (projectName: string): string => {
  const sanitizedProjectName = projectName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const projectPath = path.join(outputDir, sanitizedProjectName);
  
  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath, { recursive: true });
  }
  
  return projectPath;
};

// Generate filename based on document type
export const generateFilename = (docType: string): string => {
  return `${docType.toLowerCase()}.md`;
};

// Save documentation to file
export const saveDocumentation = (projectPath: string, filename: string, content: string): string => {
  const filePath = path.join(projectPath, filename);
  fs.writeFileSync(filePath, content);
  return filePath;
};

// Get all documents from the output directory
export const getAllDocuments = (dir = outputDir, baseDir = outputDir): any[] => {
  ensureOutputDirectory();
  
  const documents: any[] = [];
  
  try {
    if (!fs.existsSync(dir)) {
      return documents;
    }
    
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
          
          // Use file's creation timestamp
          const creationTime = stat.birthtime || stat.mtime;
          
          // For document type and project name, parse the filename
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
            // Read file content
            content: fs.readFileSync(filePath, 'utf8'),
            // Include folder information for organization
            folder: folderName
          });
        } catch (error) {
          console.error(`Error processing file ${filePath}:`, error);
          // Continue processing other files even if one fails
        }
      }
    });
  } catch (error) {
    console.error('Error listing documents:', error);
  }
  
  return documents;
};

// Get a document by ID (relative path without extension)
export const getDocumentById = (id: string): any | null => {
  try {
    const filePath = path.join(outputDir, `${id}.md`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const stat = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(outputDir, filePath);
    const folderName = path.dirname(relativePath) === '.' ? null : path.dirname(relativePath);
    
    // Get document type from filename
    const filename = path.basename(filePath);
    let documentType = 'doc';
    
    if (filename.includes('-')) {
      documentType = filename.split('-')[0];
    } else {
      documentType = filename.replace('.md', '');
    }
    
    return {
      id,
      fileName: relativePath,
      documentType,
      projectName: folderName,
      createdAt: (stat.birthtime || stat.mtime).toISOString(),
      content,
      folder: folderName
    };
  } catch (error) {
    console.error(`Error getting document ${id}:`, error);
    return null;
  }
};

// Delete a document by ID
export const deleteDocumentById = (id: string): boolean => {
  try {
    const filePath = path.join(outputDir, `${id}.md`);
    
    if (!fs.existsSync(filePath)) {
      return false;
    }
    
    fs.unlinkSync(filePath);
    return true;
  } catch (error) {
    console.error(`Error deleting document ${id}:`, error);
    return false;
  }
};

// Get all documents for a project
export const getProjectDocuments = (projectName: string): any[] => {
  try {
    const projectPath = path.join(outputDir, projectName);
    
    if (!fs.existsSync(projectPath)) {
      return [];
    }
    
    return getAllDocuments(projectPath, outputDir);
  } catch (error) {
    console.error(`Error getting documents for project ${projectName}:`, error);
    return [];
  }
}; 