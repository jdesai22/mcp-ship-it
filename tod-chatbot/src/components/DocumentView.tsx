'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppContext } from "@/context/AppContext";

export default function DocumentView() {
  const {
    selectedDocId,
    viewedDocContent,
    isViewedDocLoading,
    viewedDocError,
  } = useAppContext();

  const renderContent = () => {
    if (isViewedDocLoading) {
      return <p className="text-muted-foreground text-center p-4">Loading document...</p>;
    }
    if (viewedDocError) {
      return <p className="text-destructive text-center p-4">Error loading document: {viewedDocError}</p>;
    }
    if (!viewedDocContent) {
      return <p className="text-muted-foreground text-center p-4">No document selected or content is empty.</p>;
    }

    return (
      <div className="p-2 text-sm leading-relaxed">
        <ReactMarkdown
            remarkPlugins={[remarkGfm]} 
            components={{
                code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                        <pre className="bg-muted p-2 rounded overflow-x-auto text-xs border border-border my-2">
                            <code className={`language-${match[1]}`} {...props}>
                                {String(children).replace(/\n$/, '')}
                            </code>
                        </pre>
                    ) : (
                        <code className="bg-muted px-1 py-0.5 rounded text-primary text-xs" {...props}>
                            {children}
                        </code>
                    );
                },
                h1: ({node, ...props}) => <h1 className="text-xl font-bold border-b border-border pb-1 mb-3 mt-4 text-primary" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-semibold border-b border-border pb-1 mb-2 mt-4 text-primary" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-base font-medium mb-1 mt-3 text-primary" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside ml-4 my-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside ml-4 my-2" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                p: ({node, ...props}) => <p className="mb-2" {...props} />,
                a: ({node, ...props}) => <a className="text-primary underline hover:text-primary/80 interactive-glow" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-border pl-3 italic text-muted-foreground my-2" {...props} />,
                table: ({node, ...props}) => <table className="table-auto w-full border-collapse border border-border my-3 text-xs" {...props} />,
                thead: ({node, ...props}) => <thead className="bg-muted border-b border-border" {...props} />,
                th: ({node, ...props}) => <th className="border border-border px-2 py-1 text-left font-semibold" {...props} />,
                td: ({node, ...props}) => <td className="border border-border px-2 py-1" {...props} />,
                hr: ({node, ...props}) => <hr className="border-border my-4" {...props} />,
            }}
        >
            {viewedDocContent}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
        <h2 className="text-lg font-semibold mb-2 border-b border-border pb-1 text-primary truncate px-1">
            Document: {selectedDocId || '[None]'}
        </h2>
        <ScrollArea className="flex-grow">
            {renderContent()}
        </ScrollArea>
    </div>
  );
} 