import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { initServer } from './lib/server/init';

// This variable ensures initialization only happens once
let initialized = false;

export function middleware(request: NextRequest) {
  // Initialize server resources if not already done
  if (!initialized) {
    try {
      initServer();
      initialized = true;
    } catch (error) {
      console.error('Error initializing server:', error);
    }
  }
  
  return NextResponse.next();
}

// Configure middleware to run only for API routes
export const config = {
  matcher: '/api/:path*',
}; 