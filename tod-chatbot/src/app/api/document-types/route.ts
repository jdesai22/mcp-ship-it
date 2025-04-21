import { NextResponse } from 'next/server';

// Same structure as in the original server.js
const documentationTypes = [
  { id: 'ProjectOverview', name: 'Project Overview', description: 'Provides a high-level overview of the project, including vision, scope, and goals' },
  { id: 'Features', name: 'Feature Specifications', description: 'Details the features of the project, their priorities, and dependencies' },
  { id: 'Requirements', name: 'Requirements Documentation', description: 'Outlines functional and technical requirements for the project' },
  { id: 'TechStack', name: 'Tech Stack Documentation', description: 'Documents the technologies used in the project and justifications' },
  { id: 'Dependencies', name: 'Dependencies Documentation', description: 'Lists all project dependencies with versions and context' },
  { id: 'UserFlow', name: 'User Flows', description: 'Maps out the user journeys through the application' },
  { id: 'Implementation', name: 'Implementation Standards', description: 'Defines coding standards and implementation practices' },
  { id: 'ProjectStructure', name: 'Project Structure', description: 'Documents the organization of files and directories' }
];

export async function GET() {
  // Simple GET handler returning the static list
  return NextResponse.json(documentationTypes);
} 