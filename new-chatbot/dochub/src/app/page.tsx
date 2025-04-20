import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { ArrowRight, BookOpen, FileText, Library, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <section className="flex-1 flex flex-col justify-center items-center px-6 py-24 md:py-32 text-center space-y-8 bg-[radial-gradient(ellipse_at_top,rgba(0,184,169,0.08),transparent)]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center px-3 py-1 mb-4 text-sm font-medium rounded-full border border-border bg-card/80 text-muted-foreground backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            Technical Documentation Generator
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Create comprehensive 
            <span className="text-primary block md:inline"> technical docs </span>
            in seconds
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate structured technical documentation for your projects with AI assistance, 
            following the Windsurf Meta-Workflow methodology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 px-6">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 text-foreground">
              <BookOpen className="h-4 w-4" />
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
            Document types you can generate
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={FileText}
              title="Project Overview"
              description="High-level summary of your project, its vision, goals, and scope."
            />
            <FeatureCard 
              icon={Library}
              title="Tech Stack"
              description="Detailed documentation of technologies used in your project with justifications."
            />
            <FeatureCard 
              icon={Zap}
              title="User Flows"
              description="Visual and descriptive mapping of user journeys through your application."
            />
            <FeatureCard 
              icon={BookOpen}
              title="Implementation"
              description="Standards and practices for implementing the project consistently."
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-12 px-6 bg-background">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold tracking-tight">DocHub</span>
          </div>
          
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Documentation
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-border text-sm text-center text-muted-foreground">
          &copy; 2023 DocHub. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
