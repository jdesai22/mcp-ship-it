'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import FileExplorer from '@/components/FileExplorer';
import { useAppContext } from '@/context/AppContext'; // Import context hook

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
  // Get actions from context
  const { navigateToChat, fetchDocuments, navigateToProject, documents, isLoadingDocs } = useAppContext();

  // Placeholder data - In reality, this would come from props or state management
  const projects: Project[] = [
    { id: '1', name: 'mlb-betting', fileCount: 9 },
    { id: '2', name: 'nba-betting', fileCount: 9 },
    { id: '3', name: 'nfl-betting', fileCount: 9 },
  ];
  const projectsCount = projects.length;

  // TODO: Implement search functionality
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Search query:', event.target.value);
    // This would likely involve local state filtering of the `documents` from context
  };

  // Connect buttons to context actions
  const handleCreateNew = () => {
    console.log('Action: Create New (Resetting Chat)');
    navigateToChat({ reset: true }); // Call with reset option
  };

  const handleRefresh = () => {
      console.log('Action: Refresh Projects');
      fetchDocuments(); // Trigger fetch from context
  }

  // Use navigateToProject from context when a project is selected
  const handleProjectSelect = (projectName: string) => {
      console.log('Sidebar: Project selected ->', projectName);
      navigateToProject(projectName); // Use context action
  }

  // Calculate project count from context data
  const projectCount = isLoadingDocs ? '...' : 
      new Set(documents.map(d => d.projectName).filter(Boolean)).size;

  return (
    <aside className="flex flex-col h-full border-r border-border p-4 space-y-4 min-w-[250px] max-w-[300px]">
      {/* Title Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold interactive-glow">Projects</h2>
        <span className="text-sm text-muted-foreground">({projectCount})</span>
      </div>

      {/* Search Input */}
      <div>
        <Input
          type="search"
          placeholder="Search projects..."
          onChange={handleSearch}
          className="interactive-glow focus:border-glow-strong"
        />
      </div>

      <Separator />

      {/* File Explorer Area - Pass the onFileSelect prop down */}
      <div className="flex-grow overflow-hidden border border-border rounded p-1 border-glow">
          <FileExplorer 
            onProjectSelect={handleProjectSelect}
            onFileSelect={onFileSelect} // Pass the received prop
          />
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button onClick={handleCreateNew} variant="outline" className="w-full interactive-glow">
          + Create New Documentation
        </Button>
        <Button onClick={handleRefresh} variant="outline" className="w-full interactive-glow" disabled={isLoadingDocs}>
          &#x21bb; {isLoadingDocs ? 'Refreshing...' : 'Refresh Projects'}
        </Button>
      </div>

      <Separator />

      {/* Quick Tips */}
      <div className="text-xs text-muted-foreground space-y-1">
        <h3 className="font-semibold text-foreground mb-1">Quick Tips:</h3>
        <p>* Click Project name for details</p>
        <p>* Click File name to view</p>
        <p>* Use search (TBD)</p>
      </div>
    </aside>
  );
} 