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
    const backToDocumentListBtn = document.getElementById('backToDocumentList');
    const refreshButton = document.getElementById('refreshButton');
    const exportDocumentBtn = document.getElementById('exportDocument');
    const uploadToMcpBtn = document.getElementById('uploadToMcpBtn');
    const uploadStatusAlert = document.getElementById('uploadStatusAlert');
    
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
    backToDocumentListBtn.addEventListener('click', backToProjectView);
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
    
    // Edit functionality (redirects to chat) - removed as requested
    // editDocumentBtn.addEventListener('click', function() {
    //     if (currentDocument) {
    //         // This would ideally open the chat interface with context about this document
    //         window.location.href = 'index.html';
    //     }
    // });
    
    // Upload to MCP functionality
    uploadToMcpBtn.addEventListener('click', function() {
        if (currentProject) {
            uploadProjectToMcp(currentProject.name);
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
        
        // Make projects available globally for file explorer
        window.dashboardProjects = projects;
        
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
        
        // Close all document lists
        document.querySelectorAll('.project-documents').forEach(el => {
            el.style.display = 'none';
        });
        
        // Reset all toggle icons
        document.querySelectorAll('.toggle-icon').forEach(icon => {
            icon.classList.remove('bi-chevron-down');
            icon.classList.add('bi-chevron-right');
        });
        
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
        
        // Display document list for current project in sidebar
        expandProjectInSidebar(project.name);
    }
    
    // Expand project document list in sidebar
    function expandProjectInSidebar(projectName) {
        // For the new file explorer
        if (window.FileExplorer) {
            // Find the project folder item by name
            const projectFolders = document.querySelectorAll('.file-explorer-folder');
            projectFolders.forEach(folder => {
                const folderNameEl = folder.querySelector('.file-explorer-folder-name');
                if (folderNameEl && folderNameEl.textContent === projectName) {
                    // Get the files list element
                    const filesList = folder.nextElementSibling;
                    if (filesList && filesList.classList.contains('file-explorer-files')) {
                        // Expand this folder
                        filesList.style.display = 'block';
                        
                        // Update folder icon to open
                        const folderIcon = folder.querySelector('.file-explorer-folder-icon');
                        if (folderIcon) {
                            folderIcon.classList.remove('bi-folder-fill');
                            folderIcon.classList.add('bi-folder2-open');
                        }
                    } else {
                        // console.log('Files list not found for project:', projectName);
                    }
                } else {
                    // Collapse other folders
                    const otherFilesList = folder.nextElementSibling;
                    if (otherFilesList && otherFilesList.classList.contains('file-explorer-files')) {
                        otherFilesList.style.display = 'none';
                        
                        // Update folder icon to closed
                        const folderIcon = folder.querySelector('.file-explorer-folder-icon');
                        if (folderIcon) {
                            folderIcon.classList.remove('bi-folder2-open');
                            folderIcon.classList.add('bi-folder-fill');
                        }
                    }
                }
            });
        } else {
            // Original expand/collapse code for the old structure
            // Close all document lists
            document.querySelectorAll('.project-documents').forEach(el => {
                el.style.display = 'none';
            });
            
            // Reset all toggle icons
            document.querySelectorAll('.toggle-icon').forEach(icon => {
                icon.classList.remove('bi-chevron-down');
                icon.classList.add('bi-chevron-right');
            });
            
            // Expand the current project's document list
            const projectItem = document.querySelector(`.project-list-item[data-project="${projectName}"]`);
            if (projectItem) {
                const documentsContainer = projectItem.querySelector('.project-documents');
                if (documentsContainer) {
                    documentsContainer.style.display = 'block';
                    
                    // Update the toggle icon
                    const toggleIcon = projectItem.querySelector('.toggle-icon');
                    if (toggleIcon) {
                        toggleIcon.classList.remove('bi-chevron-right');
                        toggleIcon.classList.add('bi-chevron-down');
                    }
                }
            }
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
        
        // Convert projects to format expected by file explorer
        const projectsData = projectsToRender.map(project => {
            // Extract filenames from documents
            const files = project.documents.map(doc => doc.fileName.split('/').pop());
            
            return {
                name: project.name,
                files: files
            };
        });
        
        // Use the file explorer to render projects
        if (window.FileExplorer) {
            window.FileExplorer.create('projectsList', projectsData);
            
            // Add click handlers to file explorer items
            setTimeout(() => {
                const fileItems = document.querySelectorAll('.file-explorer-file');
                fileItems.forEach(item => {
                    item.addEventListener('click', function(e) {
                        e.stopPropagation(); // Prevent folder toggle
                        const fileName = this.querySelector('span').textContent;
                        const projectName = this.closest('.file-explorer-item')
                                               .querySelector('.file-explorer-folder-name').textContent;
                        
                        // Find the document in our data
                        const project = projects.find(p => p.name === projectName);
                        if (project) {
                            const document = project.documents.find(d => d.fileName.includes(fileName));
                            if (document) {
                                viewDocument(document.id);
                            }
                        }
                    });
                });
            }, 100);
            
            // If there's a current project, expand its folder
            if (currentProject) {
                expandProjectInSidebar(currentProject.name);
            }
        } else {
            // Fallback to original rendering if file explorer is not available
            projectsToRender.forEach(project => {
                const projectItem = document.createElement('div');
                projectItem.className = 'project-list-item';
                projectItem.setAttribute('data-project', project.name);
                
                projectItem.innerHTML = `
                    <div class="d-flex align-items-center w-100">
                        <i class="bi bi-folder project-icon"></i>
                        <span class="flex-grow-1 project-name">${project.name}</span>
                        <span class="badge bg-secondary">${project.documents.length}</span>
                    </div>
                `;
                
                // Add click event
                projectItem.addEventListener('click', function() {
                    const projectName = this.getAttribute('data-project');
                    const projectObj = projects.find(p => p.name === projectName);
                    if (projectObj) {
                        showProjectDocuments(projectObj);
                    }
                });
                
                projectsList.appendChild(projectItem);
            });
        }
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
            showDocumentError('Document not found');
            return;
        }
        
        currentDocument = doc;
        currentView = 'document-preview';
        
        // Make sure the parent project is expanded in the sidebar
        if (doc.folder) {
            expandProjectInSidebar(doc.folder);
        }
        
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
                const errorMessage = `${error.message}. Please try again or contact the administrator.`;
                
                // Switch to document preview mode
                showDocumentPreview();
                
                // Set basic document metadata
                previewTitle.textContent = doc.fileName ? doc.fileName.split('/').pop() : 'Document';
                documentType.textContent = capitalize(doc.documentType || 'Unknown');
                documentDate.textContent = 'N/A';
                
                // Show error in content area
                if (document.getElementById('documentContent')) {
                    document.getElementById('documentContent').innerHTML = `
                        <div class="alert alert-danger">
                            <h4>Error Loading Document</h4>
                            <p>${errorMessage}</p>
                        </div>
                    `;
                }
                
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
            month: 'long', 
            day: 'numeric' 
        });
        documentDate.textContent = formattedDate;
        
        // Set current document
        currentDocument = doc;
        
        // Enable export button
        exportDocumentBtn.disabled = false;
        
        // Add inline edit button for markdown editing
        const editBtn = document.getElementById('editDocumentBtn');
        if (!editBtn) {
            const editBtn = document.createElement('button');
            editBtn.id = 'editDocumentBtn';
            editBtn.className = 'btn btn-outline-primary ms-2';
            editBtn.innerHTML = '<i class="bi bi-pencil"></i> Edit';
            editBtn.addEventListener('click', function() {
                toggleEditMode(doc);
            });
            
            // Add the edit button next to the export button
            exportDocumentBtn.parentNode.insertBefore(editBtn, exportDocumentBtn.nextSibling);
        } else {
            editBtn.style.display = 'inline-block';
        }
        
        // Render markdown content
        const markdownContent = doc.content || '*No content available*';
        documentContent.innerHTML = marked.parse(markdownContent);
        
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
    
    // Toggle between edit mode and view mode
    function toggleEditMode(doc) {
        // console.log("toggleEditMode called with doc:", doc ? doc.fileName : "null");
        
        // Check if we are already in edit mode
        const existingTextarea = document.getElementById('markdownEditor');
        if (existingTextarea) {
            // console.log("Already in edit mode, exiting...");
            exitEditMode(doc);
            return;
        }
        
        // Get current content div
        const contentDiv = document.getElementById('documentContent');
        if (!contentDiv) {
            console.error("Document content div not found");
            return;
        }
        // console.log("Found content div");
        
        // Create textarea for editing
        const textarea = document.createElement('textarea');
        textarea.id = 'markdownEditor';
        textarea.className = 'form-control';
        textarea.style.height = '70vh';
        textarea.style.width = '100%';
        textarea.value = doc.content || '';
        // console.log("Created textarea with content length:", textarea.value.length);
        
        // Replace content div with textarea
        const contentContainer = contentDiv.parentNode;
        contentContainer.replaceChild(textarea, contentDiv);
        // console.log("Replaced content div with textarea");
        
        // Hide the original edit button so we don't have duplicate functionality
        const editBtn = document.getElementById('editDocumentBtn');
        if (editBtn) {
            editBtn.style.display = 'none';
            // console.log("Hidden original edit button");
        }
        
        // Remove any existing cancel buttons to prevent duplicates
        const existingCancelBtns = document.querySelectorAll('#cancelEditBtn');
        existingCancelBtns.forEach(btn => {
            if (btn && btn.parentNode) {
                btn.parentNode.removeChild(btn);
                // console.log("Removed existing cancel button");
            }
        });
        
        // Create a container for the buttons
        let buttonsContainer = document.querySelector('.document-edit-buttons');
        if (!buttonsContainer) {
            buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'document-edit-buttons mt-2 d-flex justify-content-end';
            textarea.parentNode.insertBefore(buttonsContainer, textarea.nextSibling);
            // console.log("Created new buttons container");
        }
        
        // Create Save button
        const saveBtn = document.createElement('button');
        saveBtn.id = 'saveDocumentBtn';
        saveBtn.className = 'btn btn-primary me-2';
        saveBtn.innerHTML = '<i class="bi bi-check2"></i> Save';
        saveBtn.addEventListener('click', function() {
            saveDocument(doc);
        });
        buttonsContainer.appendChild(saveBtn);
        // console.log("Added Save button to container");
        
        // Create Cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancelEditBtn';
        cancelBtn.className = 'btn btn-outline-secondary';
        cancelBtn.innerHTML = '<i class="bi bi-x"></i> Cancel';
        cancelBtn.addEventListener('click', function() {
            exitEditMode(doc, false);
        });
        buttonsContainer.appendChild(cancelBtn);
        // console.log("Added Cancel button to container");
        
        // console.log("toggleEditMode completed - now in edit mode");
    }
    
    // Exit edit mode and return to view mode
    function exitEditMode(doc, saveChanges = true) {
        // console.log("exitEditMode called with doc:", doc ? doc.fileName : "null", "saveChanges:", saveChanges);
        
        // Get current editor
        const textarea = document.getElementById('markdownEditor');
        if (!textarea) {
            console.error("Textarea not found in exitEditMode");
            return;
        }
        // console.log("Found textarea with content length:", textarea.value ? textarea.value.length : 0);
        
        // If we're not saving changes, make sure to keep the original content
        if (!saveChanges) {
            // console.log("Discarding changes and keeping original content");
        }
        
        // Get the parent container
        const contentContainer = textarea.parentNode;
        // console.log("Found parent container:", !!contentContainer);
        
        // Create a new content div but don't reassign the documentContent variable
        const newContentDiv = document.createElement('div');
        newContentDiv.id = 'documentContent';
        newContentDiv.className = 'doc-preview markdown-content';
        // console.log("Created new content div");
        
        // Replace textarea with the new content div
        contentContainer.replaceChild(newContentDiv, textarea);
        // console.log("Replaced textarea with new content div");
        
        // Render markdown content in the new div
        try {
            newContentDiv.innerHTML = marked.parse(doc.content || '*No content available*');
            // console.log("Rendered markdown content, length:", doc.content ? doc.content.length : 0);
        } catch (error) {
            console.error("Error rendering markdown:", error);
            newContentDiv.innerHTML = "<p>Error rendering markdown</p>";
        }
        
        // Remove the custom buttons container we created
        const buttonsContainer = document.querySelector('.document-edit-buttons');
        if (buttonsContainer && buttonsContainer.parentNode) {
            buttonsContainer.parentNode.removeChild(buttonsContainer);
            // console.log("Removed edit buttons container");
        }
        
        // Restore the original edit button
        const editBtn = document.getElementById('editDocumentBtn');
        if (editBtn) {
            // First check if it's just hidden
            if (editBtn.style.display === 'none') {
                // Simply unhide it
                editBtn.style.display = 'inline-block';
                // console.log("Restored original edit button visibility");
            } else {
                // Otherwise, we need to recreate it
                const newEditBtn = document.createElement('button');
                newEditBtn.id = 'editDocumentBtn';
                newEditBtn.className = 'btn btn-outline-primary ms-2';
                newEditBtn.innerHTML = '<i class="bi bi-pencil"></i> Edit';
                
                // Add the edit mode event listener
                newEditBtn.addEventListener('click', function() {
                    toggleEditMode(doc);
                });
                
                // Find the export button to place this next to it
                const exportBtn = document.getElementById('exportDocument');
                if (exportBtn && exportBtn.parentNode) {
                    exportBtn.parentNode.insertBefore(newEditBtn, exportBtn.nextSibling);
                    // console.log("Recreated and added edit button next to export button");
                }
            }
        } else {
            // Need to create a new edit button from scratch
            const newEditBtn = document.createElement('button');
            newEditBtn.id = 'editDocumentBtn';
            newEditBtn.className = 'btn btn-outline-primary ms-2';
            newEditBtn.innerHTML = '<i class="bi bi-pencil"></i> Edit';
            
            // Add the edit mode event listener
            newEditBtn.addEventListener('click', function() {
                toggleEditMode(doc);
            });
            
            // Find the export button to place this next to it
            const exportBtn = document.getElementById('exportDocument');
            if (exportBtn && exportBtn.parentNode) {
                exportBtn.parentNode.insertBefore(newEditBtn, exportBtn.nextSibling);
                // console.log("Created new edit button next to export button");
            } else {
                console.warn("Export button not found, could not add edit button");
            }
        }
        
        // Remove any remaining cancel buttons
        const cancelButtons = document.querySelectorAll('#cancelEditBtn');
        // console.log("Found cancel buttons:", cancelButtons.length);
        
        cancelButtons.forEach(btn => {
            if (btn && btn.parentNode) {
                btn.parentNode.removeChild(btn);
                // console.log("Removed a cancel button");
            }
        });
        
        // console.log("exitEditMode completed");
    }
    
    // Show success message
    function showSuccessMessage(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show';
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Find a suitable container for the alert
        let container = document.getElementById('documentPreview');
        if (!container) {
            // Try to find the main container as a fallback
            container = document.querySelector('.dashboard-content');
            if (!container) {
                // Last resort, add to body
                container = document.body;
            }
        }
        
        // Insert at the top of the container
        if (container.firstChild) {
            container.insertBefore(alertDiv, container.firstChild);
        } else {
            container.appendChild(alertDiv);
        }
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv && alertDiv.classList) {
                alertDiv.classList.remove('show');
                setTimeout(() => {
                    if (alertDiv && alertDiv.parentNode) {
                        alertDiv.parentNode.removeChild(alertDiv);
                    }
                }, 150);
            }
        }, 5000);
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
    
    // Upload project documents to MCP server
    function uploadProjectToMcp(projectName) {
        showLoading();
        
        // Clear previous upload status
        hideUploadStatus();
        
        fetch('/api/upload-to-mcp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ projectName })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            hideLoading();
            
            if (data.success) {
                showUploadStatus('success', `Successfully uploaded ${data.totalUploaded} documents to MCP server.`);
            } else if (data.totalUploaded > 0 && data.totalFailed > 0) {
                showUploadStatus('warning', `Partially successful. Uploaded ${data.totalUploaded} documents, but failed to upload ${data.totalFailed} documents.`);
            } else {
                showUploadStatus('danger', `Failed to upload documents. ${data.totalFailed} documents could not be uploaded.`);
            }
        })
        .catch(error => {
            console.error('Error uploading to MCP:', error);
            hideLoading();
            showUploadStatus('danger', 'Error uploading to MCP server. Please check the console for details.');
        });
    }
    
    // Show upload status alert
    function showUploadStatus(type, message) {
        uploadStatusAlert.classList.remove('d-none', 'alert-success', 'alert-danger', 'alert-warning');
        uploadStatusAlert.classList.add(`alert-${type}`);
        uploadStatusAlert.innerHTML = `
            <i class="bi ${type === 'success' ? 'bi-check-circle' : type === 'warning' ? 'bi-exclamation-triangle' : 'bi-x-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close float-end" aria-label="Close" onclick="this.parentElement.classList.add('d-none')"></button>
        `;
    }
    
    // Hide upload status alert
    function hideUploadStatus() {
        uploadStatusAlert.classList.add('d-none');
    }
    
    // Show error message for document operations
    function showDocumentError(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            <i class="bi bi-exclamation-triangle-fill me-2"></i> 
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Find a suitable container for the alert
        let container = document.getElementById('documentPreview');
        if (!container) {
            // Try to find the main container as a fallback
            container = document.querySelector('.dashboard-content');
            if (!container) {
                // Last resort, add to body
                container = document.body;
            }
        }
        
        // Insert at the top of the container
        if (container.firstChild) {
            container.insertBefore(alertDiv, container.firstChild);
        } else {
            container.appendChild(alertDiv);
        }
        
        // Auto dismiss after 8 seconds
        setTimeout(() => {
            if (alertDiv && alertDiv.classList) {
                alertDiv.classList.remove('show');
                setTimeout(() => {
                    if (alertDiv && alertDiv.parentNode) {
                        alertDiv.parentNode.removeChild(alertDiv);
                    }
                }, 150);
            }
        }, 8000);
    }
    
    // Save document content to the server
    function saveDocument(doc) {
        // console.log("saveDocument function called with doc:", doc ? doc.fileName : "null");
        
        // Save the edited content
        const textarea = document.getElementById('markdownEditor');
        if (!textarea) {
            console.error('Textarea not found when trying to save');
            showDocumentError('Could not save document: Editor not found');
            return;
        }
        
        const newContent = textarea.value;
        // console.log("New content to save:", {
        //     contentLength: newContent.length,
        //     firstFewChars: newContent.substring(0, 50),
        //     lastFewChars: newContent.substring(newContent.length - 50)
        // });
        
        // Log save attempt
        // console.log('Attempting to save document:', doc.fileName);
        
        // Show loading indicator
        showLoading();
        
        // Ensure the filePath is correctly formatted
        let filePath = doc.fileName;
        
        // First, normalize the path by removing any existing 'output-docs/' prefix
        if (filePath.startsWith('output-docs/')) {
            filePath = filePath.replace('output-docs/', '');
            // console.log("Removed output-docs/ prefix from filePath:", filePath);
        }
        
        // Now, ensure the path starts with 'output-docs/'
        if (!filePath.startsWith('output-docs/')) {
            filePath = 'output-docs/' + filePath;
            // console.log("Added output-docs/ prefix to filePath:", filePath);
        }
        
        // console.log("Sending save request with filePath:", filePath);
        
        // Send to server to save
        fetch('/api/save-document', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filePath: filePath,
                content: newContent
            })
        })
        .then(response => {
            // console.log("Server response status:", response.status);
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // console.log("Server response data:", data);
            if (data.success) {
                // console.log(`Document successfully saved to: ${filePath}`);
                
                // Update the document content
                doc.content = newContent;
                
                // Switch back to view mode
                exitEditMode(doc, true);
                
                // Show success message with file path
                showSuccessMessage(`Document saved successfully to: ${filePath}`);
                
                // Refresh the document list to reflect any changes
                setTimeout(() => {
                    if (currentProject) {
                        // console.log("Refreshing project documents");
                        renderProjectDocuments(currentProject);
                    }
                }, 1000);
            } else {
                console.error('Server reported error while saving document:', data.error);
                showDocumentError('Failed to save document: ' + (data.error || 'Unknown error'));
            }
            hideLoading();
        })
        .catch(error => {
            console.error('Error saving document:', error);
            showDocumentError('Failed to save document: ' + error.message);
            hideLoading();
        });
    }
}); 