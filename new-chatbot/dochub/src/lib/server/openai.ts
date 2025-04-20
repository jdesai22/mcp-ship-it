import OpenAI from 'openai';
import { loadTemplate } from './templates';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Define model name from environment or use default
const modelName = process.env.MODEL_NAME || 'gpt-4.1-nano';

// Default system message for the chatbot
const getSystemMessage = () => {
  // Load the workflow template to guide the AI response
  const metaWorkflowTemplate = loadTemplate('meta-workflow-integration-template.md');
  
  return {
    role: 'system',
    content: `You are a technical documentation assistant that helps users create comprehensive project documentation following the Windsurf Meta-Workflow methodology. 
      
Your task is to generate detailed technical documentation based on the user's project description and requirements.

Follow these guidelines:
1. Use the provided template structure for consistency
2. Ask clarifying questions if the user's input lacks detail
3. Generate thorough, detailed content for each section of the documentation
4. Include memory context and version history as per Windsurf methodology
5. Incorporate self-critique sections as described in the methodology
6. Format the content properly using Markdown

The Windsurf Meta-Workflow Template provides the structure to follow:

${metaWorkflowTemplate ? metaWorkflowTemplate : "Template not available, use standard documentation structure."}

If the user asks for a specific document type (like "Project Overview" or "Tech Stack"), focus on generating that document. Otherwise, help them determine what documentation they need.

Always include a "Memory Context" section that shows relationships with other documents, a "Version History" table, and a "Documentation Self-Critique" section in the generated documentation.`
  };
};

// Interface for chat message
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Generate a single document using OpenAI
export const generateDocument = async (
  messages: ChatMessage[],
  projectName?: string,
  documentType?: string
): Promise<{ content: string; message: ChatMessage }> => {
  try {
    // Add system message if not already present
    const allMessages = messages[0]?.role === 'system' 
      ? messages 
      : [getSystemMessage(), ...messages];
    
    // If document type is provided, add a specific instruction
    if (documentType && projectName) {
      const lastUserMessage = allMessages.filter(m => m.role === 'user').pop();
      const projectInfo = lastUserMessage ? lastUserMessage.content : '';
      
      allMessages.push({
        role: 'user',
        content: `Please generate the "${documentType}" documentation for my project named "${projectName}". Here's the information about my project: ${projectInfo}`
      });
    }
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      messages: allMessages as any,
      model: modelName,
      temperature: 0.7,
      max_tokens: 4000,
    });
    
    const generatedContent = completion.choices[0].message.content || '';
    
    return {
      content: generatedContent,
      message: {
        role: 'assistant',
        content: generatedContent
      }
    };
  } catch (error) {
    console.error('Error generating document with OpenAI:', error);
    throw error;
  }
};

// Generate multiple documents using OpenAI
export const generateAllDocuments = async (
  messages: ChatMessage[],
  projectName: string,
  documentTypes: { id: string; name: string }[]
): Promise<{ documentType: string; content: string }[]> => {
  try {
    // Get system message
    const systemMessage = getSystemMessage();
    
    // Generate documents for each type
    const results = await Promise.all(
      documentTypes.map(async (docType) => {
        // Create a modified message specifically for this document type
        const docTypeMessage = {
          role: 'user' as const,
          content: `Please generate the "${docType.name}" documentation for my project named "${projectName}". Here's the information about my project: ${messages[messages.length - 1]?.content || ''}`
        };
        
        // Create a specific message array for this document type
        const docTypeMessages = [systemMessage];
        
        // Only add previous conversation context if it exists and makes sense
        if (messages.length > 1) {
          docTypeMessages.push(...messages.slice(0, -1));
        }
        
        // Add the document-specific request
        docTypeMessages.push(docTypeMessage);
        
        // Call OpenAI API for this document type
        const completion = await openai.chat.completions.create({
          messages: docTypeMessages as any,
          model: modelName,
          temperature: 0.7,
          max_tokens: 4000,
        });
        
        const generatedContent = completion.choices[0].message.content || '';
        
        return {
          documentType: docType.id,
          content: generatedContent
        };
      })
    );
    
    return results;
  } catch (error) {
    console.error('Error generating multiple documents with OpenAI:', error);
    throw error;
  }
};

export default openai; 