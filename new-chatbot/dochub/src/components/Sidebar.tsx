import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  FolderOpen, 
  LayoutDashboard, 
  Settings, 
  Upload, 
  FileCode, 
  Server, 
  GitBranch, 
  FileStack,
  ListTodo
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Document types matching the original app
const documentTypes = [
  { id: 'ProjectOverview', name: 'Project Overview', icon: LayoutDashboard },
  { id: 'Features', name: 'Feature Specifications', icon: ListTodo },
  { id: 'Requirements', name: 'Requirements', icon: FileStack },
  { id: 'TechStack', name: 'Tech Stack', icon: Server },
  { id: 'Dependencies', name: 'Dependencies', icon: FileCode },
  { id: 'UserFlow', name: 'User Flows', icon: GitBranch },
  { id: 'Implementation', name: 'Implementation', icon: FileText },
  { id: 'ProjectStructure', name: 'Project Structure', icon: FolderOpen }
];

interface SidebarProps {
  projectName?: string;
  activeDocType?: string;
  onDocTypeSelect?: (docType: string) => void;
}

export function Sidebar({ projectName, activeDocType, onDocTypeSelect }: SidebarProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAll = () => {
    setIsGenerating(true);
    // In a real implementation, this would call an API
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <aside className="flex flex-col w-64 shrink-0 border-r border-border h-[calc(100vh-4rem)] bg-sidebar">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-sidebar-foreground truncate">
            {projectName || "New Project"}
          </h2>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground hover:text-primary">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <Button 
            className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
            onClick={handleGenerateAll}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate All Documents
              </>
            )}
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2">
            <Upload className="h-4 w-4" />
            Upload to MCP
          </Button>
        </div>
      </div>

      <Separator className="bg-sidebar-border my-2" />

      <nav className="flex-1 overflow-auto p-2">
        <div className="space-y-1 px-2">
          {documentTypes.map((docType) => {
            const Icon = docType.icon;
            const isActive = activeDocType === docType.id;
            return (
              <button
                key={docType.id}
                className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                onClick={() => onDocTypeSelect?.(docType.id)}
              >
                <Icon className="h-4 w-4" />
                {docType.name}
              </button>
            );
          })}
        </div>
      </nav>
      
      <div className="p-4 mt-auto border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <span className="text-xs text-sidebar-foreground">API Connected</span>
        </div>
      </div>
    </aside>
  );
} 