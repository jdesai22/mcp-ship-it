'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useAppContext } from "@/context/AppContext"; // Import context hook

// Removed Project interface (defined in context)

// Removed DashboardViewProps interface

export default function DashboardView(/* Removed props */) {
  // Get data and actions from context
  const { documents, isLoadingDocs, docListError, navigateToProject, navigateToDocument } = useAppContext();

  // Group documents by project name to display project cards/items
  const groupedProjects = documents.reduce((acc, doc) => {
    const projectName = doc.projectName || 'uncategorized';
    if (!acc[projectName]) {
      // Initialize project details - potentially enhance later
      acc[projectName] = { id: projectName, name: projectName, fileCount: 0, lastUpdated: null, files: [] };
    }
    acc[projectName].fileCount += 1;
    acc[projectName].files.push(doc);
    // Find the latest update time among files in the project
    const docDate = new Date(doc.createdAt);
    if (!acc[projectName].lastUpdated || docDate > new Date(acc[projectName].lastUpdated)) {
      acc[projectName].lastUpdated = doc.createdAt;
    }
    return acc;
  }, {} as Record<string, { id: string; name: string; fileCount: number; lastUpdated: string | null; files: typeof documents }>);

  const projectList = Object.values(groupedProjects).sort((a, b) => a.name.localeCompare(b.name));
  const projectsCount = projectList.length;

  if (isLoadingDocs) {
    return <p className="text-muted-foreground text-center p-4">Loading projects...</p>;
  }

  if (docListError) {
    return <p className="text-destructive text-center p-4">Error: {docListError}</p>;
  }

  return (
    <div className="h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold interactive-glow">All Projects</h2>
        <span className="text-sm text-muted-foreground">({projectsCount} projects)</span>
      </div>

      <div className="space-y-3">
        {projectList.length === 0 && (
          <p className="text-muted-foreground text-center">No projects found.</p>
        )}
        {projectList.map((project) => (
          <div 
            key={project.id}
            className="border border-border rounded p-3 flex justify-between items-center cursor-pointer interactive-glow hover:border-primary focus:border-primary transition-colors duration-150"
            onClick={() => navigateToProject(project.id)} // Use context action
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && navigateToProject(project.id)}
            title={`View project: ${project.name}`}
          >
            <div>
              <h3 className="font-semibold text-foreground">{project.name}</h3>
              <p className="text-xs text-muted-foreground">
                {project.fileCount} documents | Last updated: {project.lastUpdated ? new Date(project.lastUpdated).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <span className="text-sm text-primary">[View Project]</span>
          </div>
        ))}
      </div>
    </div>
  );
} 