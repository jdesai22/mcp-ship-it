import Link from "next/link";
import { FileText, ChevronRight, Folders } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-16 items-center px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold tracking-tight">DocHub</span>
        </div>
        <nav className="ml-auto flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Folders className="h-4 w-4" />
              <span className="sr-only">Projects</span>
            </Button>
            <ChevronRight className="h-4 w-4" />
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <FileText className="h-4 w-4" />
              <span className="sr-only">Documents</span>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
} 