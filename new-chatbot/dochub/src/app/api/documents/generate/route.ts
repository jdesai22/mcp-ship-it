import { NextRequest, NextResponse } from 'next/server';
import { generateDocument } from '@/lib/server/openai';
import { saveDocumentation, generateProjectFolder, generateFilename } from '@/lib/server/documents';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { projectName, documentType, conversationContext } = await request.json();

    if (!projectName || !documentType) {
      return NextResponse.json(
        { error: 'Project name and document type are required' },
        { status: 400 }
      );
    }

    // Use OpenAI to generate the document content
    const { content } = await generateDocument(
      conversationContext || [],
      projectName,
      documentType
    );

    // Save the document to the project folder
    const projectPath = generateProjectFolder(projectName);
    const filename = generateFilename(documentType);
    const filePath = saveDocumentation(projectPath, filename, content);

    // Create document object
    const document = {
      id: path.join(path.basename(projectPath), path.basename(filePath, '.md')),
      fileName: filename,
      documentType,
      projectName,
      createdAt: new Date().toISOString(),
      content,
    };

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error generating document:', error);
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    );
  }
} 