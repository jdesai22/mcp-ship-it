"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { DocumentCard } from "@/components/DocumentCard";
import { ProjectForm } from "@/components/ProjectForm";
import { toast } from "sonner";

interface Document {
  id: string;
  fileName: string;
  documentType: string;
  projectName: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [activeProjectName, setActiveProjectName] = useState<string>("");
  const [activeDocType, setActiveDocType] = useState<string>("");
  const [showChat, setShowChat] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      fileName: "project-overview.md",
      documentType: "ProjectOverview",
      projectName: "Sample Project",
      createdAt: new Date().toISOString()
    },
    {
      id: "2",
      fileName: "tech-stack.md",
      documentType: "TechStack",
      projectName: "Sample Project",
      createdAt: new Date().toISOString()
    },
    {
      id: "3",
      fileName: "user-flows.md",
      documentType: "UserFlow",
      projectName: "Sample Project",
      createdAt: new Date().toISOString()
    }
  ]);

  const handleCreateProject = (data: { name: string; description: string }) => {
    setActiveProjectName(data.name);
    setShowChat(true);
    toast.success(`Project "${data.name}" created successfully!`);
  };

  const handleDocTypeSelect = (docType: string) => {
    setActiveDocType(docType);
    setShowChat(true);
  };

  const handleViewDocument = (id: string) => {
    toast.info("Document viewer will be implemented in the next phase");
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(docs => docs.filter(doc => doc.id !== id));
    toast.success("Document deleted successfully");
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          projectName={activeProjectName} 
          activeDocType={activeDocType}
          onDocTypeSelect={handleDocTypeSelect} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {showChat ? (
            <ChatInterface />
          ) : (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-2xl font-bold">Document Dashboard</h1>
                  <ProjectForm onSubmit={handleCreateProject} />
                </div>
                
                <div className="mb-10">
                  <h2 className="text-lg font-semibold mb-4">Recent Documents</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map(doc => (
                      <DocumentCard
                        key={doc.id}
                        id={doc.id}
                        fileName={doc.fileName}
                        documentType={doc.documentType}
                        projectName={doc.projectName}
                        createdAt={doc.createdAt}
                        onView={handleViewDocument}
                        onDelete={handleDeleteDocument}
                      />
                    ))}
                  </div>
                </div>
                
                {documents.length === 0 && (
                  <div className="text-center py-12">
                    <div className="h-20 w-20 rounded-full bg-card mx-auto flex items-center justify-center mb-4">
                      <svg 
                        className="h-10 w-10 text-muted-foreground" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1.5} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No documents yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Create a new project to generate documentation
                    </p>
                    <ProjectForm onSubmit={handleCreateProject} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 