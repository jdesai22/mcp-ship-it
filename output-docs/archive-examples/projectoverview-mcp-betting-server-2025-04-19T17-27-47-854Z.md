Certainly! Based on your project to create an MCP (Multi-Channel Platform) server for sports betting, including relevant context, APIs, tools, and techniques, I will generate a comprehensive project documentation following the Windsurf Meta-Workflow methodology.

---

# Meta-Workflow Integration Guide

This document provides guidance on integrating the Windsurf Meta-Workflow methodology with the project documentation templates. It helps establish a structured memory system and workflow approach for AI-assisted development.

## XML-Based Function Mapping

```xml
<?xml version="1.0" encoding="UTF-8"?>
<DocumentationFunctionMap version="1.0">
  <!-- Documentation Component Functions -->
  <Component id="ProjectOverview">
    <Function id="createProjectBrief">Create the foundational project brief document</Function>
    <Function id="defineVisionStatement">Define the long-term vision for the project</Function>
    <Function id="defineProblemStatement">Articulate specific problems the project solves</Function>
    <Function id="defineSolutionApproach">Document how the solution addresses problems</Function>
    <Function id="identifyTargetAudience">Define primary and secondary user groups</Function>
    <Function id="establishSuccessMetrics">Define measurable success criteria</Function>
    <Function id="defineProjectScope">Document release scope and future plans</Function>
    <Function id="assessRisks">Identify and document key project risks</Function>
    <Function id="defineSuccessCriteria">Establish project success evaluation framework</Function>
  </Component>

  <Component id="Features">
    <Function id="documentCoreFeatures">Document all primary features</Function>
    <Function id="defineFutureRoadmap">Outline future feature development plans</Function>
    <Function id="prioritizeFeatures">Establish implementation priority order</Function>
    <Function id="mapFeatureDependencies">Document inter-feature dependencies</Function>
    <Function id="defineFeatureComponents">Break down features into components</Function>
    <Function id="documentFeatureCapabilities">Document specific capabilities within features</Function>
  </Component>

  <Component id="Requirements">
    <Function id="documentFunctionalRequirements">Document what the system must do</Function>
    <Function id="documentTechnicalRequirements">Document technical constraints and needs</Function>
    <Function id="defineCategoriesByFunctionalArea">Group requirements by area</Function>
    <Function id="establishPerformanceMetrics">Define specific performance targets</Function>
    <Function id="documentSecurityRequirements">Establish security requirements</Function>
    <Function id="documentScalabilityRequirements">Define scalability needs</Function>
  </Component>

  <Component id="TechStack">
    <Function id="documentFrontendTech">Document frontend technologies</Function>
    <Function id="documentBackendTech">Document backend technologies</Function>
    <Function id="documentInfrastructure">Document deployment infrastructure</Function>
    <Function id="documentDevTools">Document development tools</Function>
    <Function id="documentSecurityMeasures">Document security implementations</Function>
    <Function id="justifyTechChoices">Explain rationale for each technology choice</Function>
  </Component>

  <Component id="Dependencies">
    <Function id="extractDependencies">Extract all project dependencies</Function>
    <Function id="researchDependencies">Research dependency documentation</Function>
    <Function id="documentVersions">Document current and required versions</Function>
    <Function id="createCompatibilityMatrix">Document version compatibility constraints</Function>
    <Function id="provideDependencyContext">Explain how each dependency is used</Function>
    <Function id="linkToDocumentation">Provide documentation links</Function>
  </Component>

  <Component id="UserFlow">
    <Function id="documentInitialUserJourney">Map initial user experience</Function>
    <Function id="documentCoreFeatureFlows">Detail flows for primary features</Function>
    <Function id="documentErrorHandling">Detail error scenario handling</Function>
    <Function id="documentSupportFlows">Detail user support processes</Function>
    <Function id="documentPlatformSpecificFlows">Detail platform adaptations</Function>
    <Function id="establishSuccessMetrics">Define flow monitoring metrics</Function>
  </Component>

  <Component id="Implementation">
    <Function id="documentDevelopmentPhilosophy">Define overall approach</Function>
    <Function id="documentCodeOrganization">Document code structure principles</Function>
    <Function id="provideCodeExamples">Create representative examples</Function>
    <Function id="documentWorkflow">Document development workflow</Function>
    <Function id="establishStandards">Define performance and quality standards</Function>
    <Function id="documentSecurityPractices">Establish security practices</Function>
  </Component>

  <Component id="ProjectStructure">
    <Function id="documentDirectoryStructure">Map the file organization</Function>
    <Function id="explainStructureDecisions">Explain organizational rationale</Function>
    <Function id="documentNamingConventions">Define naming standards</Function>
    <Function id="documentImportOrganization">Define module relationships</Function>
    <Function id="documentConfigFiles">Explain configuration approach</Function>
    <Function id="documentBuildProcess">Detail build and deployment structure</Function>
  </Component>
</DocumentationFunctionMap>
```

