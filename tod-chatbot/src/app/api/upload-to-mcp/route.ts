import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the output directory relative to the project root
const outputDir = path.resolve(process.cwd(), 'output-docs');

// Helper to sanitize project name for directory path
const sanitizeProjectName = (name: string): string => {
    return name.replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase();
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectName } = body;

    if (!projectName) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const sanitizedProjectName = sanitizeProjectName(projectName);
    const projectPath = path.join(outputDir, sanitizedProjectName);

    console.log(`Attempting to upload documents from: ${projectPath}`);

    // Check if project directory exists
    if (!fs.existsSync(projectPath)) {
      console.warn(`Project directory not found: ${projectPath}`);
      return NextResponse.json({ error: `Project '${projectName}' not found` }, { status: 404 });
    }

    const uploadResults: { fileName: string; success: boolean; status?: number; error?: string }[] = [];
    const failedUploads: { fileName: string; status?: number; error: string }[] = [];
    let markdownFiles: string[] = [];

    try {
        // Get all markdown files in the project directory
        const files = fs.readdirSync(projectPath);
        markdownFiles = files.filter(file => file.endsWith('.md'));
    } catch (readDirError: any) {
        console.error(`Error reading project directory ${projectPath}:`, readDirError);
        return NextResponse.json({ error: 'Failed to read project directory', details: readDirError.message }, { status: 500 });
    }

    // Get MCP server URL from environment variables or use a default
    const mcpUrl = process.env.MCP_URL || "http://localhost:8000/context"; // Default for local dev
    
    console.log(`Uploading ${markdownFiles.length} files to MCP server: ${mcpUrl}`);

    // Upload each file
    for (const fileName of markdownFiles) {
      const filePath = path.join(projectPath, fileName);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const stat = fs.statSync(filePath);

        // Construct payload matching the expected format of the MCP server
        const payload = {
          // Use the relative path from outputDir as ID
          id: path.join(sanitizedProjectName, fileName).replace(/\\/g, '/'), 
          type: "text/markdown",
          content: content,
          created_at: stat.birthtime?.toISOString() || stat.mtime.toISOString(), // Use file creation/modification time
          metadata: { // Optional: Add some context
            projectName: projectName, 
            originalFileName: fileName
          }
        };

        // Send to MCP server using fetch
        const response = await fetch(mcpUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          console.log(`Successfully uploaded ${fileName}`);
          uploadResults.push({ fileName, success: true });
        } else {
          const errorText = await response.text();
          console.error(`Failed to upload ${fileName}. Status: ${response.status}, Error: ${errorText}`);
          failedUploads.push({ fileName, status: response.status, error: errorText || `HTTP Error ${response.status}` });
          uploadResults.push({ fileName, success: false, status: response.status, error: errorText || `HTTP Error ${response.status}` });
        }
      } catch (uploadError: any) {
        console.error(`Error during upload of ${fileName}:`, uploadError);
        failedUploads.push({ fileName, error: uploadError.message });
        uploadResults.push({ fileName, success: false, error: uploadError.message });
      }
    }

    console.log(`Upload complete. Success: ${uploadResults.filter(r=>r.success).length}, Failed: ${failedUploads.length}`);

    // Return detailed results
    return NextResponse.json({
      success: failedUploads.length === 0,
      message: `Uploaded ${uploadResults.filter(r=>r.success).length} of ${markdownFiles.length} documents to ${mcpUrl}.`,
      uploadedCount: uploadResults.filter(r=>r.success).length,
      failedCount: failedUploads.length,
      totalFiles: markdownFiles.length,
      details: uploadResults // Provides success/fail status for each file
    });

  } catch (error: any) {
    console.error('Error in upload-to-mcp API:', error);
    return NextResponse.json({ error: 'Failed to process upload request', details: error.message }, { status: 500 });
  }
} 