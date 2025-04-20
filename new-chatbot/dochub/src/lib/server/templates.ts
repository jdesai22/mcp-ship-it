import fs from 'fs';
import path from 'path';

// Define the path to the templates directory
const templatesDir = process.env.TEMPLATES_DIR || path.join(process.cwd(), 'templates');
const sampleTemplatesDir = path.join(process.cwd(), 'sample-templates');

// Define document types
export const documentationTypes = [
  { id: 'ProjectOverview', name: 'Project Overview', description: 'Provides a high-level overview of the project, including vision, scope, and goals' },
  { id: 'Features', name: 'Feature Specifications', description: 'Details the features of the project, their priorities, and dependencies' },
  { id: 'Requirements', name: 'Requirements Documentation', description: 'Outlines functional and technical requirements for the project' },
  { id: 'TechStack', name: 'Tech Stack Documentation', description: 'Documents the technologies used in the project and justifications' },
  { id: 'Dependencies', name: 'Dependencies Documentation', description: 'Lists all project dependencies with versions and context' },
  { id: 'UserFlow', name: 'User Flows', description: 'Maps out the user journeys through the application' },
  { id: 'Implementation', name: 'Implementation Standards', description: 'Defines coding standards and implementation practices' },
  { id: 'ProjectStructure', name: 'Project Structure', description: 'Documents the organization of files and directories' }
];

// Load a template by name
export const loadTemplate = (templateName: string): string | null => {
  try {
    // First check in the primary templates directory
    const primaryPath = path.join(templatesDir, templateName);
    if (fs.existsSync(primaryPath)) {
      return fs.readFileSync(primaryPath, 'utf8');
    }
    
    // If not found, check in sample templates
    const samplePath = path.join(sampleTemplatesDir, templateName);
    if (fs.existsSync(samplePath)) {
      return fs.readFileSync(samplePath, 'utf8');
    }
    
    // Create fallback templates for common document types
    if (templateName === 'meta-workflow-integration-template.md') {
      return `# Windsurf Meta-Workflow Template

## Memory Context
- **Informs:** [List documents informed by this document]
- **Informed by:** [List documents that inform this document]
- **Dependencies:** [List any dependencies]

## Version History
| Date | Editor | Changes | Status |
|------|--------|---------|--------|
| [Current Date] | [Editor] | Initial creation | Complete |

## [Main Content Sections Based on Document Type]

## Documentation Self-Critique

### Creator Phase
Draft created on [date].

### Self-Evaluation Phase
Checked against Dos/Don'ts (10 points total):
- Dos: Specific? [Yes/No]. Justified? [Yes/No]. Edge cases? [Yes/No]. Self-evaluated? [Yes/No]. Examples? [Yes/No].
- Don'ts: Avoided vague? [Yes/No]. Skipped rationale? [Yes/No]. Ignored readers? [Yes/No]. Overcomplicated? [Yes/No]. Unchecked? [Yes/No].
- **Score**: [X]/10

### Review Phase
Scored against criteria (baseline 4/5).

### Outcome
- [Pass/Fail]

## Next Steps
1. [Next step 1]
2. [Next step 2]
3. [Next step 3]`;
    }
    
    // If template not found anywhere, return null
    return null;
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    return null;
  }
};

// Check if templates directory exists, create if not
export const ensureTemplatesDirectory = (): void => {
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
};

// Check if sample templates directory exists, create if not
export const ensureSampleTemplatesDirectory = (): void => {
  if (!fs.existsSync(sampleTemplatesDir)) {
    fs.mkdirSync(sampleTemplatesDir, { recursive: true });
  }
};

