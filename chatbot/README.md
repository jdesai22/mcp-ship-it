# MCP Server Documentation Generator

This tool automatically generates technical documentation for an MCP server by analyzing a user's codebase and leveraging an LLM API (OpenAI's GPT-4 by default).

## Features

- Analyzes codebases with support for multiple programming languages
- Generates comprehensive documentation with markdown formatting
- Creates separate documentation files for different sections
- Builds an index file for easy navigation
- Configurable input and output directories
- Configuration via .env file

## Installation

1. Clone this repository
2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

3. Set up your environment variables:

```bash
cp .env.example .env
```

Then edit the `.env` file to add your OpenAI API key and other configuration options.

## Usage

### Setting up the API Key

Add your OpenAI API key to the `.env` file:

```
OPENAI_API_KEY=your-api-key-here
```

You can also configure the model and API URL in the same file:

```
MODEL_NAME=gpt-4.1-nano
LLM_API_URL=https://api.openai.com/v1/chat/completions
```

### Running the Tool

Basic usage with default paths:

```bash
python documentation_generator.py
```

This will analyze the codebase at `/Users/jaidesai/mcp-ship-it/demo-codebase` and generate documentation in `/Users/jaidesai/mcp-ship-it/technical-docs`.

Custom paths:

```bash
python documentation_generator.py --codebase /path/to/your/codebase --output /path/to/output
```

## Documentation Output

The tool generates:

1. Multiple markdown (.md) files, each containing a different section of the documentation
2. An index.md file that links to all the sections

The documentation covers:
- Architecture Overview
- Components
- API Documentation
- Data Flow
- Deployment Guide
- Configuration Options
- Security Considerations

## Customization

You can modify the `SUPPORTED_FILE_EXTENSIONS` list in the script to include or exclude specific file types from the analysis.

## Troubleshooting

If you encounter any issues, check the log output for detailed error messages. Common issues include:

- Missing API key: Ensure the OPENAI_API_KEY environment variable is set
- API rate limits: If you hit rate limits, try again later or adjust the code to include backoff/retry logic
- Large codebases: For very large codebases, consider analyzing only specific directories to stay within token limits

## License

This project is licensed under the MIT License. 