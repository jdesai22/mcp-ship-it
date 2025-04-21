'use client';

import React, { createContext, useState, useContext, useCallback, ReactNode, useEffect } from 'react';

// --- Types --- 
type ViewState = 'chat' | 'dashboard' | 'project' | 'document';

interface Document {
  id: string; // e.g., "project-name/document-name"
  fileName: string; // e.g., "project-name/document-name.md"
  documentType: string; // e.g., "features"
  projectName: string; // e.g., "project-name"
  createdAt: string;
  folder: string | null; // Should match projectName if in a folder
  content?: string | null; // Optional content field
}

interface AppContextProps {
  // State
  currentView: ViewState;
  documents: Document[];
  isLoadingDocs: boolean;
  docListError: string | null;
  selectedProjectId: string | null;
  selectedDocId: string | null;
  viewedDocContent: string | null;
  isViewedDocLoading: boolean;
  viewedDocError: string | null;
  resetChatTrigger: number; // Added state to trigger chat reset

  // Actions
  setCurrentView: (view: ViewState) => void;
  setSelectedProjectId: (projectId: string | null) => void;
  fetchDocuments: () => Promise<void>;
  fetchSingleDocument: (documentId: string) => Promise<void>;
  navigateToDocument: (documentId: string) => void;
  navigateToDashboard: () => void;
  navigateToChat: (options?: { reset?: boolean }) => void; // Modified signature
  navigateToProject: (projectId: string) => void;
}

// --- Context Creation --- 
const AppContext = createContext<AppContextProps | undefined>(undefined);

// --- Provider Component --- 
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewState>('chat');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(false);
  const [docListError, setDocListError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [viewedDocContent, setViewedDocContent] = useState<string | null>(null);
  const [isViewedDocLoading, setIsViewedDocLoading] = useState<boolean>(false);
  const [viewedDocError, setViewedDocError] = useState<string | null>(null);
  const [resetChatTrigger, setResetChatTrigger] = useState<number>(0); // Initialize trigger state

  // --- Data Fetching Callbacks --- 
  const fetchDocuments = useCallback(async () => {
    console.log('Fetching document list...');
    setIsLoadingDocs(true);
    setDocListError(null);
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.statusText}`);
      }
      const data: Document[] = await response.json();
      setDocuments(data);
    } catch (err: any) {
      console.error("Error fetching documents:", err);
      setDocListError(err.message || 'Could not load documents.');
      setDocuments([]); // Clear documents on error
    } finally {
      setIsLoadingDocs(false);
    }
  }, []);

  const fetchSingleDocument = useCallback(async (documentId: string) => {
    if (!documentId) return;
    console.log('Fetching single document content:', documentId);
    setIsViewedDocLoading(true);
    setViewedDocError(null);
    setViewedDocContent(null);
    setSelectedDocId(documentId); // Keep track of what we are loading

    try {
      const apiUrl = `/api/document/${documentId}`; 
      const response = await fetch(apiUrl);
      if (!response.ok) {
        let errorMsg = `Error ${response.status}: ${response.statusText}`;
        try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch {} 
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setViewedDocContent(data.content);
    } catch (error: any) {
      console.error('Failed to fetch document content:', error);
      setViewedDocError(error.message || 'Unknown error fetching document.');
      setViewedDocContent(null);
    } finally {
      setIsViewedDocLoading(false);
    }
  }, []);

  // --- Navigation Actions --- 
  const navigateToDocument = useCallback((documentId: string) => {
      setCurrentView('document');
      fetchSingleDocument(documentId);
  }, [fetchSingleDocument]);

  const navigateToDashboard = useCallback(() => {
      setCurrentView('dashboard');
      setSelectedDocId(null); // Clear document selection
      setSelectedProjectId(null);
      setViewedDocContent(null);
  }, []);

  const navigateToChat = useCallback((options?: { reset?: boolean }) => {
      setCurrentView('chat');
      setSelectedDocId(null);
      setSelectedProjectId(null); // Clear project selection when going to chat
      setViewedDocContent(null);
      if (options?.reset) {
          console.log('Resetting chat trigger...');
          setResetChatTrigger(prev => prev + 1); // Increment trigger
      }
  }, []);

    const navigateToProject = useCallback((projectId: string) => {
      setSelectedProjectId(projectId);
      setCurrentView('project');
      setSelectedDocId(null);
      setViewedDocContent(null);
      // TODO: Fetch project-specific data if needed, or rely on filtered `documents`
      console.log(`Navigating to project view: ${projectId}`);
  }, []);

  // Fetch initial document list on mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // --- Value Provided by Context --- 
  const value = {
    currentView,
    documents,
    isLoadingDocs,
    docListError,
    selectedProjectId,
    selectedDocId,
    viewedDocContent,
    isViewedDocLoading,
    viewedDocError,
    resetChatTrigger, // Expose trigger
    setCurrentView, // Expose direct setter if needed, but prefer navigation actions
    setSelectedProjectId,
    fetchDocuments,
    fetchSingleDocument,
    navigateToDocument,
    navigateToDashboard,
    navigateToChat,
    navigateToProject,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- Custom Hook for Consuming Context --- 
export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}; 