---

## Documentation Workflow Process

```mermaid
flowchart TD
    Start[Start Documentation Process] --> CheckExists{checkDocumentationExists}
    
    CheckExists -->|No| CreateDir[createDocumentationDirectory]
    CreateDir --> ScaffoldDocs[scaffoldDocumentationStructure]
    ScaffoldDocs --> ReadProject[readProjectContext]
    
    CheckExists -->|Yes| ReadDocs[readExistingDocumentation]
    ReadDocs --> ReadProject
    
    ReadProject --> VerifyDocs[verifyDocumentationRequirements]
    
    VerifyDocs --> IdentifyGaps[identifyDocumentationGaps]
    IdentifyGaps --> CreatePlan[createDocumentationPlan]
    CreatePlan --> SetPriorities[establishDocumentationPriorities]
    
    SetPriorities --> GenerateOverview[generateProjectOverview]
    GenerateOverview --> GenerateFeatures[generateFeaturesDoc]
    GenerateFeatures --> GenerateRequirements[generateRequirementsDoc]
    GenerateRequirements --> GenerateTechStack[generateTechStackDoc]
    GenerateTechStack --> ExtractDeps[extractDependencies]
    ExtractDeps --> ResearchDeps[researchDependencies]
    ResearchDeps --> GenerateDepsDoc[generateDependenciesDoc]
    GenerateDepsDoc --> GenerateUserFlow[generateUserFlowDoc]
    GenerateUserFlow --> GenerateImplementation[generateImplementationDoc]
    GenerateImplementation --> GenerateStructure[generateProjectStructureDoc]
    
    GenerateStructure --> ReviewAll[reviewAllDocumentation]
    ReviewAll --> FindImprovements[identifyImprovements]
    FindImprovements --> HasImprovements{improvementsNeeded}
    
    HasImprovements -->|Yes| RefineContent[refineDocumentation]
    RefineContent --> CheckComplete[validateCompleteness]
    CheckComplete --> HasImprovements
    
    HasImprovements -->|No| FinalizeDoc[finalizeDocumentation]
    FinalizeDoc --> End[End Documentation Process]
```

---

## Memory System Integration

The documentation templates should integrate with the Windsurf Memory System to ensure continuity across sessions. Below is a template for memory-aware documentation:

```md
# [Documentation Type] - [Project Name]

**Last Updated:** [Current Date]  
**Memory Bank Status:** [Complete/Incomplete]  
**Documentation Phase:** [Initialization/Planning/Implementation/Review/Maintenance]

## Memory Context

This document forms part of the project's Memory Bank and should be updated whenever relevant changes occur. It maintains the following relationships with other Memory Bank components:

- **Informs:** [List of documents this document informs]
- **Informed by:** [List of documents that inform this document]
- **Dependencies:** [List of external dependencies for this document]

## Version History

| Date | Editor | Changes | Memory Update Status |
|------|--------|---------|----------------------|
| [Date] | [Editor] | [Initial creation] | [Complete] |

## [Document Content Following Template Structure]

## Next Steps

The following items should be addressed in future updates to this document:

1. [Next step 1]
2. [Next step 2]
3. [Next step 3]

## Memory System Notes

[Any special notes about how this document integrates with the Memory System]
```

