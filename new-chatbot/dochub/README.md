# DocHub - Technical Documentation Generator

A modern web application for generating comprehensive technical documentation with AI assistance, featuring a sleek dark mode interface with teal and blue accents.

## Features

- **AI-Powered Documentation Generation**: Leverages OpenAI to create high-quality technical documentation
- **Multiple Document Types**: Supports various document types including Project Overview, Features, Requirements, Tech Stack, and more
- **Project Management**: Create and manage multiple projects
- **Modern User Interface**: Dark theme with teal accents for a professional appearance
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **MCP Integration**: Upload generated documentation to the MCP server

## Tech Stack

- Next.js 14 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- OpenAI API Integration

## Prerequisites

- Node.js 18.x or later
- OpenAI API key
- MCP server for document upload (optional)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dochub.git
cd dochub
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
cp .env.example .env.local
```

4. Update the environment variables in `.env.local` with your own values:
```
OPENAI_API_KEY=your_openai_api_key_here
MCP_URL=http://your-mcp-server-url:port/context
```

## Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to access the application.

## Building for Production

Build the application for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Project Structure

- `src/app`: Next.js app router pages and API routes
- `src/components`: React components
- `src/lib`: Utility functions and API clients
- `public`: Static assets

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
