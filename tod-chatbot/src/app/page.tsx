'use client';

import React from 'react';
import { AppProvider, useAppContext } from '@/context/AppContext';
import ChatInterface from '@/components/ChatInterface';
import Sidebar from '@/components/Sidebar';
import DashboardView from '@/components/DashboardView';
import DocumentView from '@/components/DocumentView';
import ProjectView from '@/components/ProjectView';
import { Button } from '@/components/ui/button';

// Root component remains a Server Component (can't use hooks)
export default function HomePage() {
  return (
    <AppProvider>
      {/* Home is now a Client Component because it uses the context hook */}
      <Home />
    </AppProvider>
  );
}

// Main Home component consuming the context - needs to be client-side
function Home() {
  // Get state and actions from context
  const {
    currentView,
    selectedProjectId,
    selectedDocId,
    isViewedDocLoading,
    navigateToChat,
    navigateToDashboard,
    navigateToProject,
    navigateToDocument,
  } = useAppContext();

  // Function to render the main content based on the current view from context
  const renderMainContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'project':
        return <ProjectView />;
      case 'document':
        return <DocumentView />;
      case 'chat':
      default:
        return <ChatInterface />;
    }
  };

  // Determine button text and action based on context view
  const toggleButtonText = currentView === 'chat' ? '[ View Dashboard ]' : '[ Go to Chat ]';
  const toggleButtonAction = currentView === 'chat' ? navigateToDashboard : navigateToChat;

  return (
    <main className="flex h-screen font-mono overflow-hidden">
      {/* Sidebar now uses context internally, but still needs navigateToDocument */}
      <Sidebar onFileSelect={navigateToDocument} />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col p-6">
         {/* Header with View Toggle */}
        <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
          <h1 className="text-2xl font-semibold interactive-glow">Technical Doc Generator [CLI]</h1>
          <Button 
            variant="outline"
            size="sm"
            onClick={toggleButtonAction}
            className="interactive-glow"
          >
            {toggleButtonText}
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-grow border border-border rounded p-4 border-glow-strong overflow-auto">
          {renderMainContent()} 
        </div>

        {/* Footer/Status Bar uses context state */}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          Status: {isViewedDocLoading ? 'Loading Doc...' : 'Ready'} | View: {currentView} | Doc: {selectedDocId || '[None]'} | Project: {selectedProjectId || '[None]'} | Press [?] for help
        </div>
      </div>
    </main>
  );
}