---

## Self-Critique Integration

Following the Windsurf methodology, each documentation component should undergo the self-critique cycle:

```md
## Documentation Self-Critique

### Creator Phase
Initial documentation created on [date] covering:
- [Key area 1]
- [Key area 2]
- [Key area 3]

### Critic Phase
Documentation review identified the following issues:
1. [Issue 1] - [Severity: High/Medium/Low]
2. [Issue 2] - [Severity: High/Medium/Low]
3. [Issue 3] - [Severity: High/Medium/Low]

### Defender Phase
Issues addressed as follows:
1. [Issue 1] → [Solution implemented]
2. [Issue 2] → [Solution implemented]
3. [Issue 3] → [Solution implemented]

### Judge Phase
Documentation improvement metrics:
- Completeness: [Score] → [Improved Score]
- Clarity: [Score] → [Improved Score]
- Technical Accuracy: [Score] → [Improved Score]
- Usability: [Score] → [Improved Score]

[Further iteration needed: Yes/No]
```

---

## XML Meta-Prompt Structure

Each project should include a customized XML meta-prompt that defines the specific documentation workflow for that project. Example:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ProjectDocumentationPrompt version="1.0">
  <ProjectIdentity>
    <Name>Sports Betting MCP Server</Name>
    <Description>A platform to provide sports betting functionalities, odds access, and betting techniques.</Description>
    <DocumentationPurpose>To document the architecture, APIs, tools, techniques, and workflows for the MCP server</DocumentationPurpose>
  </ProjectIdentity>

  <DocumentationWorkflow>
    <Phase name="Initialization">
      <Action function="checkDocumentationExists">Verify if documentation exists</Action>
      <Action function="createDocumentationDirectory" condition="!documentationExists">Create documentation directory</Action>
      <Action function="scaffoldDocumentationStructure" condition="!documentationExists">Create initial documentation files</Action>
      <Reminder priority="critical">Ensure documentation directory follows project conventions</Reminder>
    </Phase>

    <Phase name="ContentGeneration">
      <Action function="generateProjectOverview">Create project overview document</Action>
      <Action function="generateFeaturesDoc">Create features document</Action>
      <Action function="generateRequirementsDoc">Create requirements document</Action>
      <Action function="generateTechStackDoc">Create tech stack document</Action>
      <Action function="generateDependenciesDoc">Create dependencies document</Action>
      <Action function="generateUserFlowDoc">Create user flow document</Action>
      <Action function="generateImplementationDoc">Create implementation document</Action>
      <Action function="generateProjectStructureDoc">Create project structure document</Action>
      <Expected>Complete set of well-structured documentation files</Expected>
    </Phase>

    <Phase name="Review">
      <Action function="reviewAllDocumentation">Review all documentation for consistency</Action>
      <Action function="identifyImprovements">Identify areas for improvement</Action>
      <Action function="refineDocumentation">Refine documentation based on review</Action>
      <Action function="validateCompleteness">Ensure documentation is complete</Action>
      <Expected>High-quality documentation that meets all project requirements</Expected>
    </Phase>

    <Phase name="Maintenance">
      <Action function="monitorDocumentationAccuracy">Regular accuracy checks</Action>
      <Action function="updateDocumentation">Update as project evolves</Action>
      <Action function="trackChanges">Maintain version history</Action>
      <Expected>Documentation that remains current with project state</Expected>
      <Reminder priority="high">Update documentation after significant changes</Reminder>
    </Phase>
  </DocumentationWorkflow>

  <DocumentationTypes>
    <Type id="ProjectOverview" priority="critical">
      <Components>
        <Component>Vision Statement</Component>
        <Component>Problem Statement</Component>
        <Component>Solution Approach</Component>
        <Component>Target Audience</Component>
        <Component>Success Metrics</Component>
        <Component>Project Scope</Component>
        <Component>Risk Assessment</Component>
        <Component>Success Criteria</Component>
      </Components>
    </Type>
    <!-- Additional types can be added here -->
  </DocumentationTypes>

  <IntegrationPoints>
    <Point id="MemoryBank">
      <Description>Link to the Memory Bank system for continuity</Description>
      <Integration>All documentation updates must be reflected in Memory Bank</Integration>
    </Point>
    <Point id="TaskLogs">
      <Description>Link documentation updates to task logs</Description>
      <Integration>Record all changes in task logs for traceability</Integration>
    </Point>
    <Point id="ProjectPlans">
      <Description>Ensure documentation informs project plans</Description>
      <Integration>Use documentation to guide project milestones and deliverables</Integration>
    </Point>
  </IntegrationPoints>

  <DocumentationStandards>
    <Standard id="Completeness">All sections must be filled out</Standard>
    <Standard id="Accuracy">Technical details verified for correctness</Standard>
    <Standard id="Clarity">Clear language suitable for target audience</Standard>
    <Standard id="Consistency">Use consistent terminology throughout</Standard>
    <Standard id="CurrentState">Reflect current project state accurately</Standard>
  </DocumentationStandards>
