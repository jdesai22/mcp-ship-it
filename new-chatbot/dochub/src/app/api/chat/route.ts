import { NextRequest, NextResponse } from 'next/server';
import { generateDocument } from '@/lib/server/openai';
import { saveDocumentation, generateProjectFolder, generateFilename } from '@/lib/server/documents';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { messages, projectDetails } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }
    
    // Generate document using OpenAI
    const { content, message } = await generateDocument(
      messages, 
      projectDetails?.name,
      projectDetails?.documentType
    );
    
    let filePath = null;
    
    // Save the documentation if a project name is provided
    if (projectDetails?.name && projectDetails?.documentType) {
      const projectPath = generateProjectFolder(projectDetails.name);
      const filename = generateFilename(projectDetails.documentType);
      filePath = saveDocumentation(projectPath, filename, content);
    }
    
    return NextResponse.json({
      message,
      filePath: filePath ? path.basename(filePath) : null
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 