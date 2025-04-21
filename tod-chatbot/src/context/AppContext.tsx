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

// Added DocType definition
export interface DocType {
  id: string;
  name: string;
  description?: string;
}

interface AppContextProps {
  // State
  currentView: ViewState;
  documents: Document[]; // List of all saved documents
  docTypes: DocType[]; // List of available document types
  isLoadingDocs: boolean;
  docListError: string | null;
  currentProjectName: string; // Project name currently being worked on in chat
  selectedProjectId: string | null; // Project selected for viewing (in project/doc view)
  selectedDocType: string | null; // Document type selected in chat sidebar
  selectedDocId: string | null; // Specific document ID being viewed
  viewedDocContent: string | null;
  isViewedDocLoading: boolean;
  viewedDocError: string | null;
  resetChatTrigger: number; // Added state to trigger chat reset
  sidebarSearchTerm: string; // Search term for dashboard sidebar
  actionLoading: { [key: string]: boolean }; // Track loading states for actions
  actionError: { [key: string]: string | null }; // Track errors for actions

  // Actions
  setCurrentView: (view: ViewState) => void;
  setCurrentProjectName: (name: string) => void;
  setSelectedProjectId: (projectId: string | null) => void;
  setSelectedDocType: (docTypeId: string | null) => void;
  setSidebarSearchTerm: (term: string) => void;
  fetchDocuments: () => Promise<void>;
  fetchDocTypes: () => Promise<void>;
  fetchSingleDocument: (documentId: string) => Promise<void>;
  navigateToDocument: (documentId: string) => void;
  navigateToDashboard: () => void;
  navigateToChat: (options?: { reset?: boolean }) => void; // Modified signature
  navigateToProject: (projectId: string) => void;
  generateAllDocuments: (projectName: string, projectDescription: string) => Promise<void>; // Added action
  uploadProjectToMcp: (projectName: string) => Promise<any>; // Added action, returns result
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
  const [docTypes, setDocTypes] = useState<DocType[]>([]); // State for doc types
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(false);
  const [docListError, setDocListError] = useState<string | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState<string>(''); // State for project name input
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null); // State for selected doc type
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [viewedDocContent, setViewedDocContent] = useState<string | null>(null);
  const [isViewedDocLoading, setIsViewedDocLoading] = useState<boolean>(false);
  const [viewedDocError, setViewedDocError] = useState<string | null>(null);
  const [resetChatTrigger, setResetChatTrigger] = useState<number>(0); // Initialize trigger state
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState<string>(''); // State for search
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [actionError, setActionError] = useState<{ [key: string]: string | null }>({});

  // --- Helper for Actions --- 
  const handleAction = async (actionKey: string, actionFn: () => Promise<any>) => {
      setActionLoading(prev => ({ ...prev, [actionKey]: true }));
      setActionError(prev => ({ ...prev, [actionKey]: null }));
      try {
          const result = await actionFn();
          setActionLoading(prev => ({ ...prev, [actionKey]: false }));
          return result;
      } catch (error: any) {
          console.error(`Error during action [${actionKey}]:`, error);
          setActionError(prev => ({ ...prev, [actionKey]: error.message || `Failed to execute ${actionKey}` }));
          setActionLoading(prev => ({ ...prev, [actionKey]: false }));
          throw error; // Re-throw if specific handling is needed
      }
  };

  // --- Data Fetching Callbacks --- 
  const fetchDocuments = useCallback(async () => handleAction('fetchDocs', async () => {
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
  }), []);

  const fetchDocTypes = useCallback(async () => handleAction('fetchDocTypes', async () => {
    console.log('Fetching document types...');
    const response = await fetch('/api/document-types');
    if (!response.ok) throw new Error(`Failed to fetch document types: ${response.statusText}`);
    const data: DocType[] = await response.json();
    setDocTypes(data);
  }), []);

  const fetchSingleDocument = useCallback(async (documentId: string) => handleAction('fetchSingleDoc', async () => {
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
  }), []);

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
      setSidebarSearchTerm(''); // Clear search on view change
  }, []);

  const navigateToChat = useCallback((options?: { reset?: boolean }) => {
      setCurrentView('chat');
      setSelectedDocId(null);
      setSelectedProjectId(null); // Clear project selection when going to chat
      setViewedDocContent(null);
      setSelectedDocType(null); // Clear doc type selection when going to chat
      setCurrentProjectName(''); // Clear project name input
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
    fetchDocTypes();
  }, [fetchDocuments, fetchDocTypes]);

  // --- Other Actions --- 
  const generateAllDocuments = useCallback(async (projectName: string, projectDescription: string) => handleAction('generateAll', async () => {
      console.log(`Generating all documents for: ${projectName}`);
      if (!projectName || !projectDescription) {
          throw new Error('Project Name and Description are required to generate all documents.');
      }
      const response = await fetch('/api/generate-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectName, projectDescription }),
      });
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to generate documents (Status: ${response.status})`);
      }
      const result = await response.json();
      console.log('Generate all result:', result);
      await fetchDocuments(); // Refresh doc list after generation
      return result;
  }), [fetchDocuments]);

  const uploadProjectToMcp = useCallback(async (projectName: string) => handleAction(`uploadMcp_${projectName}`, async () => {
      console.log(`Uploading project to MCP: ${projectName}`);
      if (!projectName) {
          throw new Error('Project Name is required to upload.');
      }
      const response = await fetch('/api/upload-to-mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectName }),
      });
      const result = await response.json(); // Get JSON response regardless of status
      if (!response.ok) {
          throw new Error(result.error || `Failed to upload to MCP (Status: ${response.status})`);
      }
      console.log('Upload to MCP result:', result);
      return result;
  }), []);

  // --- Value Provided by Context --- 
  const value = {
    currentView,
    documents,
    docTypes,
    isLoadingDocs,
    docListError,
    currentProjectName,
    selectedProjectId,
    selectedDocType,
    selectedDocId,
    viewedDocContent,
    isViewedDocLoading,
    viewedDocError,
    resetChatTrigger, // Expose trigger
    sidebarSearchTerm,
    actionLoading,
    actionError,
    setCurrentView, // Expose direct setter if needed, but prefer navigation actions
    setCurrentProjectName,
    setSelectedProjectId,
    setSelectedDocType,
    setSidebarSearchTerm,
    fetchDocuments,
    fetchDocTypes,
    fetchSingleDocument,
    navigateToDocument,
    navigateToDashboard,
    navigateToChat,
    navigateToProject,
    generateAllDocuments,
    uploadProjectToMcp,
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