</ProjectDocumentationPrompt>
```

---

## Project Startup Documentation Initialization

```mermaid
flowchart TD
    Start[Start: initializeProjectDocumentation] --> CreateDir[createDocumentationDirectory]
    CreateDir --> ScaffoldDocs[scaffoldDocumentationStructure]
    ScaffoldDocs --> CreateXMLPrompt[createProjectDocumentationPrompt]
    CreateXMLPrompt --> PopulateOverview[createInitialProjectOverview]
    PopulateOverview --> SetupFeatures[setupFeaturesDocTemplate]
    SetupFeatures --> SetupRequirements[setupRequirementsDocTemplate]
    SetupRequirements --> SetupTechStack[setupTechStackDocTemplate]
    SetupTechStack --> SetupDependencies[setupDependenciesDocTemplate]
    SetupDependencies --> SetupUserFlow[setupUserFlowDocTemplate]
    SetupUserFlow --> SetupImplementation[setupImplementationDocTemplate]
    SetupImplementation --> SetupStructure[setupProjectStructureDocTemplate]
    SetupStructure --> CreateReadme[createDocumentationReadme]
    CreateReadme --> InitMemoryIntegration[initializeMemoryBankIntegration]
    InitMemoryIntegration --> End[Documentation Framework Ready]
```

---

## Integrating with Task Logs

```md
## Documentation Updates

### Task: [Describe task, e.g., "Add sports betting context"]
**Task Log:** [Link to task log]
**Date:** [Date]
**Documentation Updated:**
- Project Overview - Added sports betting context
- Features - Included odds API access and betting techniques
- Requirements - Specified relevant APIs and tools

### Documentation Improvement Metrics
- Completeness: [Score] → [Improved Score]
- Clarity: [Score] → [Improved Score]
- Technical Accuracy: [Score] → [Improved Score]
- Usability: [Score] → [Improved Score]

### Next Documentation Tasks
1. Detail the specific APIs used for odds retrieval
2. Describe techniques used for sports betting
3. Document security considerations for the platform
```

---

## Function Map Memory Initialization

```javascript
function initializeDocumentationFunctions() {
  // Load the XML-based function map
  const documentationFunctionMap = loadXMLFunctionMap();
  
  // Store in memory for reference throughout the project
  memory.setItem('documentationFunctionMap', documentationFunctionMap);
  
  // Create associations between functions and documentation components
  createFunctionComponentAssociations(documentationFunctionMap);
  
  // Initialize documentation workflow phases
  initializeDocumentationWorkflow(documentationFunctionMap.WorkflowPhases);
  
  return {
    success: true,
    message: "Documentation function map initialized in memory",
    functionCount: countFunctions(documentationFunctionMap)
  };
}
```

---

## Next Steps

The above structure provides a comprehensive foundation for your sports betting MCP server documentation. Next steps include:

1. Detailing the specific APIs for odds access (e.g., Betfair API, OddsAPI)
2. Documenting the techniques and algorithms for sports betting strategies
3. Specifying security, scalability, and infrastructure considerations

Would you like me to generate specific sections such as the "Project Overview," "Features," or detailed API documentation now?