// Initialize sample templates
export const initializeSampleTemplates = (): void => {
  ensureSampleTemplatesDirectory();
  
  // Project Overview template
  const projectOverviewTemplate = `# Project Overview - [Project Name]

**Last Updated:** [Current Date]  
**Memory Bank Status:** [Complete/Incomplete]  
**Workflow Phase:** [Initialization/Planning/Implementation/Review/Maintenance]

## Memory Context
- **Informs:** [Feature Specs, Requirements, Tech Stack]
- **Informed by:** [Initial project requirements, stakeholder interviews]
- **Dependencies:** [None or list specific dependencies]

## Version History
| Date         | Editor | Changes             | Status  |
|--------------|--------|---------------------|---------|
| [Date]       | [Name] | Initial creation    | Complete|

## Vision Statement

[A concise statement describing the long-term vision for the project, including its purpose, target audience, and primary value proposition. This should be 2-3 paragraphs that clearly articulate what the project aims to achieve.]

## Project Scope

### In Scope

[Bulleted list of features, capabilities, or components that are definitely included in the project]

### Out of Scope

[Bulleted list of features, capabilities, or components that are explicitly excluded from the project]

## Project Goals

1. **Primary Goal**: [Concise statement of the main goal]
   - **Success Metric**: [How this goal will be measured]
   - **Timeline**: [Timeline for achieving this goal]

2. **Secondary Goal**: [Concise statement of secondary goal]
   - **Success Metric**: [How this goal will be measured]
   - **Timeline**: [Timeline for achieving this goal]

## Success Criteria

1. **Technical Success**: 
   [Specific, measurable criteria that define technical success for the project]

2. **User Success**:
   [Specific, measurable criteria that define user-focused success for the project]

3. **Business Success**:
   [Specific, measurable criteria that define business success for the project]

## Stakeholders

1. **[Stakeholder Group 1]**: [Description of this stakeholder group and their interests]
2. **[Stakeholder Group 2]**: [Description of this stakeholder group and their interests]

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|------------|---------------------|
| [Risk 1] | High/Medium/Low | High/Medium/Low | [Strategy to mitigate this risk] |
| [Risk 2] | High/Medium/Low | High/Medium/Low | [Strategy to mitigate this risk] |

## Documentation Self-Critique

### Creator Phase
Draft created on [date] per \`createProjectOverview\`.

### Self-Evaluation Phase
Checked against Dos/Don'ts (10 points total):
- Dos: Specific? [Yes/No]. Justified? [Yes/No]. Edge cases? [Yes/No]. Self-evaluated? [Yes/No]. Examples? [Yes/No]. ([X]/5)
- Don'ts: Avoided vague? [Yes/No]. Skipped rationale? [Yes/No]. Ignored readers? [Yes/No]. Overcomplicated? [Yes/No]. Unchecked? [Yes/No]. ([X]/5)
- **Score**: [X]/10

### Review Phase
Scored against 5 criteria (baseline 4/5):
1. Clear project vision - [Yes/No]
2. Well-defined scope - [Yes/No]
3. Specific, measurable goals - [Yes/No]
4. Concrete success criteria - [Yes/No]
5. Identified stakeholders - [Yes/No]
- **Initial Score**: [X]/5

### Outcome
- [Pass/Fail] ([X]/5)

## Next Steps
1. [Next step 1]
2. [Next step 2]
3. [Next step 3]`;
  
  // Tech Stack template
  const techStackTemplate = `# Tech Stack - [Project Name]

**Last Updated:** [Current Date]  
**Memory Bank Status:** [Complete/Incomplete]  
**Workflow Phase:** [Initialization/Planning/Implementation/Review/Maintenance]

## Memory Context
- **Informs:** [Dependencies Documentation, Implementation Standards]
- **Informed by:** [Project Overview, Feature Specifications, Requirements]
- **Dependencies:** [List any dependencies]

## Version History
| Date         | Editor | Changes             | Status  |
|--------------|--------|---------------------|---------|
| [Date]       | [Name] | Initial creation    | Complete|

## Frontend Stack

### Framework: [Framework Name]
- **Version:** [Version information]
- **Justification:** [Why this framework was chosen, including specific benefits for this project]
- **Alternatives Considered:** 
  - [Alternative 1]: [Why it wasn't chosen]
  - [Alternative 2]: [Why it wasn't chosen]

### UI Library: [UI Library Name]
- **Version:** [Version information]
- **Justification:** [Why this UI library was chosen, including specific benefits for this project]
- **Alternatives Considered:**
  - [Alternative 1]: [Why it wasn't chosen]
  - [Alternative 2]: [Why it wasn't chosen]

## Backend Stack

### API Framework: [API Framework Name]
- **Version:** [Version information]
- **Justification:** [Why this API framework was chosen, including specific benefits for this project]
- **Alternatives Considered:**
  - [Alternative 1]: [Why it wasn't chosen]
  - [Alternative 2]: [Why it wasn't chosen]

### Database: [Database Name]
- **Version:** [Version information]
- **Justification:** [Why this database was chosen, including specific benefits for this project]
- **Alternatives Considered:**
  - [Alternative 1]: [Why it wasn't chosen]
  - [Alternative 2]: [Why it wasn't chosen]

## DevOps Stack

### CI/CD: [CI/CD System]
- **Version:** [Version information]
- **Justification:** [Why this CI/CD system was chosen, including specific benefits for this project]
- **Alternatives Considered:**
  - [Alternative 1]: [Why it wasn't chosen]
  - [Alternative 2]: [Why it wasn't chosen]

### Deployment: [Deployment Platform]
- **Version:** [Version information]
- **Justification:** [Why this deployment platform was chosen, including specific benefits for this project]
- **Alternatives Considered:**
  - [Alternative 1]: [Why it wasn't chosen]
  - [Alternative 2]: [Why it wasn't chosen]

## Testing Stack

### Unit Testing: [Unit Testing Framework]
- **Version:** [Version information]
- **Justification:** [Why this unit testing framework was chosen, including specific benefits for this project]
- **Alternatives Considered:**
  - [Alternative 1]: [Why it wasn't chosen]
  - [Alternative 2]: [Why it wasn't chosen]

## Documentation Self-Critique

### Creator Phase
Draft created on [date] per \`createTechStack\`.

### Self-Evaluation Phase
Checked against Dos/Don'ts (10 points total):
- Dos: Specific? [Yes/No]. Justified? [Yes/No]. Edge cases? [Yes/No]. Self-evaluated? [Yes/No]. Examples? [Yes/No]. ([X]/5)
- Don'ts: Avoided vague? [Yes/No]. Skipped rationale? [Yes/No]. Ignored readers? [Yes/No]. Overcomplicated? [Yes/No]. Unchecked? [Yes/No]. ([X]/5)
- **Score**: [X]/10

### Review Phase
Scored against 5 criteria (baseline 4/5):
1. Comprehensive technology coverage - [Yes/No]
2. Clear justification for each choice - [Yes/No]
3. Alternatives considered and evaluated - [Yes/No]
4. Compatible technology versions - [Yes/No]
5. Appropriate categorization - [Yes/No]
- **Initial Score**: [X]/5

### Outcome
- [Pass/Fail] ([X]/5)

## Next Steps
1. [Next step 1]
2. [Next step 2]
3. [Next step 3]`;
  
  // Write the templates to the sample templates directory if they don't exist
  const projectOverviewPath = path.join(sampleTemplatesDir, 'project-overview-template.md');
  if (!fs.existsSync(projectOverviewPath)) {
    fs.writeFileSync(projectOverviewPath, projectOverviewTemplate);
  }
  
  const techStackPath = path.join(sampleTemplatesDir, 'tech-stack-template.md');
  if (!fs.existsSync(techStackPath)) {
    fs.writeFileSync(techStackPath, techStackTemplate);
  }
}; 