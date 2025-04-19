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
- Saves generated documentation to the output-docs directory
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

3. Enter your project details in the sidebar:
   - Project Name
   - Document Type

4. Chat with the AI to describe your project

5. The AI will generate documentation based on your input

6. Save the documentation when ready

## Documentation Structure

The generated documentation follows a structured format based on the Windsurf Meta-Workflow methodology, including:

- **Memory Context**: Shows relationships with other documents
- **Version History**: Tracks document versions and updates
- **Document Content**: Following the specific template for the document type
- **Self-Critique**: Documents the review and improvement process

## Dependencies

- Express.js - Web server framework
- OpenAI API - LLM integration
- Bootstrap - Frontend styling
- Marked - Markdown parsing
- Dotenv - Environment variable management

## License

This project is private and not licensed for public use. 