import { formatDistanceToNow } from "date-fns";
import { FileText, MoreVertical, ExternalLink, Trash } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DocumentCardProps {
  id: string;
  fileName: string;
  documentType: string;
  projectName: string;
  createdAt: string;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function DocumentCard({
  id,
  fileName,
  documentType,
  projectName,
  createdAt,
  onView,
  onDelete,
}: DocumentCardProps) {
  // Format the document type for display
  const formatDocType = (type: string) => {
    return type
      .replace(/([A-Z])/g, ' $1')
      .trim();
  };

  // Get appropriate icon color based on document type
  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      ProjectOverview: "text-primary",
      Features: "text-blue-500",
      Requirements: "text-purple-500",
      TechStack: "text-green-500",
      Dependencies: "text-amber-500",
      UserFlow: "text-rose-500",
      Implementation: "text-cyan-500",
      ProjectStructure: "text-secondary"
    };
    
    return typeColors[type] || "text-primary";
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-primary/10 hover:border-primary/20 backdrop-blur-sm bg-card/90">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center space-x-2">
          <FileText className={`h-5 w-5 ${getTypeColor(documentType)}`} />
          <h3 className="font-semibold text-sm truncate">
            {formatDocType(documentType)}
          </h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onView?.(id)}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete?.(id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="text-xs text-muted-foreground">
          Project: <span className="font-medium text-foreground">{projectName}</span>
        </div>
        <p className="text-sm mt-2 line-clamp-2 text-card-foreground">
          {fileName}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground">
        <span>
          Created {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
      </CardFooter>
    </Card>
  );
} 