import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the output directory relative to the project root
const outputDir = path.resolve(process.cwd(), '..', 'output-docs');

export async function GET(
  request: Request, 
  { params }: { params: { docId: string[] } }
) {
  // Add debugging to understand the docId structure 
  console.log('Document API called with params:', JSON.stringify(params));
  
  // More robustly extract docId, with better error handling
  try {
    const { docId } = params;
    
    // Validate docId parameter
    if (!docId || !Array.isArray(docId)) {
      console.error('Invalid docId format:', docId);
      return NextResponse.json({ error: 'Invalid document ID format' }, { status: 400 });
    }
    
    if (docId.length === 0) {
      console.error('Empty docId array');
      return NextResponse.json({ error: 'Document ID cannot be empty' }, { status: 400 });
    }

    // Build the document path
    const relativePath = docId.join('/');
    const fileName = relativePath + '.md';
    const filePath = path.join(outputDir, fileName);

    console.log(`Attempting to read document: ${filePath}`);

    // Basic security check: Ensure the path doesn't try to escape the outputDir
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(outputDir)) {
      console.warn(`Attempted path traversal: ${filePath}`);
      return NextResponse.json({ error: 'Invalid document path' }, { status: 400 });
    }

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const stat = fs.statSync(filePath);
      
      // Extract folder information for the response
      const folder = path.dirname(relativePath);
      const projectName = folder.split('/')[0] || null;
      
      return NextResponse.json({
        id: relativePath,
        fileName: fileName,
        content: content,
        createdAt: stat.birthtime?.toISOString() || stat.mtime.toISOString(),
        folder: folder !== '.' ? folder : null,
        projectName: projectName,
      });
    } else {
      console.log(`Document not found: ${filePath}`);
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
  } catch (error: any) {
    // Better error logging
    console.error(`Error in document API:`, error);
    console.error(`Stack trace:`, error.stack);
    return NextResponse.json({ 
      error: 'Failed to read document', 
      details: error.message 
    }, { status: 500 });
  }
} 