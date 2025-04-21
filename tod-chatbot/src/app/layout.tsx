import type { Metadata } from "next";
// Removed Geist fonts as we are using Poppins/Lato now
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; // Import the ThemeProvider
import { ThemeToggle } from "@/components/ui/theme-toggle"; // Import the ThemeToggle

// Removed Geist font setup
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "TOD Chatbot", // Updated title
  description: "An AI Chatbot", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Added suppressHydrationWarning as recommended by next-themes
    <html lang="en" suppressHydrationWarning>
      {/* Removed Geist font class names */}
      {/* <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}> */}
      <body className={"antialiased font-sans"}> {/* Added font-sans from globals.css */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* Add the ThemeToggle button here, moved left a bit */}
          <div className="fixed bottom-4 right-6">
             <ThemeToggle />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
