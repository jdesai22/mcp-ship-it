import { NextResponse, NextRequest } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the output directory relative to the project root
const outputDir = path.resolve(process.cwd(), 'output-docs');
const templatesDir = path.resolve(process.cwd(), '..', 'templates'); // Assuming templates live outside tod-chatbot for now

// --- Replicated Helper Functions (from chat route for encapsulation) ---

const ensureProjectFolder = (projectName: string): string => {
  const sanitizedProjectName = projectName.replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase();
  const projectPath = path.join(outputDir, sanitizedProjectName);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath, { recursive: true });
  }
  return projectPath;
};

const generateFilename = (docType: string): string => {
  return `${docType.toLowerCase().replace(/\s+/g, '_')}.md`;
};

const saveDocumentation = (projectName: string, docType: string, content: string): string => {
  const projectPath = ensureProjectFolder(projectName);
  const filename = generateFilename(docType);
  const filePath = path.join(projectPath, filename);
  fs.writeFileSync(filePath, content);
  return path.relative(outputDir, filePath).replace(/\\/g, '/');
};

const loadTemplate = (templateName: string): string | null => {
  try {
    let fileName = '';
    // Special case for Dependencies ID
    if (templateName === 'Dependencies') {
      fileName = 'dependencies-documentation-template.md';
    } else {
      // Convert CamelCase ID to kebab-case for other templates
      const kebabCaseName = templateName
        .replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`)
        .replace(/^-/, ''); // Remove leading hyphen if first letter was uppercase
      fileName = `${kebabCaseName}-template.md`;
    }
    
    const templatePath = path.join(templatesDir, fileName);
    console.log(`Attempting to load template: ${templatePath}`); // Log path

    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf8');
    }
    console.warn(`Template not found: ${templatePath}`);
    return null;
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    return null;
  }
};

// --- Document Types (Redefined for simplicity) ---

const documentationTypes = [
  { id: 'ProjectOverview', name: 'Project Overview' },
  { id: 'Features', name: 'Feature Specifications' },
  { id: 'Requirements', name: 'Requirements Documentation' },
  { id: 'TechStack', name: 'Tech Stack Documentation' },
  { id: 'Dependencies', name: 'Dependencies Documentation' },
  { id: 'UserFlow', name: 'User Flows' },
  { id: 'Implementation', name: 'Implementation Standards' },
  { id: 'ProjectStructure', name: 'Project Structure' }
];

// --- Main Handler --- 

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectName, projectDescription } = body;

    if (!projectName || !projectDescription) {
      return NextResponse.json({ error: 'projectName and projectDescription are required' }, { status: 400 });
    }

    console.log(`Starting generation for all documents for project: ${projectName}`);

    const results: { docType: string; success: boolean; filePath?: string; error?: string }[] = [];

    // Ensure base project folder exists before starting loop
    ensureProjectFolder(projectName);

    // Generate each document type sequentially
    for (const docType of documentationTypes) {
      console.log(`Generating document type: ${docType.name}`);
      try {
        // --- Construct Prompt for this specific document type --- 
        let systemPrompt = `You are an expert AI assistant specializing in generating technical documentation based on the Windsurf Meta-Workflow methodology. 
        The overall project name is: ${projectName}
        The overall project description is: ${projectDescription}
        
        Your task is to generate ONLY the content for the following document type: ${docType.name} (${docType.id}).
        Focus *only* on the aspects relevant to this specific document type, using the provided project description as context. Do not add introductory or concluding remarks about the generation process itself, just the document content.`;

        const templateContent = loadTemplate(docType.id);
        if (templateContent) {
          systemPrompt += `\n\nPlease use the following template structure as a guide:\n\n${templateContent}`;
        } else {
          systemPrompt += `\nStructure the document logically based on the type: ${docType.name}.`;
        }

        // --- OpenAI API Call --- 
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: 'system', content: systemPrompt },
          // No user message needed here as the instruction is in the system prompt
          // Optionally, could add a dummy user message like "Generate the document."
        ];

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o', // Or your preferred model
          messages: messages,
          temperature: 0.6, // Slightly lower temp for potentially more structured output
        });

        const assistantResponse = completion.choices[0]?.message?.content;

        if (!assistantResponse) {
          throw new Error('No response content from OpenAI');
        }

        // --- Save Document --- 
        const savedFilePath = saveDocumentation(projectName, docType.id, assistantResponse);
        console.log(`Successfully generated and saved: ${savedFilePath}`);
        results.push({ docType: docType.id, success: true, filePath: savedFilePath });

      } catch (error: any) {
        console.error(`Error generating document type ${docType.id}:`, error);
        let errorMessage = error.message;
        if (error instanceof OpenAI.APIError) {
           errorMessage = `OpenAI API Error [${error.status}]: ${error.message}`;
        }
        results.push({ docType: docType.id, success: false, error: errorMessage });
        // Continue to the next document type even if one fails
      }
    }

    console.log(`Finished generating all documents for project: ${projectName}`);

    // --- Return Summary --- 
    return NextResponse.json({
      message: `Generated ${results.filter(r => r.success).length} out of ${documentationTypes.length} documents.`,
      results: results,
      projectName: projectName
    });

  } catch (error: any) {
    console.error('Error in generate-all API:', error);
    return NextResponse.json({ error: 'Failed to process generate-all request', details: error.message }, { status: 500 });
  }
} 