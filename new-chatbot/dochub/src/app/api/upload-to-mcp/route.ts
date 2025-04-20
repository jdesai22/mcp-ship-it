import { NextRequest, NextResponse } from 'next/server';
import { uploadToMcp } from '@/lib/server/mcp';

export async function POST(request: NextRequest) {
  try {
    const { projectName } = await request.json();
    
    if (!projectName) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }
    
    // Upload the project's documents to MCP
    const result = await uploadToMcp(projectName);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error uploading to MCP:', error);
    return NextResponse.json(
      { error: 'Failed to upload documents to MCP server' },
      { status: 500 }
    );
  }
} 