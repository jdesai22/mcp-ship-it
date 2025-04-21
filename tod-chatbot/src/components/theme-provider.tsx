"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
// Removed the potentially problematic import for ThemeProviderProps
// import { type ThemeProviderProps } from "next-themes/dist/types"

// Simplified props type to React.PropsWithChildren or a basic type if needed
// For basic usage, just passing children might be sufficient
export function ThemeProvider({ children, ...props }: { children: React.ReactNode; [key: string]: any }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
} 