import axios from 'axios';

// Set base URL from environment variable or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Project {
  name: string;
  description: string;
}

export interface Document {
  id: string;
  fileName: string;
  documentType: string;
  projectName: string;
  createdAt: string;
  content?: string;
}

// API functions
export const api = {
  // Chat related endpoints
  chat: {
    sendMessage: async (messages: ChatMessage[], projectName?: string): Promise<ChatMessage> => {
      try {
        const response = await apiClient.post('/chat', { messages, projectName });
        return response.data;
      } catch (error) {
        console.error('Error sending chat message:', error);
        throw error;
      }
    },
  },
  
  // Document related endpoints
  documents: {
    // Get all documents
    getAll: async (): Promise<Document[]> => {
      try {
        const response = await apiClient.get('/documents');
        return response.data;
      } catch (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }
    },
    
    // Get document by ID
    getById: async (id: string): Promise<Document> => {
      try {
        const response = await apiClient.get(`/documents/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching document with ID ${id}:`, error);
        throw error;
      }
    },
    
    // Generate document
    generate: async (
      projectName: string, 
      documentType: string, 
      conversationContext?: ChatMessage[]
    ): Promise<Document> => {
      try {
        const response = await apiClient.post('/documents/generate', {
          projectName,
          documentType,
          conversationContext,
        });
        return response.data;
      } catch (error) {
        console.error('Error generating document:', error);
        throw error;
      }
    },
    
    // Generate all documents for a project
    generateAll: async (
      projectName: string,
      conversationContext?: ChatMessage[]
    ): Promise<Document[]> => {
      try {
        const response = await apiClient.post('/documents/generate-all', {
          projectName,
          conversationContext,
        });
        return response.data;
      } catch (error) {
        console.error('Error generating all documents:', error);
        throw error;
      }
    },
    
    // Delete document
    delete: async (id: string): Promise<void> => {
      try {
        await apiClient.delete(`/documents/${id}`);
      } catch (error) {
        console.error(`Error deleting document with ID ${id}:`, error);
        throw error;
      }
    },
    
    // Upload to MCP server
    uploadToMcp: async (projectName: string): Promise<{ success: boolean; message: string }> => {
      try {
        const response = await apiClient.post('/upload-to-mcp', { projectName });
        return response.data;
      } catch (error) {
        console.error('Error uploading to MCP:', error);
        throw error;
      }
    },
  },
};

export default api; 