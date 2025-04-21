'use client';

import React from 'react';
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Import toast

export default function ProjectView() {
  const {
    selectedProjectId,
    documents,
    isLoadingDocs,
    docListError,
    navigateToDocument,
    navigateToDashboard, // Action to go back
    uploadProjectToMcp, // Get upload action
    actionLoading, // Get loading state
  } = useAppContext();

  const handleUpload = async () => {
    if (!selectedProjectId) return;

    toast.info(`Uploading documents for ${selectedProjectId} to MCP...`);
    try {
      const result = await uploadProjectToMcp(selectedProjectId);
      toast.success(`Upload complete for ${selectedProjectId}: ${result.message || 'Success'}`,
       {
        description: `Uploaded: ${result.uploadedCount}, Failed: ${result.failedCount}`,
       });
    } catch (error: any) {
      // Global error toast handles detailed message
      console.error('Upload failed:', error);
    }
  };

  if (!selectedProjectId) {
    // Should ideally not happen if view state is managed correctly
    return <p className="text-muted-foreground p-4">No project selected.</p>;
  }

  if (isLoadingDocs) {
    return <p className="text-muted-foreground text-center p-4">Loading project documents...</p>;
  }

  if (docListError) {
    return <p className="text-destructive text-center p-4">Error loading documents: {docListError}</p>;
  }

  // Filter documents for the selected project
  const projectDocuments = documents.filter(doc => doc.projectName === selectedProjectId);
  const uploadActionKey = `uploadMcp_${selectedProjectId}`;
  const isUploading = actionLoading[uploadActionKey];

  return (
    <div className="h-full p-4">
      {/* Header with project name and back button */}
      <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
        <h2 className="text-xl font-semibold interactive-glow truncate">
          Project: {selectedProjectId}
        </h2>
        {/* Group buttons together */}
        <div className="flex space-x-2">
           <Button 
              onClick={handleUpload}
              variant="outline"
              size="sm"
              className="interactive-glow"
              disabled={isUploading || projectDocuments.length === 0}
              title={projectDocuments.length === 0 ? "No documents to upload" : "Upload all project documents to MCP server"}
            >
              {isUploading ? 'Uploading...' : 'Upload to MCP'}
            </Button>
            <Button 
                variant="outline"
                size="sm"
                onClick={navigateToDashboard} // Go back to dashboard view
                className="interactive-glow"
                disabled={isUploading} // Disable while uploading
              >
                [ Back to Projects ]
            </Button>
        </div>
      </div>

      {/* Document List for the project */}
      <div className="space-y-3">
        {projectDocuments.length === 0 && (
          <p className="text-muted-foreground text-center">No documents found for this project.</p>
        )}
        {projectDocuments.map((doc) => (
          <div 
            key={doc.id}
            className="border border-border rounded p-3 flex justify-between items-center cursor-pointer interactive-glow hover:border-primary focus:border-primary transition-colors duration-150"
            onClick={() => navigateToDocument(doc.id)} // Use context action
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && navigateToDocument(doc.id)}
            title={`View document: ${doc.fileName}`}
          >
            <div>
              {/* Display filename without the project path prefix */}
              <h3 className="font-semibold text-foreground">{doc.fileName.split('/').pop() || doc.documentType}</h3>
              <p className="text-xs text-muted-foreground">
                Created: {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className="text-sm text-primary">[View Doc]</span>
          </div>
        ))}
      </div>
       {/* Placeholder for project-specific actions like Upload to MCP */}
       <div className="mt-6 text-center">
          {/* Example: <Button variant="outline" className="interactive-glow">Upload all to MCP</Button> */}
       </div>
    </div>
  );
} 