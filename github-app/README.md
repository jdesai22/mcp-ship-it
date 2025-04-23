# GitHub App Documentation Generator

This GitHub App automatically creates documentation from commits to repositories. It generates Markdown files with detailed information about each commit, including the files that were changed and their contents. On the first push to the main branch, it also automatically generates comprehensive technical documentation using OpenAI.

## Project Structure

The project has been organized into modular components:

- `app.js`: Main entry point for the application
- `server.js`: Server setup and initialization
- `config.js`: Configuration settings and environment variables
- `github-utils.js`: GitHub API utility functions
- `documentation-utils.js`: Functions for generating documentation
- `webhook-handlers.js`: Event handlers for GitHub webhook events

## Setup

1. Create a `.env` file with the following variables:
   ```
   APP_ID=your_app_id
   WEBHOOK_SECRET=your_webhook_secret
   PRIVATE_KEY_PATH=path_to_private_key
   MAIN_BRANCH=main
   OPENAI_API_KEY=your_openai_api_key
   MODEL_NAME=gpt-4.1-nano
   TEMPLATES_DIR=../templates
   VALID_FILE_EXTENSIONS=.js,.html,.css,.md,.json
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

## Features

- Listens for push events to GitHub repositories
- Generates detailed Markdown documentation for each commit
- Creates a file dictionary for tracking file changes
- Automatically generates comprehensive technical documentation on first push to main branch
- Intelligently updates technical documentation on subsequent pushes to main branch
- Uses AI to analyze code changes and update only the affected documentation sections
- Supports multiple repositories
- Handles large repositories by only scanning on the first push to the main branch

## Generated Documentation

### Commit Documentation

For each commit, the app generates a Markdown file with:

- YAML frontmatter with metadata
- Commit details (author, timestamp, branch)
- Full commit message
- List of modified files with their contents

Documentation is stored in the `output_docs/{repository}` directory.

### Technical Documentation

On the first push to the main branch, the app automatically generates comprehensive technical documentation following the Windsurf Meta-Workflow methodology. This includes:

- Project Overview
- Feature Specifications
- Requirements Documentation
- Tech Stack Documentation
- Dependencies Documentation
- User Flows
- Implementation Standards
- Project Structure

Technical documentation is stored in the `output_docs/{repository}/docs` directory.

### Documentation Updates

On subsequent pushes to the main branch, the app:

1. Detects which files have been modified
2. Determines which documentation sections may need updates
3. Uses AI to intelligently update only the affected documentation
4. Updates the version history in each modified document
5. Ensures the documentation stays in sync with the codebase

The app uses a smart heuristic to determine which documentation to update based on the file types that were changed:
- Code files (.js, .ts, etc.) → Update Implementation and Tech Stack docs
- Configuration files (package.json, .env, etc.) → Update Dependencies and Tech Stack docs
- UI files (.html, .css, etc.) → Update User Flow and Features docs
- All changes → Always check Project Structure and Project Overview docs

## Environment Variables

- `APP_ID`: GitHub App ID
- `WEBHOOK_SECRET`: Secret for GitHub webhook
- `PRIVATE_KEY_PATH`: Path to the private key file
- `MAIN_BRANCH`: Main branch name (default: main)
- `OPENAI_API_KEY`: OpenAI API key for generating technical documentation
- `MODEL_NAME`: OpenAI model to use (default: gpt-4.1-nano)
- `TEMPLATES_DIR`: Path to templates directory (default: ../templates)
- `VALID_FILE_EXTENSIONS`: Comma-separated list of file extensions to track (default: .js,.html,.css,.md,.json)

## License

ISC 