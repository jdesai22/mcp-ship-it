/**
 * Main entry point for the GitHub App
 * 
 * This file serves as the simple entry point to the application.
 * All functionality has been moved to modular files for better organization:
 * 
 * - config.js: Contains all configuration and environment variables
 * - github-utils.js: Contains GitHub API related utility functions
 * - documentation-utils.js: Contains functions for generating documentation
 * - webhook-handlers.js: Contains handlers for webhook events
 * - server.js: Contains server initialization and middleware setup
 */

import { server } from './server.js';
import { port, localWebhookUrl, templatesDir } from './config.js';
import fs from 'fs';
import path from 'path';

// Ensure templates directory exists
ensureTemplatesExist();

// Start the server
server.listen(port, () => {
  console.log(`Server is listening for events at: ${localWebhookUrl}`);
  console.log('Press Ctrl + C to quit.');
});

/**
 * Ensure that the templates directory exists and contains necessary template files
 */
function ensureTemplatesExist() {
  const templatesPath = path.join(process.cwd(), templatesDir);
  
  // Create templates directory if it doesn't exist
  if (!fs.existsSync(templatesPath)) {
    console.log(`Creating templates directory at ${templatesPath}`);
    fs.mkdirSync(templatesPath, { recursive: true });
  }
  
  // Check if meta-workflow-integration-template.md exists
  const templatePath = path.join(templatesPath, 'meta-workflow-integration-template.md');
  if (!fs.existsSync(templatePath)) {
    console.log('Creating meta-workflow-integration-template.md template file');
    
    // Basic version of the template if the full one isn't available
    const basicTemplate = `# Meta-Workflow Integration Guide

This document provides guidance on integrating the Windsurf Meta-Workflow methodology with the project documentation templates. It helps establish a structured memory system and workflow approach for AI-assisted development.

## Documentation Template Structure

### Project Overview
- Vision Statement
- Problem Statement
- Solution Approach
- Target Audience
- Success Metrics
- Project Scope
- Risk Assessment
- Success Criteria

### Memory Context
This document forms part of the project's Memory Bank and should be updated whenever relevant changes occur. It maintains the following relationships with other Memory Bank components:

- **Informs:** [List of documents this document informs]
- **Informed by:** [List of documents that inform this document]
- **Dependencies:** [List of external dependencies for this document]

### Version History
| Date | Editor | Changes | Memory Update Status |
|------|--------|---------|----------------------|
| [Date] | [Editor] | [Initial creation] | [Complete] |

### Documentation Self-Critique
- Initial documentation created on [date]
- Documentation review identified issues
- Issues addressed
- Documentation improvement metrics
`;
    
    // Write the template file
    fs.writeFileSync(templatePath, basicTemplate);
    console.log('Meta-workflow template created successfully');
  } else {
    console.log('Meta-workflow template already exists');
  }
}

