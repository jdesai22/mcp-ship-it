import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the output directory relative to the project root
const outputDir = path.resolve(process.cwd(), 'output-docs');

export async function GET(
  request: Request, 
  { params }: { params: { docId: string[] } }
) {
  // Now access docId from the destructured params
  const { docId } = params;
  if (!docId || !Array.isArray(docId)) {
      return NextResponse.json({ error: 'Invalid document ID format' }, { status: 400 });
  }

  const relativePath = docId.join('/');
  const fileName = relativePath + '.md';
  const filePath = path.join(outputDir, fileName);

  console.log(`Attempting to read document: ${filePath}`);

  try {
    // Basic security check: Ensure the path doesn't try to escape the outputDir
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(outputDir)) {
      console.warn(`Attempted path traversal: ${filePath}`);
      return NextResponse.json({ error: 'Invalid document path' }, { status: 400 });
    }

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const stat = fs.statSync(filePath);
      return NextResponse.json({
        id: relativePath,
        fileName: fileName,
        content: content,
        createdAt: stat.birthtime?.toISOString() || stat.mtime.toISOString(),
      });
    } else {
      console.log(`Document not found: ${filePath}`);
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Error reading document ${filePath}:`, error);
    return NextResponse.json({ error: 'Failed to read document' }, { status: 500 });
  }
} 