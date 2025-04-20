import { Toaster } from "@/components/ui/sonner";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DocHub - Technical Documentation Generator",
  description: "Generate comprehensive technical documentation for your projects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased min-h-screen`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
