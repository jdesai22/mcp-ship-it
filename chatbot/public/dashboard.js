document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const projectFilter = document.getElementById('projectFilter');
    const documentTypeFilter = document.getElementById('documentTypeFilter');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const refreshDocsBtn = document.getElementById('refreshDocs');
    const backToListBtn = document.getElementById('backToList');
    const exportDocumentBtn = document.getElementById('exportDocument');
    const editDocumentBtn = document.getElementById('editDocument');
    const allDocumentsList = document.getElementById('allDocumentsList');
    const recentDocumentsList = document.getElementById('recentDocumentsList');
    const documentsList = document.getElementById('documentsList');
    const documentPreview = document.getElementById('documentPreview');
    const previewTitle = document.getElementById('previewTitle');
    const documentType = document.getElementById('documentType');
    const documentDate = document.getElementById('documentDate');
    const documentProject = document.getElementById('documentProject');
    const documentContent = document.getElementById('documentContent');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const currentView = document.getElementById('currentView');
    
    // Category navigation elements
    const allDocumentsLink = document.getElementById('allDocuments');
    const recentDocumentsLink = document.getElementById('recentDocuments');
    const projectOverviewsLink = document.getElementById('projectOverviews');
    const techStacksLink = document.getElementById('techStacks');
    
    // State variables
    let allDocuments = [];
    let filteredDocuments = [];
    let currentDocument = null;
    
    // Initialize the dashboard
    initialize();
    
    // Event listeners
    applyFiltersBtn.addEventListener('click', applyFilters);
    refreshDocsBtn.addEventListener('click', loadDocuments);
    backToListBtn.addEventListener('click', showDocumentsList);
    
    // Category navigation
    allDocumentsLink.addEventListener('click', function(e) {
        e.preventDefault();
        setActiveCategory(this);
        filterByCategory('all');
    });
    
    recentDocumentsLink.addEventListener('click', function(e) {
        e.preventDefault();
        setActiveCategory(this);
        filterByCategory('recent');
    });
    
    projectOverviewsLink.addEventListener('click', function(e) {
        e.preventDefault();
        setActiveCategory(this);
        filterByCategory('projectoverview');
    });
    
    techStacksLink.addEventListener('click', function(e) {
        e.preventDefault();
        setActiveCategory(this);
        filterByCategory('techstack');
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
                    filteredDocuments = [...allDocuments];
                    renderDocuments();
                } else {
                    // If we get an empty array, show empty state
                    allDocuments = [];
                    filteredDocuments = [];
                    renderDocuments();
                }
                hideLoading();
            })
            .catch(error => {
                console.error('Error loading documents:', error);
                // Show error state instead of using mock data
                showErrorMessage('Failed to load documents. Please try refreshing the page.');
                hideLoading();
            });
    }
    
    // Show error message
    function showErrorMessage(message) {
        allDocumentsList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i> 
                    ${message}
                </div>
            </div>
        `;
        recentDocumentsList.innerHTML = '';
    }
    
    // Apply filters to the document list
    function applyFilters() {
        const projectName = projectFilter.value.toLowerCase().trim();
        const docType = documentTypeFilter.value;
        
        filteredDocuments = allDocuments.filter(doc => {
            let matchesProject = true;
            let matchesType = true;
            
            if (projectName) {
                matchesProject = doc.projectName.toLowerCase().includes(projectName);
            }
            
            if (docType) {
                matchesType = doc.documentType === docType;
            }
            
            return matchesProject && matchesType;
        });
        
        currentView.textContent = 'Filtered Documentation';
        renderDocuments();
    }
    
    // Filter documents by category
    function filterByCategory(category) {
        if (category === 'all') {
            filteredDocuments = [...allDocuments];
            currentView.textContent = 'All Documentation';
        } else if (category === 'recent') {
            // Get the most recent 5 documents
            filteredDocuments = [...allDocuments]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);
            currentView.textContent = 'Recent Documentation';
        } else {
            // Filter by document type
            filteredDocuments = allDocuments.filter(doc => doc.documentType === category);
            currentView.textContent = capitalize(category) + ' Documentation';
        }
        
        renderDocuments();
    }
    
    // Set active category in sidebar
    function setActiveCategory(element) {
        // Remove active class from all links
        document.querySelectorAll('.list-group-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked link
        element.classList.add('active');
    }
    
    // Render document cards in the list
    function renderDocuments() {
        // Clear existing content
        allDocumentsList.innerHTML = '';
        recentDocumentsList.innerHTML = '';
        
        // If no documents, show empty state
        if (filteredDocuments.length === 0) {
            allDocumentsList.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="bi bi-file-earmark-x" style="font-size: 2rem;"></i>
                        <p class="mt-3">No documents found matching your criteria.</p>
                    </div>
                </div>
            `;
            return;
        }
        
        // Sort documents by date (newest first)
        const sortedDocuments = [...filteredDocuments].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        // Populate recent documents (top 3)
        const recentDocs = sortedDocuments.slice(0, 3);
        recentDocs.forEach(doc => {
            recentDocumentsList.appendChild(createDocumentCard(doc));
        });
        
        // Populate all documents
        sortedDocuments.forEach(doc => {
            allDocumentsList.appendChild(createDocumentCard(doc));
        });
    }
    
    // Create a document card element
    function createDocumentCard(doc) {
        const docTypeLabel = capitalize(doc.documentType);
        const col = document.createElement('div');
        col.className = 'col';
        
        // Format date
        const dateObj = new Date(doc.createdAt);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
        
        col.innerHTML = `
            <div class="card h-100 doc-card" data-id="${doc.id}">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <span class="badge bg-primary mb-2">${docTypeLabel}</span>
                        <small class="text-muted">${formattedDate}</small>
                    </div>
                    <h5 class="card-title text-truncate">${doc.projectName}</h5>
                    <p class="card-text text-truncate">
                        ${doc.fileName}
                    </p>
                </div>
                <div class="card-footer bg-transparent border-top-0">
                    <button class="btn btn-sm btn-outline-primary view-document" data-id="${doc.id}">
                        <i class="bi bi-eye"></i> View
                    </button>
                </div>
            </div>
        `;
        
        // Add click event for the whole card
        const card = col.querySelector('.doc-card');
        card.addEventListener('click', function() {
            viewDocument(doc.id);
        });
        
        // Add click event for the view button
        const viewBtn = col.querySelector('.view-document');
        viewBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click
            viewDocument(doc.id);
        });
        
        return col;
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
        
        // Directly fetch the document from the output-docs folder
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
                documentsList.classList.add('d-none');
                documentPreview.classList.remove('d-none');
                hideLoading();
            });
    }
    
    // Display document in the preview area
    function displayDocument(doc) {
        // Update metadata display
        previewTitle.textContent = doc.projectName;
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
        documentProject.textContent = doc.projectName;
        
        // Render markdown content
        documentContent.innerHTML = marked.parse(doc.content);
        
        // Show the preview, hide the list
        documentsList.classList.add('d-none');
        documentPreview.classList.remove('d-none');
    }
    
    // Show document list, hide preview
    function showDocumentsList() {
        documentPreview.classList.add('d-none');
        documentsList.classList.remove('d-none');
    }
    
    // Export document as markdown file
    function exportMarkdown(doc) {
        const blob = new Blob([doc.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Helper function to capitalize first letter
    function capitalize(string) {
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