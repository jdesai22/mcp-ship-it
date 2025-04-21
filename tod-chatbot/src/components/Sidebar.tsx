'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FileExplorer from '@/components/FileExplorer';
import { useAppContext } from '@/context/AppContext';
import { toast } from "sonner";

// Placeholder type for Project data - will be refined later
interface Project {
  id: string;
  name: string;
  fileCount: number;
}

// Add props interface
interface SidebarProps {
  onFileSelect?: (documentId: string) => void;
}

export default function Sidebar({ onFileSelect }: SidebarProps) {
  const {
    currentView,
    docTypes, 
    currentProjectName,
    setCurrentProjectName,
    selectedDocType,
    setSelectedDocType,
    navigateToChat,
    navigateToDashboard,
    fetchDocuments,
    navigateToProject,
    documents,
    isLoadingDocs,
    sidebarSearchTerm,
    setSidebarSearchTerm,
    generateAllDocuments,
    actionLoading,
  } = useAppContext();

  // Placeholder data - In reality, this would come from props or state management
  const projects: Project[] = [
    { id: '1', name: 'mlb-betting', fileCount: 9 },
    { id: '2', name: 'nba-betting', fileCount: 9 },
    { id: '3', name: 'nfl-betting', fileCount: 9 },
  ];
  const projectsCount = projects.length;

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSidebarSearchTerm(event.target.value);
  };

  const handleCreateNew = () => {
    navigateToChat({ reset: true });
  };

  const handleRefresh = () => {
    fetchDocuments();
  };

  const handleProjectSelect = (projectName: string) => {
    navigateToProject(projectName);
  };

  // Handler for Generate All button
  const handleGenerateAll = async () => {
    if (!currentProjectName) {
      toast.error("Please enter a Project Name before generating all documents.");
      return;
    }
    // For now, we'll pass the project name as the description too.
    // A textarea could be added for a proper description.
    const description = `Project focused on: ${currentProjectName}`;
    toast.info(`Generating all documents for ${currentProjectName}...`);
    try {
      await generateAllDocuments(currentProjectName, description);
      toast.success(`Successfully generated documents for ${currentProjectName}.`);
      // Optionally navigate to the project view after generation
      // navigateToProject(currentProjectName);
    } catch (error: any) {
      // Error toast is handled by the global effect in page.tsx
      console.error('Generate all failed:', error);
    }
  };

  const renderChatSidebar = () => (
    <>
      <h2 className="text-lg font-semibold interactive-glow">Generation Settings</h2>
      
      <div className="space-y-2">
        <label htmlFor="projectNameInput" className="text-sm font-medium text-muted-foreground">Project Name</label>
        <Input 
          id="projectNameInput"
          placeholder="Enter project name..."
          value={currentProjectName}
          onChange={(e) => setCurrentProjectName(e.target.value)}
          className="interactive-glow focus:border-glow-strong"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="docTypeSelect" className="text-sm font-medium text-muted-foreground">Document Type (Optional)</label>
        <Select 
          value={selectedDocType || ''} 
          onValueChange={(value) => setSelectedDocType(value === '__NONE__' ? null : value)}
        >
          <SelectTrigger id="docTypeSelect" className="interactive-glow focus:border-glow-strong">
            <SelectValue placeholder="Optional Single Generation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__NONE__">-- None --</SelectItem>
            {docTypes.map(type => (
              <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-2 mt-auto"> {/* Push buttons towards bottom */} 
        <Button 
          onClick={handleGenerateAll} 
          variant="outline" 
          className="w-full interactive-glow"
          disabled={!currentProjectName || actionLoading['generateAll']}
        >
          {actionLoading['generateAll'] ? 'Generating...' : 'Generate All Docs'}
        </Button>
        <Button onClick={handleRefresh} variant="outline" className="w-full interactive-glow" disabled={isLoadingDocs}>
          &#x21bb; {isLoadingDocs ? 'Refreshing List...' : 'Refresh Doc List'}
        </Button>
        <Button onClick={() => navigateToDashboard()} variant="outline" className="w-full interactive-glow">
          [ View Dashboard ]
        </Button>
      </div>

    </>
  );

  const renderDashboardSidebar = () => (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold interactive-glow">Projects</h2>
        <span className="text-sm text-muted-foreground">({isLoadingDocs ? '...' : new Set(documents.map(d => d.projectName).filter(Boolean)).size})</span>
      </div>

      <div>
        <Input
          type="search"
          placeholder="Search projects/files..."
          value={sidebarSearchTerm}
          onChange={handleSearchChange}
          className="interactive-glow focus:border-glow-strong"
        />
      </div>

      <Separator />

      <div className="flex-grow overflow-hidden border border-border rounded p-1 border-glow">
        <FileExplorer 
          onProjectSelect={handleProjectSelect}
          onFileSelect={onFileSelect} 
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Button onClick={handleCreateNew} variant="outline" className="w-full interactive-glow">
          + Create New Documentation
        </Button>
        <Button onClick={handleRefresh} variant="outline" className="w-full interactive-glow" disabled={isLoadingDocs}>
          &#x21bb; {isLoadingDocs ? 'Refreshing...' : 'Refresh Projects'}
        </Button>
      </div>
      
      <Separator />

      <div className="text-xs text-muted-foreground space-y-1">
        <h3 className="font-semibold text-foreground mb-1">Quick Tips:</h3>
        <p>* Click Project name for details</p>
        <p>* Click File name to view</p>
        <p>* Use search to filter</p>
      </div>
    </>
  );

  return (
    <aside className="flex flex-col h-full border-r border-border p-4 space-y-4 min-w-[250px] max-w-[300px]">
      {currentView === 'chat' ? renderChatSidebar() : renderDashboardSidebar()}
    </aside>
  );
} 