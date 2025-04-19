#!/usr/bin/env python3
"""
Documentation Generator for MCP Server

This script analyzes a user's codebase and generates technical documentation
by leveraging an LLM API. The documentation is saved to the technical-docs folder.
"""

import os
import glob
import json
import argparse
from typing import Dict, List, Optional
import requests
from pathlib import Path
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('mcp-doc-generator')

# Constants
DEMO_CODEBASE_PATH = Path('/Users/jaidesai/mcp-ship-it/demo-codebase')
TECHNICAL_DOCS_PATH = Path('/Users/jaidesai/mcp-ship-it/technical-docs')
SUPPORTED_FILE_EXTENSIONS = ['.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.c', '.cpp', '.h', '.hpp', '.go', '.rb', '.php', '.html', '.css', '.md']

# Get LLM API details from .env file
LLM_API_URL = os.getenv("LLM_API_URL", "https://api.openai.com/v1/chat/completions")
LLM_API_KEY = os.getenv("OPENAI_API_KEY")  # Get API key from .env file
LLM_MODEL_NAME = os.getenv("MODEL_NAME", "gpt-4.1-nano")  # Get model name from .env file

class CodebaseAnalyzer:
    """Analyzes a codebase directory and extracts relevant information."""
    
    def __init__(self, codebase_path: Path):
        self.codebase_path = codebase_path
        
    def get_file_list(self) -> List[Path]:
        """Returns a list of code files in the codebase."""
        file_list = []
        for ext in SUPPORTED_FILE_EXTENSIONS:
            file_list.extend(self.codebase_path.glob(f"**/*{ext}"))
        return file_list
    
    def read_file(self, file_path: Path) -> str:
        """Reads the content of a file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error reading file {file_path}: {e}")
            return ""
    
    def extract_file_info(self, file_path: Path) -> Dict:
        """Extracts information about a single file."""
        relative_path = file_path.relative_to(self.codebase_path)
        content = self.read_file(file_path)
        return {
            "path": str(relative_path),
            "extension": file_path.suffix,
            "size_bytes": file_path.stat().st_size,
            "content": content
        }
    
    def analyze(self) -> Dict:
        """Analyzes the entire codebase and returns structured information."""
        files = self.get_file_list()
        file_info = [self.extract_file_info(f) for f in files]
        
        # Basic codebase stats
        extensions_count = {}
        total_size = 0
        
        for file in file_info:
            ext = file["extension"]
            extensions_count[ext] = extensions_count.get(ext, 0) + 1
            total_size += file["size_bytes"]
        
        return {
            "files": file_info,
            "file_count": len(file_info),
            "total_size_bytes": total_size,
            "languages": extensions_count
        }


class DocumentationGenerator:
    """Generates documentation using an LLM API based on codebase analysis."""
    
    def __init__(self, api_url: str, api_key: Optional[str] = None):
        self.api_url = api_url
        self.api_key = api_key
        
    def generate_docs(self, codebase_data: Dict) -> Dict:
        """Generates documentation by sending codebase data to an LLM API."""
        if not self.api_key:
            logger.error("API key not provided. Set the OPENAI_API_KEY in your .env file.")
            return {"error": "API key not provided"}
            
        # Create prompt for the LLM
        prompt = self._create_prompt(codebase_data)
        
        # Make request to the LLM API
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            payload = {
                "model": LLM_MODEL_NAME,  # Use model name from .env file
                "messages": [
                    {"role": "system", "content": "You are a technical documentation expert for MCP servers."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2,  # More deterministic output
                "max_tokens": 4000
            }
            
            response = requests.post(self.api_url, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            if "choices" in result and len(result["choices"]) > 0:
                documentation = result["choices"][0]["message"]["content"]
                return self._parse_documentation(documentation)
            else:
                logger.error(f"Unexpected API response: {result}")
                return {"error": "Unexpected API response format"}
                
        except requests.exceptions.RequestException as e:
            logger.error(f"API request error: {e}")
            return {"error": f"API request failed: {str(e)}"}
    
    def _create_prompt(self, codebase_data: Dict) -> str:
        """Creates a detailed prompt for the LLM based on codebase analysis."""
        files_summary = "\n".join([f"- {file['path']} ({file['size_bytes']} bytes)" 
                                  for file in codebase_data["files"][:10]])
        
        if len(codebase_data["files"]) > 10:
            files_summary += f"\n- ... and {len(codebase_data['files']) - 10} more files"
        
        # Include content of a few important files (limiting total size)
        file_contents = ""
        total_content_size = 0
        max_content_size = 10000  # Limit to ~10KB of code content
        
        for file in codebase_data["files"]:
            if total_content_size > max_content_size:
                break
                
            content_snippet = file["content"][:2000]  # First 2KB of each file max
            if len(file["content"]) > 2000:
                content_snippet += "\n... (truncated)"
                
            file_contents += f"\n\nFile: {file['path']}\n```{file['extension'][1:]}\n{content_snippet}\n```"
            total_content_size += len(content_snippet)
        
        prompt = f"""
        Generate comprehensive technical documentation for an MCP server based on this codebase analysis:
        
        Codebase Summary:
        - Total files: {codebase_data['file_count']}
        - Total size: {codebase_data['total_size_bytes']} bytes
        - Languages: {', '.join([f"{ext[1:]}: {count}" for ext, count in codebase_data['languages'].items()])}
        
        Files:
        {files_summary}
        
        Selected File Contents:
        {file_contents}
        
        Please generate the following documentation sections:
        1. Architecture Overview: High-level description of the system architecture
        2. Components: Breakdown of major components and their interactions
        3. API Documentation: If applicable, document key APIs
        4. Data Flow: Describe how data flows through the system
        5. Deployment Guide: Instructions for deploying the MCP server
        6. Configuration Options: Available configuration parameters
        7. Security Considerations: Security features and best practices
        
        Format each section with Markdown headings and code blocks where appropriate.
        Structure the response in a way that it can be split into separate documentation files.
        """
        
        return prompt
    
    def _parse_documentation(self, documentation: str) -> Dict:
        """Parses the LLM response into structured documentation sections."""
        # Basic parsing - split by Markdown headings
        import re
        
        # Get top-level sections (# Heading)
        sections = re.split(r'\n#\s+', documentation)
        
        # First item might be empty or intro text
        if sections[0].strip() == "":
            sections = sections[1:]
        else:
            sections[0] = "# " + sections[0]  # Add heading marker back to first section
            
        # For remaining sections, add the heading marker back
        for i in range(1, len(sections)):
            sections[i] = "# " + sections[i]
            
        # Create a dictionary of documentation sections
        docs = {
            "overview": sections[0] if len(sections) > 0 else "",
            "sections": sections,
            "raw": documentation
        }
        
        return docs


class DocumentationWriter:
    """Saves generated documentation to files."""
    
    def __init__(self, output_path: Path):
        self.output_path = output_path
        
    def write_docs(self, docs: Dict) -> List[Path]:
        """Writes documentation to files."""
        if not self.output_path.exists():
            self.output_path.mkdir(parents=True, exist_ok=True)
            
        written_files = []
        
        # Write each section to a separate file
        for i, section in enumerate(docs.get("sections", [])):
            # Extract section title from the markdown heading
            import re
            title_match = re.match(r'#\s+(.*?)(\n|$)', section)
            if title_match:
                title = title_match.group(1).strip()
                filename = re.sub(r'[^\w\s-]', '', title).lower().replace(' ', '-')
            else:
                filename = f"section-{i+1}"
                
            file_path = self.output_path / f"{filename}.md"
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(section)
                written_files.append(file_path)
                logger.info(f"Wrote documentation section to {file_path}")
            except Exception as e:
                logger.error(f"Error writing to {file_path}: {e}")
                
        # Create an index file
        index_content = "# MCP Server Documentation\n\n"
        index_content += "Generated documentation for the MCP server.\n\n"
        index_content += "## Sections\n\n"
        
        for file_path in written_files:
            filename = file_path.name
            title = filename.replace('-', ' ').replace('.md', '').title()
            index_content += f"- [{title}]({filename})\n"
            
        index_path = self.output_path / "index.md"
        try:
            with open(index_path, 'w', encoding='utf-8') as f:
                f.write(index_content)
            written_files.append(index_path)
            logger.info(f"Wrote documentation index to {index_path}")
        except Exception as e:
            logger.error(f"Error writing index to {index_path}: {e}")
            
        return written_files


def main():
    """Main function to run the documentation generator."""
    parser = argparse.ArgumentParser(description='Generate MCP server documentation from codebase.')
    parser.add_argument('--codebase', type=str, default=str(DEMO_CODEBASE_PATH),
                        help='Path to the codebase directory')
    parser.add_argument('--output', type=str, default=str(TECHNICAL_DOCS_PATH),
                        help='Path to output documentation')
    args = parser.parse_args()
    
    codebase_path = Path(args.codebase)
    output_path = Path(args.output)
    
    logger.info(f"Starting documentation generation for codebase at {codebase_path}")
    
    # Analyze codebase
    analyzer = CodebaseAnalyzer(codebase_path)
    codebase_data = analyzer.analyze()
    logger.info(f"Analyzed {codebase_data['file_count']} files in the codebase")
    
    # Generate documentation
    doc_generator = DocumentationGenerator(LLM_API_URL, LLM_API_KEY)
    documentation = doc_generator.generate_docs(codebase_data)
    
    if "error" in documentation:
        logger.error(f"Documentation generation failed: {documentation['error']}")
        return
        
    logger.info("Documentation generated successfully")
    
    # Write documentation to files
    writer = DocumentationWriter(output_path)
    written_files = writer.write_docs(documentation)
    
    logger.info(f"Documentation written to {len(written_files)} files in {output_path}")
    logger.info("Documentation generation complete!")


if __name__ == "__main__":
    main() 