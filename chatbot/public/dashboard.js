document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const projectSearchInput = document.getElementById('projectSearchInput');
    const projectsCountBadge = document.getElementById('projectsCount');
    const allProjectsCount = document.getElementById('allProjectsCount');
    const projectsList = document.getElementById('projectsList');
    const allProjectsList = document.getElementById('allProjectsList');
    const projectsContainer = document.getElementById('projectsContainer');
    const projectDocumentsContainer = document.getElementById('projectDocumentsContainer');
    const projectDocumentsHeader = document.getElementById('projectDocumentsHeader');
    const projectDocumentsList = document.getElementById('projectDocumentsList');
    const documentPreview = document.getElementById('documentPreview');
    const previewTitle = document.getElementById('previewTitle');
    const documentType = document.getElementById('documentType');
    const documentDate = document.getElementById('documentDate');
    const documentProject = document.getElementById('documentProject');
    const documentContent = document.getElementById('documentContent');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const viewHeaderElement = document.getElementById('currentView');
    const breadcrumbContainer = document.getElementById('breadcrumbContainer');
    const breadcrumbHome = document.getElementById('breadcrumbHome');
    const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
    const backToListBtn = document.getElementById('backToList');
    const refreshButton = document.getElementById('refreshButton');
    const exportDocumentBtn = document.getElementById('exportDocument');
    const editDocumentBtn = document.getElementById('editDocument');
    
    // State variables
    let allDocuments = [];
    let projects = [];
    let currentProject = null;
    let currentDocument = null;
    let currentView = 'projects'; // projects, project-documents, document-preview
    
    // Initialize the dashboard
    initialize();
    
    // Event listeners
    projectSearchInput.addEventListener('input', filterProjects);
    refreshButton.addEventListener('click', loadDocuments);
    backToListBtn.addEventListener('click', backToProjectView);
    breadcrumbHome.addEventListener('click', function(e) {
        e.preventDefault();
        showProjectsView();
    });
    
    // Export functionality
    exportDocumentBtn.addEventListener('click', function() {
        if (currentDocument) {
            exportMarkdown(currentDocument);
        }
    });
    
    // Edit functionality (redirects to chat)
    editDocumentBtn.addEventListener('click', function() {
        if (currentDocument) {
            // This would ideally open the chat interface with context about this document
            window.location.href = 'index.html';
        }
    });
    
    // Initialize dashboard
    function initialize() {
        showLoading();
        loadDocuments();
    }
    
    // Load documents from the output-docs directory
    function loadDocuments() {
        showLoading();
        
        // Use the /api/documents endpoint that reads directly from the output-docs folder
        fetch('/api/documents')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch documents');
                }
                return response.json();
            })
            .then(data => {
                if (data && Array.isArray(data) && data.length > 0) {
                    allDocuments = data;
                    
                    // Extract projects from the documents
                    extractProjects();
                    
                    // Update the UI based on current view
                    updateView();
                } else {
                    // If we get an empty array, show empty state
                    allDocuments = [];
                    projects = [];
                    showEmptyState();
                }
                hideLoading();
            })
            .catch(error => {
                console.error('Error loading documents:', error);
                // Show error state
                showErrorMessage('Failed to load documents. Please try refreshing the page.');
                hideLoading();
            });
    }
    
    // Extract unique projects from documents
    function extractProjects() {
        // Create a map of projects with their documents
        const projectsMap = new Map();
        
        allDocuments.forEach(doc => {
            const projectName = doc.folder || 'Uncategorized';
            
            if (!projectsMap.has(projectName)) {
                projectsMap.set(projectName, {
                    name: projectName,
                    documents: [],
                    lastUpdated: new Date(0) // Initialize with oldest date possible
                });
            }
            
            // Add document to project
            const project = projectsMap.get(projectName);
            project.documents.push(doc);
            
            // Update lastUpdated if this document is newer
            const docDate = new Date(doc.createdAt);
            if (docDate > project.lastUpdated) {
                project.lastUpdated = docDate;
            }
        });
        
        // Convert map to array and sort by name
        projects = Array.from(projectsMap.values()).sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
        
        // Update project counts
        updateProjectCounts();
    }
    
    // Update project counts in the UI
    function updateProjectCounts() {
        projectsCountBadge.textContent = `(${projects.length})`;
        allProjectsCount.textContent = `(${projects.length} projects)`;
    }
    
    // Update the view based on current state
    function updateView() {
        if (currentView === 'projects') {
            showProjectsView();
        } else if (currentView === 'project-documents' && currentProject) {
            showProjectDocuments(currentProject);
        } else {
            // Default to projects view
            showProjectsView();
        }
    }
    
    // Show error message
    function showErrorMessage(message) {
        allProjectsList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i> 
                    ${message}
                </div>
            </div>
        `;
        projectsList.innerHTML = '';
        projectDocumentsList.innerHTML = '';
    }
    
    // Show empty state when no documents are found
    function showEmptyState() {
        allProjectsList.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="bi bi-folder-x" style="font-size: 2rem;"></i>
                    <p class="mt-3">No projects found. Create your first project documentation.</p>
                    <a href="index.html" class="btn btn-primary mt-3">
                        <i class="bi bi-plus-circle"></i> Create Documentation
                    </a>
                </div>
            </div>
        `;
        projectsList.innerHTML = `
            <div class="text-center text-muted p-3">
                No projects available
            </div>
        `;
    }
    
    // Filter projects based on search input
    function filterProjects() {
        const searchTerm = projectSearchInput.value.toLowerCase().trim();
        
        // If no search term, show all projects in the sidebar
        if (!searchTerm) {
            renderProjectsSidebar(projects);
            return;
        }
        
        // Filter projects based on search term
        const filteredProjects = projects.filter(project => 
            project.name.toLowerCase().includes(searchTerm)
        );
        
        // Render filtered projects in the sidebar
        renderProjectsSidebar(filteredProjects);
    }
    
    // Show projects view
    function showProjectsView() {
        currentView = 'projects';
        currentProject = null;
        
        // Show projects container, hide others
        projectsContainer.classList.remove('d-none');
        projectDocumentsContainer.classList.add('d-none');
        documentPreview.classList.add('d-none');
        
        // Hide breadcrumb
        breadcrumbContainer.classList.add('d-none');
        
        // Update header
        viewHeaderElement.textContent = 'Documentation Dashboard';
        
        // Render projects
        renderProjects();
        renderProjectsSidebar(projects);
    }
    
    // Show documents for a specific project
    function showProjectDocuments(project) {
        currentView = 'project-documents';
        currentProject = project;
        
        // Show project documents container, hide others
        projectsContainer.classList.add('d-none');
        projectDocumentsContainer.classList.remove('d-none');
        documentPreview.classList.add('d-none');
        
        // Show breadcrumb
        breadcrumbContainer.classList.remove('d-none');
        breadcrumbCurrent.textContent = project.name;
        
        // Update headers
        viewHeaderElement.textContent = `Project: ${project.name}`;
        projectDocumentsHeader.textContent = `${project.name} Documentation`;
        
        // Render project documents
        renderProjectDocuments(project);
        
        // Highlight current project in sidebar
        highlightProject(project.name);
    }
    
    // Highlight the current project in the sidebar
    function highlightProject(projectName) {
        // Remove active class from all project items
        document.querySelectorAll('.project-list-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current project
        const projectItem = document.querySelector(`.project-list-item[data-project="${projectName}"]`);
        if (projectItem) {
            projectItem.classList.add('active');
        }
    }
    
    // Render all projects
    function renderProjects() {
        // Clear existing content
        allProjectsList.innerHTML = '';
        
        // If no projects, show empty state
        if (projects.length === 0) {
            showEmptyState();
            return;
        }
        
        // Render each project as a card
        projects.forEach(project => {
            allProjectsList.appendChild(createProjectCard(project));
        });
    }
    
    // Render projects in the sidebar
    function renderProjectsSidebar(projectsToRender) {
        // Clear existing content
        projectsList.innerHTML = '';
        
        // If no projects, show message
        if (projectsToRender.length === 0) {
            projectsList.innerHTML = `
                <div class="text-center text-muted p-3">
                    No matching projects
                </div>
            `;
            return;
        }
        
        // Render each project in the sidebar
        projectsToRender.forEach(project => {
            const item = document.createElement('div');
            item.className = 'project-list-item';
            if (currentProject && currentProject.name === project.name) {
                item.classList.add('active');
            }
            item.setAttribute('data-project', project.name);
            
            item.innerHTML = `
                <i class="bi bi-folder project-icon"></i>
                <span class="flex-grow-1">${project.name}</span>
                <span class="badge bg-secondary">${project.documents.length}</span>
            `;
            
            item.addEventListener('click', () => showProjectDocuments(project));
            
            projectsList.appendChild(item);
        });
    }
    
    // Create a project card for the main view
    function createProjectCard(project) {
        const col = document.createElement('div');
        col.className = 'col';
        
        // Format the last updated date
        const lastUpdated = new Date(project.lastUpdated);
        const formattedDate = lastUpdated.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
        
        col.innerHTML = `
            <div class="card h-100 project-card" data-project="${project.name}">
                <div class="card-body">
                    <h5 class="card-title">
                        <i class="bi bi-folder2-open me-2"></i>
                        ${project.name}
                    </h5>
                    <p class="card-text text-muted">
                        ${project.documents.length} document${project.documents.length !== 1 ? 's' : ''}
                        <br>
                        <small>Last updated: ${formattedDate}</small>
                    </p>
                </div>
                <div class="card-footer bg-transparent border-top-0">
                    <button class="btn btn-sm btn-primary view-project" data-project="${project.name}">
                        <i class="bi bi-eye"></i> View Project
                    </button>
                </div>
            </div>
        `;
        
        // Add click event for the button
        const viewBtn = col.querySelector('.view-project');
        viewBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click
            const projectName = this.getAttribute('data-project');
            const project = projects.find(p => p.name === projectName);
            if (project) {
                showProjectDocuments(project);
            }
        });
        
        // Add click event for the whole card
        const card = col.querySelector('.project-card');
        card.addEventListener('click', function() {
            const projectName = this.getAttribute('data-project');
            const project = projects.find(p => p.name === projectName);
            if (project) {
                showProjectDocuments(project);
            }
        });
        
        return col;
    }
    
    // Render documents for a specific project
    function renderProjectDocuments(project) {
        // Clear existing content
        projectDocumentsList.innerHTML = '';
        
        // If no documents in this project, show empty state
        if (project.documents.length === 0) {
            projectDocumentsList.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="bi bi-file-earmark-x" style="font-size: 2rem;"></i>
                        <p class="mt-3">No documents found in this project.</p>
                    </div>
                </div>
            `;
            return;
        }
        
        // Group documents by type
        const docsByType = {};
        project.documents.forEach(doc => {
            if (!docsByType[doc.documentType]) {
                docsByType[doc.documentType] = [];
            }
            docsByType[doc.documentType].push(doc);
        });
        
        // Create document cards grouped by type
        Object.keys(docsByType).sort().forEach(docType => {
            // For each document type, sort by createdAt (newest first)
            const docs = docsByType[docType].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            
            // Create cards for each document
            docs.forEach(doc => {
                projectDocumentsList.appendChild(createDocumentCard(doc));
            });
        });
    }
    
    // Create a document card
    function createDocumentCard(doc) {
        const col = document.createElement('div');
        col.className = 'col';
        
        // Format document type label
        const docTypeLabel = capitalize(doc.documentType);
        
        // Format date
        const dateObj = new Date(doc.createdAt);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
        
        // Get just the filename without path and extension
        const fileName = doc.fileName.split('/').pop();
        const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
        
        col.innerHTML = `
            <div class="card h-100 doc-card" data-id="${doc.id}">
                <div class="card-body">
                    <div class="doc-type-label">${docTypeLabel}</div>
                    <h5 class="card-title">${fileNameWithoutExt}</h5>
                    <p class="card-text small text-muted">
                        Updated: ${formattedDate}
                    </p>
                </div>
                <div class="card-footer bg-transparent border-top-0">
                    <button class="btn btn-sm btn-outline-primary view-document" data-id="${doc.id}">
                        <i class="bi bi-eye"></i> View
                    </button>
                </div>
            </div>
        `;
        
        // Add click events
        const card = col.querySelector('.doc-card');
        card.addEventListener('click', function() {
            viewDocument(doc.id);
        });
        
        const viewBtn = col.querySelector('.view-document');
        viewBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click
            viewDocument(doc.id);
        });
        
        return col;
    }
    
    // Get a nicer document name from the document type
    function getNiceDocumentName(docType) {
        const docTypeMap = {
            'projectoverview': 'Project Overview',
            'techstack': 'Tech Stack',
            'requirements': 'Requirements',
            'features': 'Features',
            'dependencies': 'Dependencies',
            'userflow': 'User Flow',
            'implementation': 'Implementation',
            'projectstructure': 'Project Structure',
            'index': 'Project Index'
        };
        
        return docTypeMap[docType.toLowerCase()] || capitalize(docType);
    }
    
    // View document details
    function viewDocument(docId) {
        showLoading();
        
        // Find the document in our array
        const doc = allDocuments.find(d => d.id === docId);
        if (!doc) {
            hideLoading();
            return;
        }
        
        currentDocument = doc;
        currentView = 'document-preview';
        
        // Fetch document content
        fetch(`/output-docs/${doc.fileName}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load document: ${response.status} ${response.statusText}`);
                }
                return response.text();
            })
            .then(content => {
                // Store the content and display it
                doc.content = content;
                displayDocument(doc);
                hideLoading();
            })
            .catch(error => {
                console.error('Error loading document content:', error);
                // Show error in the document preview area
                documentContent.innerHTML = `
                    <div class="alert alert-danger">
                        <h4>Error Loading Document</h4>
                        <p>${error.message}</p>
                        <p>Please try again or contact the administrator.</p>
                    </div>
                `;
                showDocumentPreview();
                hideLoading();
            });
    }
    
    // Display document in the preview area
    function displayDocument(doc) {
        // Get the filename without path and extension
        const fileName = doc.fileName.split('/').pop();
        const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
        
        // Update metadata display
        previewTitle.textContent = fileNameWithoutExt;
        documentType.textContent = capitalize(doc.documentType);
        
        // Format date
        const dateObj = new Date(doc.createdAt);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        documentDate.textContent = formattedDate;
        documentProject.textContent = doc.folder || 'Uncategorized';
        
        // Render markdown content
        documentContent.innerHTML = marked.parse(doc.content);
        
        // Show the preview
        showDocumentPreview();
    }
    
    // Show document preview, hide other views
    function showDocumentPreview() {
        projectsContainer.classList.add('d-none');
        projectDocumentsContainer.classList.add('d-none');
        documentPreview.classList.remove('d-none');
        
        // Update breadcrumb
        breadcrumbContainer.classList.remove('d-none');
        if (currentProject) {
            breadcrumbCurrent.textContent = currentProject.name;
        }
    }
    
    // Go back to project view
    function backToProjectView() {
        if (currentProject) {
            showProjectDocuments(currentProject);
        } else {
            // If no current project, go back to projects view
            showProjectsView();
        }
    }
    
    // Export document as markdown file
    function exportMarkdown(doc) {
        const blob = new Blob([doc.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.fileName.split('/').pop(); // Get just the filename, not the path
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Helper function to capitalize first letter
    function capitalize(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Show loading overlay
    function showLoading() {
        loadingOverlay.classList.remove('d-none');
    }
    
    // Hide loading overlay
    function hideLoading() {
        loadingOverlay.classList.add('d-none');
    }
}); 