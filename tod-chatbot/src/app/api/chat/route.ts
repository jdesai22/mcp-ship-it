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

// Helper function to ensure project directory exists
const ensureProjectFolder = (projectName: string): string => {
  // Basic sanitization for folder name
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

// Helper function to generate filename
const generateFilename = (docType: string): string => {
  // Simple filename based on doctype
  return `${docType.toLowerCase().replace(/\s+/g, '_')}.md`;
};

// Helper function to save documentation
const saveDocumentation = (projectName: string, docType: string, content: string): string => {
  const projectPath = ensureProjectFolder(projectName);
  const filename = generateFilename(docType);
  const filePath = path.join(projectPath, filename);
  
  console.log(`Saving document to: ${filePath}`);
  fs.writeFileSync(filePath, content);
  
  // Return the relative path for the ID
  return path.relative(outputDir, filePath).replace(/\\/g, '/'); 
};

// Helper function to load a template (adjust path as needed)
const loadTemplate = (templateName: string): string | null => {
  try {
    // Assuming templates are in a sibling directory `templates` relative to `tod-chatbot` parent
    const templatePath = path.join(templatesDir, `${templateName}.md`); // Simple naming convention
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

// Main chat handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      projectName = 'default-project', 
      documentType, // e.g., 'ProjectOverview', 'Features'
      userMessage,
      history = [], // Expecting [{ role: 'user' | 'assistant', content: string }]
      saveDoc = false // Flag to indicate if the final response should be saved
    } = body;

    if (!userMessage) {
      return NextResponse.json({ error: 'userMessage is required' }, { status: 400 });
    }

    // --- Prompt Construction --- 
    let systemPrompt = "You are an expert AI assistant specializing in generating technical documentation based on the Windsurf Meta-Workflow methodology. Follow the user's instructions precisely.";
    
    let loadedTemplateContent: string | null = null;
    if (documentType) {
      systemPrompt += `\n\nThe user wants to generate documentation for: ${documentType}.`;
      // Attempt to load a template if a document type is specified
      loadedTemplateContent = loadTemplate(documentType); // Assumes template file name matches documentType id
      if (loadedTemplateContent) {
        systemPrompt += `\n\nPlease use the following template structure as a guide:\n\n${loadedTemplateContent}`;
      } else {
        systemPrompt += `\nStructure the document logically based on the type: ${documentType}.`;
      }
    }

    if (projectName) {
        systemPrompt += `\nThe project context is: ${projectName}.`;
    }
    
    // --- OpenAI API Call --- 
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history, // Spread the existing history
      { role: 'user', content: userMessage }
    ];

    console.log('Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Or your preferred model
      messages: messages,
      temperature: 0.7, // Adjust as needed
    });

    const assistantResponse = completion.choices[0]?.message?.content;

    if (!assistantResponse) {
      throw new Error('No response content from OpenAI');
    }

    console.log('Received response from OpenAI.');

    // --- Document Saving (Optional) --- 
    let savedFilePath: string | null = null;
    if (saveDoc && documentType && projectName) {
        try {
            savedFilePath = saveDocumentation(projectName, documentType, assistantResponse);
            console.log(`Document saved successfully: ${savedFilePath}`);
        } catch (saveError) {
            console.error('Failed to save document:', saveError);
            // Decide if this should be a user-facing error or just logged
        }
    }

    // --- Return Response --- 
    return NextResponse.json({
      response: assistantResponse,
      savedDocumentPath: savedFilePath // Include path if saved
    });

  } catch (error: any) {
    console.error('Error in chat API:', error);
    let errorMessage = 'Failed to process chat request';
    if (error.response) {
        console.error('OpenAI API Error Status:', error.response.status);
        console.error('OpenAI API Error Data:', error.response.data);
        errorMessage = `OpenAI API Error: ${error.response.data?.error?.message || error.message}`;
    } else if (error instanceof OpenAI.APIError) {
        errorMessage = `OpenAI API Error [${error.status}]: ${error.message}`;
    } else if (error.message) {
        errorMessage = error.message;
    }
     
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 