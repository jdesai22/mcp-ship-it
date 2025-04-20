import fs from 'fs';
import path from 'path';
import { getProjectDocuments } from './documents';

// Define MCP server URL from environment or use default
const mcpUrl = process.env.MCP_URL || 'http://localhost:3000/context';

// Interface for upload result
export interface UploadResult {
  fileName: string;
  success: boolean;
  status?: number;
  error?: string;
}

// Upload documents to MCP server
export const uploadToMcp = async (projectName: string): Promise<{
  success: boolean;
  uploaded: UploadResult[];
  failed: UploadResult[];
  totalUploaded: number;
  totalFailed: number;
  totalFiles: number;
}> => {
  try {
    // Get all documents for the project
    const documents = getProjectDocuments(projectName);
    
    if (!documents.length) {
      return {
        success: false,
        uploaded: [],
        failed: [{ fileName: 'none', success: false, error: 'No documents found' }],
        totalUploaded: 0,
        totalFailed: 1,
        totalFiles: 0
      };
    }
    
    const uploadResults: UploadResult[] = [];
    const failedUploads: UploadResult[] = [];
    
    // Upload each document
    for (const doc of documents) {
      try {
        // Format payload for MCP server
        const payload = {
          id: doc.fileName,
          type: 'text/markdown',
          content: doc.content,
          created_at: doc.createdAt
        };
        
        // Send to MCP server
        const response = await fetch(mcpUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          uploadResults.push({ fileName: doc.fileName, success: true });
        } else {
          const errorText = await response.text();
          failedUploads.push({
            fileName: doc.fileName,
            success: false,
            status: response.status,
            error: errorText
          });
        }
      } catch (error) {
        failedUploads.push({
          fileName: doc.fileName,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return {
      success: failedUploads.length === 0,
      uploaded: uploadResults,
      failed: failedUploads,
      totalUploaded: uploadResults.length,
      totalFailed: failedUploads.length,
      totalFiles: documents.length
    };
  } catch (error) {
    console.error('Error uploading to MCP:', error);
    return {
      success: false,
      uploaded: [],
      failed: [
        {
          fileName: 'error',
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }
      ],
      totalUploaded: 0,
      totalFailed: 1,
      totalFiles: 0
    };
  }
}; 