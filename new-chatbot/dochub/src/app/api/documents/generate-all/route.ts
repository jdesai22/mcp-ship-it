import { NextRequest, NextResponse } from 'next/server';
import { generateAllDocuments } from '@/lib/server/openai';
import { saveDocumentation, generateProjectFolder, generateFilename } from '@/lib/server/documents';
import { documentationTypes } from '@/lib/server/templates';
import path from 'path';

// Document types
const documentTypes = [
  'ProjectOverview',
  'Features',
  'Requirements',
  'TechStack',
  'Dependencies',
  'UserFlow',
  'Implementation',
  'ProjectStructure'
];

export async function POST(request: NextRequest) {
  try {
    const { projectName, conversationContext } = await request.json();

    if (!projectName) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Create project folder
    const projectPath = generateProjectFolder(projectName);
    
    // Generate all documents using OpenAI
    const generatedDocuments = await generateAllDocuments(
      conversationContext || [],
      projectName,
      documentationTypes
    );

    // Save all documents and create response array
    const documents = generatedDocuments.map(doc => {
      const filename = generateFilename(doc.documentType);
      const filePath = saveDocumentation(projectPath, filename, doc.content);
      
      return {
        id: path.join(path.basename(projectPath), path.basename(filePath, '.md')),
        fileName: filename,
        documentType: doc.documentType,
        projectName,
        createdAt: new Date().toISOString(),
        content: doc.content
      };
    });

    // Create index.md in the project folder
    const indexContent = `# ${projectName} - Documentation Index\n\n` +
      `Generated on: ${new Date().toLocaleString()}\n\n` +
      `## Document Types\n\n` +
      documents.map(doc => `- [${doc.documentType}](./${doc.fileName})`).join('\n');
    
    const indexPath = saveDocumentation(projectPath, 'index.md', indexContent);
    
    documents.push({
      id: path.join(path.basename(projectPath), 'index'),
      fileName: 'index.md',
      documentType: 'Index',
      projectName,
      createdAt: new Date().toISOString(),
      content: indexContent
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error generating documents:', error);
    return NextResponse.json(
      { error: 'Failed to generate documents' },
      { status: 500 }
    );
  }
} 