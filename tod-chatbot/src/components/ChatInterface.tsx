'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppContext } from "@/context/AppContext";
import { toast } from "sonner"; // Import toast

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Define initial message outside component for reuse
const initialSystemMessage: Message = {
  role: 'system',
  content: 'System Initialized. Enter project name and optionally select doc type.',
};

export default function ChatInterface() {
  // Get relevant state/actions from context
  const { 
    selectedProjectId, // Project ID is now set via navigateToProject
    currentProjectName, // Use currentProjectName from context for saving
    selectedDocType, 
    fetchDocuments, 
    resetChatTrigger 
  } = useAppContext();
  
  const [messages, setMessages] = useState<Message[]>([initialSystemMessage]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true); // Ref to track initial mount for reset effect

  // Effect to reset chat when trigger changes (after initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return; // Don't reset on the very first render
    }
    console.log('ChatInterface: Reset trigger detected. Resetting messages.');
    setMessages([initialSystemMessage]);
    setInputMessage(''); // Also clear input field
  }, [resetChatTrigger]);

  // Scroll to bottom when messages change
  useEffect(() => {
    // TODO: Find a better way to access the scroll viewport in Shadcn ScrollArea if possible
    // This is a common workaround pattern
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (save: boolean = false) => {
    if (save && (!currentProjectName || !selectedDocType)) {
        toast.error("Project Name and Document Type must be set to save.");
        return;
    }
    if (!inputMessage.trim() || isLoading) return;

    const newUserMessage: Message = { role: 'user', content: inputMessage };
    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    const userMsgContent = inputMessage; // Store before clearing
    setInputMessage('');
    setIsLoading(true);

    const historyForApi = currentMessages.slice(0, -1).map(({ role, content }) => ({ role, content }));

    try {
      const payload = {
        userMessage: userMsgContent,
        history: historyForApi,
        // Use currentProjectName from context, which is updated by the sidebar input
        projectName: currentProjectName, 
        // Use selectedDocType from context, updated by sidebar select
        documentType: save ? selectedDocType : null, // Only pass doc type if saving
        saveDoc: save,
      };
      console.log('Sending payload to /api/chat:', payload);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = `Error: ${response.statusText} (Status: ${response.status})`;
        try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch {} 
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (data.response) {
        const assistantMessage: Message = { role: 'assistant', content: data.response };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        
        if (data.savedDocumentPath) {
            toast.success(`Document saved: ${data.savedDocumentPath}`); // Use toast for save success
            fetchDocuments(); 
        }
      } else {
          throw new Error('Received empty response from server.');
      }

    } catch (error: any) {
      // Error toast is handled globally in page.tsx
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'system',
        content: `Error: ${error.message || 'Could not get response.'}`, 
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Area (Optional: could show current project/doc type) */}
      <div className="mb-2 text-xs text-muted-foreground border-b border-border pb-1">
          Project: {currentProjectName || '[Not Set]'} | Doc Type: {selectedDocType || '[Not Set]'} 
      </div>
      
      <ScrollArea className="flex-grow border border-border rounded mb-4 p-4 border-glow" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <span className={`font-bold ${msg.role === 'user' ? 'text-primary' : msg.role === 'assistant' ? 'text-muted-foreground' : 'text-destructive'}`}>
                {msg.role === 'user' ? '> User:' : msg.role === 'assistant' ? '< Assistant:' : '! System:'}
              </span>
              {/* Use pre-wrap to preserve whitespace and newlines from the response */}
              <p className="whitespace-pre-wrap ml-2 inline">{msg.content}</p> 
            </div>
          ))}
           {isLoading && (
             <div className="message system text-muted-foreground">! System: Processing...</div>
           )}
        </div>
      </ScrollArea>

      <div className="flex space-x-2 border-t border-border pt-4">
        <Input
          type="text"
          placeholder="Type message... (Enter to send)"
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className="flex-grow interactive-glow focus:border-glow-strong"
        />
        <Button onClick={() => handleSendMessage(false)} disabled={isLoading || !inputMessage.trim()} className="interactive-glow">
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
        {/* Save Button Implementation */}
        <Button 
          onClick={() => handleSendMessage(true)} 
          disabled={isLoading || !currentProjectName || !selectedDocType} 
          variant="outline" 
          className="interactive-glow"
          title={!currentProjectName || !selectedDocType ? "Set Project Name and Doc Type to Save" : "Save current conversation as selected Doc Type"}
         >
             Save Doc
        </Button>
      </div>
    </div>
  );
} 