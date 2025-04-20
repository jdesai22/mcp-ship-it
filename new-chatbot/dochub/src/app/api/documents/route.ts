import { NextRequest, NextResponse } from 'next/server';
import { getAllDocuments, getDocumentById, deleteDocumentById } from '@/lib/server/documents';

export const runtime = 'nodejs';

// Sample data (in a real app, this would come from a database)
const sampleDocuments = [
  {
    id: "1",
    fileName: "project-overview.md",
    documentType: "ProjectOverview",
    projectName: "Sample Project",
    createdAt: new Date().toISOString(),
    content: "# Project Overview\n\nThis is a sample project overview document."
  },
  {
    id: "2",
    fileName: "tech-stack.md",
    documentType: "TechStack",
    projectName: "Sample Project",
    createdAt: new Date().toISOString(),
    content: "# Tech Stack\n\nThis is a sample tech stack document."
  },
  {
    id: "3",
    fileName: "user-flows.md",
    documentType: "UserFlow",
    projectName: "Sample Project",
    createdAt: new Date().toISOString(),
    content: "# User Flows\n\nThis is a sample user flows document."
  }
];

export async function GET(request: NextRequest) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Get a specific document by ID
      const document = getDocumentById(id);
      
      if (!document) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(document);
    }
    
    // Get all documents
    const documents = getAllDocuments();
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    // Delete the document
    const success = deleteDocumentById(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Document not found or could not be deleted' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
} 