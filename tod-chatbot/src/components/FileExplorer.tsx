'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext } from "@/context/AppContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface FileExplorerProps {
  onProjectSelect?: (projectName: string) => void;
  onFileSelect?: (documentId: string) => void;
}

export default function FileExplorer({ onProjectSelect, onFileSelect }: FileExplorerProps) {
  const { documents, isLoadingDocs, docListError, sidebarSearchTerm } = useAppContext();
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>({});

  const toggleProject = (projectName: string) => {
    setOpenProjects(prev => ({ ...prev, [projectName]: !prev[projectName] }));
  };

  const filteredAndGroupedProjects = useMemo(() => {
      const searchTerm = sidebarSearchTerm.toLowerCase().trim();
      if (!searchTerm) {
          return documents.reduce((acc, doc) => {
              const projectName = doc.projectName || 'uncategorized';
              if (!acc[projectName]) acc[projectName] = [];
              acc[projectName].push(doc);
              acc[projectName].sort((a, b) => a.fileName.localeCompare(b.fileName));
              return acc;
          }, {} as Record<string, typeof documents>);
      }

      const filteredDocs = documents.filter(doc => 
          doc.projectName?.toLowerCase().includes(searchTerm) || 
          doc.fileName?.toLowerCase().includes(searchTerm)
      );

      return filteredDocs.reduce((acc, doc) => {
          const projectName = doc.projectName || 'uncategorized';
          if (!acc[projectName]) acc[projectName] = [];
          acc[projectName].push(doc);
          acc[projectName].sort((a, b) => a.fileName.localeCompare(b.fileName));
          return acc;
      }, {} as Record<string, typeof documents>);

  }, [documents, sidebarSearchTerm]);

  if (isLoadingDocs) {
    return <p className="text-muted-foreground text-sm p-2">Loading projects...</p>;
  }

  if (docListError) {
    return <p className="text-destructive text-sm p-2">Error: {docListError}</p>;
  }

  const projectNames = Object.keys(filteredAndGroupedProjects).sort();

  if (projectNames.length === 0) {
    return <p className="text-muted-foreground text-sm p-2">No projects found{sidebarSearchTerm ? ' matching search' : ''}.</p>;
  }

  return (
    <div className="flex-grow overflow-y-auto pr-2">
      {projectNames.map((projectName) => (
        <Collapsible
          key={projectName}
          open={openProjects[projectName] || !!sidebarSearchTerm}
          onOpenChange={() => toggleProject(projectName)}
          className="mb-1"
        >
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full flex justify-between items-center p-2 h-auto text-left interactive-glow hover:bg-accent focus:bg-accent"
              onClick={() => onProjectSelect && onProjectSelect(projectName)}
            >
              <span className="font-semibold">
                 {openProjects[projectName] || !!sidebarSearchTerm ? '[-] ' : '[+] '}
                 {projectName}
              </span>
              <span className="text-xs text-muted-foreground">({filteredAndGroupedProjects[projectName].length})</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pl-4 pt-1 pb-1 space-y-1">
              {filteredAndGroupedProjects[projectName].map((doc) => (
                <div 
                  key={doc.id}
                  className="text-sm text-muted-foreground cursor-pointer interactive-glow hover:text-primary focus:text-primary pl-2 py-0.5 truncate"
                  onClick={() => onFileSelect && onFileSelect(doc.id)}
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && onFileSelect && onFileSelect(doc.id)}
                  title={doc.fileName}
                >
                  - {doc.fileName.split('/').pop()?.replace('.md', '') || doc.documentType}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
} 