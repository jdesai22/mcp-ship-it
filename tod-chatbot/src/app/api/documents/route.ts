import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the output directory relative to the project root
// Assumes CWD is the project root when the server runs
const outputDir = path.resolve(process.cwd(), 'output-docs');

// Recursive function to get all markdown documents
function getAllDocuments(dir: string, baseDir: string): any[] {
  const documents: any[] = [];
  try {
    // Ensure the base directory exists
    if (!fs.existsSync(baseDir)) {
      console.log(`Output directory ${baseDir} does not exist. Creating...`);
      fs.mkdirSync(baseDir, { recursive: true });
      return []; // Return empty if dir didn't exist initially
    }
    // Ensure the specific directory to read exists
    if (!fs.existsSync(dir)) {
      console.warn(`Directory ${dir} does not exist.`);
      return [];
    }

    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          // Recursively get documents from subdirectories
          const subdirDocs = getAllDocuments(filePath, baseDir);
          documents.push(...subdirDocs);
        } else if (file.endsWith('.md')) {
          const relativePath = path.relative(baseDir, filePath);
          const folderName = path.dirname(relativePath) === '.' ? null : path.dirname(relativePath);
          const creationTime = stat.birthtime || stat.mtime;

          // Basic parsing - filename without extension as ID and type
          let documentType = file.replace('.md', '');
          const projectName = folderName || 'unknown';

          documents.push({
            id: relativePath.replace(/\\/g, '/').replace('.md', ''), // Use forward slash and remove .md
            fileName: relativePath.replace(/\\/g, '/'), // Use forward slash
            documentType: documentType,
            projectName: projectName,
            createdAt: creationTime.toISOString(),
            content: null, // Content loaded on demand
            folder: folderName?.replace(/\\/g, '/') // Use forward slash
          });
        }
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
        // Continue processing other files
      }
    });
  } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
      // Decide how to handle: re-throw, return empty, etc.
      // Returning empty for now to avoid crashing the request if dir is inaccessible
      return [];
  }

  return documents;
}

export async function GET() {
  try {
    const documents = getAllDocuments(outputDir, outputDir);
    // Sort documents, e.g., by creation date descending
    documents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
} 