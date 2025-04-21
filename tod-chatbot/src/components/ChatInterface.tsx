'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppContext } from "@/context/AppContext"; // Import context hook

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Define initial message outside component for reuse
const initialSystemMessage: Message = {
  role: 'system',
  content: 'System Initialized. Enter project details or ask a question.',
};

export default function ChatInterface() {
  // Get relevant state/actions from context
  const { selectedProjectId, /* selectedDocType, */ fetchDocuments, resetChatTrigger } = useAppContext(); 
  // selectedDocType would need to be added to context if we have UI to set it

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

  const handleSendMessage = async (save: boolean = false) => { // Add save flag parameter
    if (!inputMessage.trim() || isLoading) return;

    const newUserMessage: Message = { role: 'user', content: inputMessage };
    // Add user message optimistically
    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    setInputMessage('');
    setIsLoading(true);

    // Prepare history for API (exclude the latest user message we just added)
    const historyForApi = currentMessages.slice(0, -1).map(({ role, content }) => ({ role, content }));

    // --- Call API --- 
    try {
      const payload = {
        userMessage: newUserMessage.content,
        history: historyForApi,
        projectName: selectedProjectId, // Use projectName from context if available
        // documentType: selectedDocType, // Use docType from context if available
        saveDoc: save, // Pass the save flag
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
        // Attempt to parse error from backend
        let errorMsg = `Error: ${response.statusText} (Status: ${response.status})`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
        } catch (parseError) {
            // Ignore if error response is not JSON
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (data.response) {
        const assistantMessage: Message = { role: 'assistant', content: data.response };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        
        if (data.savedDocumentPath) {
            console.log(`Document saved at: ${data.savedDocumentPath}`);
            // Add system message confirming save
            const systemSaveMsg: Message = { role: 'system', content: `Document saved: ${data.savedDocumentPath}` };
            setMessages((prevMessages) => [...prevMessages, systemSaveMsg]);
            // Refresh document list after saving
            fetchDocuments(); 
        }
      } else {
          throw new Error('Received empty response from server.');
      }

    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'system',
        content: `Error: ${error.message || 'Could not get response.'}`, // Display the specific error
      };
      // Add error message to the chat
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
      event.preventDefault(); // Prevent newline in input
      handleSendMessage(); // Default send without saving
    }
    // Example: Add Ctrl+Enter or Shift+Enter to save?
    // if (event.key === 'Enter' && (event.ctrlKey || event.shiftKey)) {
    //    event.preventDefault();
    //    handleSendMessage(true); // Send with save flag
    // }
  };

  // TODO: Add a dedicated "Save Document" button
  // This button would call handleSendMessage(true)
  // It should probably be disabled if projectName/docType aren't set.

  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      {/* Message Display Area */}
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

      {/* Input Area */}
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
        {/* Standard Send Button */}
        <Button onClick={() => handleSendMessage(false)} disabled={isLoading || !inputMessage.trim()} className="interactive-glow">
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
        {/* Placeholder for Save Button */}
        {/* <Button onClick={() => handleSendMessage(true)} disabled={isLoading || !selectedProjectId /* || !selectedDocType * / } variant="outline" className="interactive-glow">Save</Button> */}
      </div>
    </div>
  );
} 