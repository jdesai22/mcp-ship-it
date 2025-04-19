# Technical Documentation Generator Chatbot

This chatbot helps users generate comprehensive technical documentation for their projects following the Windsurf Meta-Workflow methodology. It leverages an LLM (Language Learning Model) to create structured documentation that follows industry best practices.

## Features

- Interactive chat interface to describe your project
- Generates various types of technical documentation:
  - Project Overview
  - Feature Specifications
  - Requirements Documentation
  - Tech Stack Documentation
  - Dependencies Documentation
  - User Flows
  - Implementation Standards
  - Project Structure
- **NEW**: Generate complete documentation sets with one click (no conversation required)
- Saves generated documentation to project-specific folders in the output-docs directory
- Follows the Windsurf Meta-Workflow methodology
- Built-in document templates with proper structure
- Maintains version history and memory context

## Installation

1. Clone the repository
2. Navigate to the chatbot directory
3. Install dependencies:

```bash
npm install
```

4. Copy `.env.example` to `.env` and set your OpenAI API key:

```bash
cp .env.example .env
```

5. Edit the `.env` file and replace `your_openai_api_key_here` with your actual OpenAI API key

## Usage

1. Start the server:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:3000`

3. Enter your project name in the sidebar

4. Choose a documentation method:
   - **Quick Start**: Simply enter your project name and click "Generate All Documents" to create a complete documentation set instantly
   - **Custom Approach**: Chat with the AI first to describe your project, then either:
     - Select a specific document type to generate individual documents, OR
     - Click "Generate All Documents" to create a complete set of documentation based on your conversation

5. The AI will generate documentation based on your input

6. Generated documents are saved to a project-specific folder within output-docs

## Documentation Structure

The generated documentation follows a structured format based on the Windsurf Meta-Workflow methodology, including:

- **Memory Context**: Shows relationships with other documents
- **Version History**: Tracks document versions and updates
- **Document Content**: Following the specific template for the document type
- **Self-Critique**: Documents the review and improvement process

## Complete Documentation Set

When using the "Generate All Documents" feature:

1. All eight documentation types are generated at once
2. Documents are saved in a project-specific folder named after your project
3. An index.md file is created to help navigate the documentation set
4. A modal displays links to all generated documents for easy access

This complete documentation set provides a comprehensive overview of your project from all angles, making it easier to onboard new team members, communicate with stakeholders, and maintain a clear understanding of the project over time.

You can generate documentation in two ways:
- **With no project description**: Just enter a project name and click "Generate All Documents" - the system will create generic documentation you can later customize
- **With a project description**: Chat with the AI about your project first, then click "Generate All Documents" to create more tailored documentation

## Dependencies

- Express.js - Web server framework
- OpenAI API - LLM integration
- Bootstrap - Frontend styling
- Marked - Markdown parsing
- Dotenv - Environment variable management

## License

This project is private and not licensed for public use. 