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

interface DocumentItem {
  id: string;
  fileName: string;
  documentType: string;
  projectName: string;
  folder: string | null;
  createdAt: string;
  isNestedFolder?: boolean;
}

// Helper to get the subfolder path (after top-level folder)
const getSubfolderPath = (folder: string | null): string => {
  if (!folder || !folder.includes('/')) return '';
  const parts = folder.split('/');
  return parts.slice(1).join('/');
};

export default function FileExplorer({ onProjectSelect, onFileSelect }: FileExplorerProps) {
  const { documents, isLoadingDocs, docListError, sidebarSearchTerm } = useAppContext();
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>({});
  const [openSubfolders, setOpenSubfolders] = useState<Record<string, boolean>>({});

  const toggleProject = (projectName: string) => {
    setOpenProjects(prev => ({ ...prev, [projectName]: !prev[projectName] }));
  };

  const toggleSubfolder = (folderPath: string) => {
    setOpenSubfolders(prev => ({ ...prev, [folderPath]: !prev[folderPath] }));
  };

  const filteredAndGroupedProjects = useMemo(() => {
    const searchTerm = sidebarSearchTerm.toLowerCase().trim();
    const filteredDocs = searchTerm 
      ? documents.filter(doc => 
          doc.projectName?.toLowerCase().includes(searchTerm) || 
          doc.fileName?.toLowerCase().includes(searchTerm)
        )
      : documents;

    // Group by project (top-level folder)
    const projectMap: Record<string, DocumentItem[]> = {};
    
    filteredDocs.forEach(doc => {
      const projectName = doc.projectName || 'uncategorized';
      if (!projectMap[projectName]) projectMap[projectName] = [];
      projectMap[projectName].push(doc);
    });
    
    // Sort documents within each project
    Object.keys(projectMap).forEach(projectName => {
      projectMap[projectName].sort((a, b) => a.fileName.localeCompare(b.fileName));
    });
    
    return projectMap;
  }, [documents, sidebarSearchTerm]);

  // Group documents within a project by subfolder
  const groupDocumentsBySubfolder = (docs: DocumentItem[]): Record<string, DocumentItem[]> => {
    const result: Record<string, DocumentItem[]> = {
      '__root': [] // Documents at the project root
    };
    
    docs.forEach(doc => {
      if (!doc.folder || !doc.folder.includes('/')) {
        // No subfolder, this is at the project root
        result['__root'].push(doc);
      } else {
        const subfolder = getSubfolderPath(doc.folder);
        if (!result[subfolder]) result[subfolder] = [];
        result[subfolder].push(doc);
      }
    });
    
    return result;
  };

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
      {projectNames.map((projectName) => {
        const projectDocs = filteredAndGroupedProjects[projectName];
        const groupedBySubfolder = groupDocumentsBySubfolder(projectDocs);
        const hasSubfolders = Object.keys(groupedBySubfolder).length > 1; // More than just "__root"
        
        return (
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
                <span className="text-xs text-muted-foreground">({projectDocs.length})</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {/* Root-level documents */}
              {groupedBySubfolder['__root'].length > 0 && (
                <div className="pl-4 pt-1 pb-1 space-y-1">
                  {groupedBySubfolder['__root'].map((doc) => (
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
              )}
              
              {/* Subfolders */}
              {hasSubfolders && Object.keys(groupedBySubfolder)
                .filter(subfolder => subfolder !== '__root')
                .sort()
                .map(subfolder => (
                  <Collapsible
                    key={`${projectName}/${subfolder}`}
                    open={openSubfolders[`${projectName}/${subfolder}`] || !!sidebarSearchTerm}
                    onOpenChange={() => toggleSubfolder(`${projectName}/${subfolder}`)}
                    className="ml-4 mb-1"
                  >
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full flex justify-between items-center p-1 h-auto text-left text-sm interactive-glow hover:bg-accent focus:bg-accent"
                      >
                        <span>
                          {openSubfolders[`${projectName}/${subfolder}`] || !!sidebarSearchTerm ? '[-] ' : '[+] '}
                          {subfolder}
                        </span>
                        <span className="text-xs text-muted-foreground">({groupedBySubfolder[subfolder].length})</span>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pl-4 pt-1 pb-1 space-y-1">
                        {groupedBySubfolder[subfolder].map((doc) => (
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
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
} 