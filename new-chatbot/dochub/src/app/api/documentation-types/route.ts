import { NextRequest, NextResponse } from 'next/server';
import { documentationTypes } from '@/lib/server/templates';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(documentationTypes);
  } catch (error) {
    console.error('Error fetching documentation types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documentation types' },
      { status: 500 }
    );
  }
} 