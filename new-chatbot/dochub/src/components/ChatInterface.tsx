import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

interface ChatInterfaceProps {
  onDocGenRequest?: (content: string) => void;
}

export function ChatInterface({ onDocGenRequest }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your technical documentation assistant. Tell me about your project and I\'ll help you generate comprehensive documentation.',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Thank you for sharing details about your project. I can help you create documentation for it. Would you like to generate a specific document type or a complete documentation set?`,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex items-start gap-3 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
          >
            {message.role === 'assistant' && (
              <Avatar className="h-8 w-8 bg-primary/20">
                <Bot className="h-4 w-4 text-primary" />
              </Avatar>
            )}
            <Card 
              className={`px-4 py-3 max-w-[80%] ${
                message.role === 'assistant' 
                  ? 'bg-card' 
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            </Card>
            {message.role === 'user' && (
              <Avatar className="h-8 w-8 bg-muted">
                <User className="h-4 w-4" />
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 bg-primary/20">
              <RefreshCw className="h-4 w-4 text-primary animate-spin" />
            </Avatar>
            <Card className="px-4 py-3 bg-card">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150"></div>
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-300"></div>
              </div>
            </Card>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[80px] resize-none"
          />
          <Button 
            className="shrink-0" 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 