document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const chatMessages = document.getElementById('chatMessages');
    const userMessageInput = document.getElementById('userMessage');
    const sendMessageBtn = document.getElementById('sendMessage');
    const documentTypeSelect = document.getElementById('documentType');
    const projectNameInput = document.getElementById('projectName');
    const saveDocumentBtn = document.getElementById('saveDocument');
    const generateAllDocsBtn = document.getElementById('generateAllDocs');
    const clearChatBtn = document.getElementById('clearChat');
    const currentDocumentTitle = document.getElementById('currentDocument');
    const savedDocsList = document.getElementById('savedDocsList');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    const documentSavedToast = document.getElementById('documentSavedToast');
    const toastMessage = document.getElementById('toastMessage');
    
    // Project docs modal elements
    const projectDocsModal = new bootstrap.Modal(document.getElementById('projectDocsModal'));
    const projectTitle = document.getElementById('projectTitle');
    const projectGenerated = document.getElementById('projectGenerated');
    const projectDocsList = document.getElementById('projectDocsList');
    
    // Create toast instance
    const toast = new bootstrap.Toast(documentSavedToast);
    
    // Chat history
    let messageHistory = [];
    let currentDocumentPath = null;
    let savedDocuments = [];
    let projectStructure = {};
    
    // Initialize by fetching document types
    fetchDocumentationTypes();
    
    // Event listeners
    sendMessageBtn.addEventListener('click', sendMessage);
    userMessageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    documentTypeSelect.addEventListener('change', updateButtonStates);
    projectNameInput.addEventListener('input', updateButtonStates);
    saveDocumentBtn.addEventListener('click', saveDocument);
    generateAllDocsBtn.addEventListener('click', generateAllDocuments);
    clearChatBtn.addEventListener('click', clearChat);
    
    // Fetch document types from API
    async function fetchDocumentationTypes() {
        try {
            const response = await fetch('/api/documentation-types');
            const documentTypes = await response.json();
            
            // Clear select options except the placeholder
            while (documentTypeSelect.options.length > 1) {
                documentTypeSelect.remove(1);
            }
            
            // Add document types to select
            documentTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type.id;
                option.textContent = type.name;
                option.setAttribute('data-description', type.description);
                documentTypeSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching document types:', error);
            addSystemMessage('Failed to load document types. Please refresh the page or try again later.');
        }
    }
    
    // Update button states based on form inputs
    function updateButtonStates() {
        const projectName = projectNameInput.value.trim();
        const documentType = documentTypeSelect.value;
        const hasMessages = messageHistory.length > 0;
        
        // Enable/disable save button
        saveDocumentBtn.disabled = !(projectName && documentType && hasMessages);
        
        // Enable/disable generate all button - only need project name to be filled
        generateAllDocsBtn.disabled = !projectName;
        
        // Update document title
        updateDocumentTitle();

        // Log button state for debugging
        console.log('Generate All button state updated:', {
            projectName,
            hasMessages,
            isDisabled: generateAllDocsBtn.disabled
        });
    }
    
    // Generate all documents
    async function generateAllDocuments() {
        const projectName = projectNameInput.value.trim();
        
        if (!projectName) {
            addSystemMessage('Please enter a project name before generating all documents.');
            return;
        }
        
        // No longer requiring message history for initial generation
        // User can still provide project details if they want
        
        // Show loading indicator with custom text
        loadingText.textContent = 'Generating complete documentation set. This may take a few minutes...';
        loadingOverlay.classList.remove('d-none');
        
        try {
            // Get project details
            const projectDetails = {
                name: projectName,
                generateAll: true
            };
            
            // Prepare messages - if we have no message history, create a basic one
            const messagesForGeneration = messageHistory.length > 0 ? 
                messageHistory : 
                [{ 
                    role: 'user', 
                    content: `Please generate complete technical documentation for my project named "${projectName}". This is a new project, so please create generic but sensible documentation that I can later customize.` 
                }];
            
            // Make API request
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messagesForGeneration,
                    projectDetails: projectDetails
                })
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // If we didn't have messages before, add the generic one to history
            if (messageHistory.length === 0) {
                // Add the initial message to chat and history
                addUserMessage(messagesForGeneration[0].content);
                messageHistory.push(messagesForGeneration[0]);
            }
            
            // Add assistant message to chat
            addAssistantMessage(data.message.content);
            
            // Add message to history
            messageHistory.push({ role: 'assistant', content: data.message.content });
            
            // Store project structure
            if (data.projectPath && data.filePaths) {
                projectStructure[projectName] = {
                    path: data.projectPath,
                    files: data.filePaths,
                    timestamp: new Date().toLocaleString()
                };
                
                // Update saved documents list with project folder
                updateProjectDocumentsList(projectName, data.projectPath);
                
                // Show toast notification
                toastMessage.textContent = 'All documentation generated successfully!';
                toast.show();
                
                // Show modal with all documents
                showProjectDocumentsModal(projectName);
            }
            
        } catch (error) {
            console.error('Error generating documents:', error);
            addSystemMessage('An error occurred while generating the documentation. Please try again.');
        } finally {
            // Reset loading text and hide loading indicator
            loadingText.textContent = 'Generating documentation...';
            loadingOverlay.classList.add('d-none');
            
            // Update button states since message history might have changed
            updateButtonStates();
        }
    }
    
    // Show modal with project documents
    function showProjectDocumentsModal(projectName) {
        const project = projectStructure[projectName];
        
        if (!project) return;
        
        // Set project title and timestamp
        projectTitle.textContent = projectName;
        projectGenerated.textContent = `Generated on: ${project.timestamp}`;
        
        // Clear previous list
        projectDocsList.innerHTML = '';
        
        // Add index file first
        const indexFile = project.files.find(file => file.type === 'Index');
        if (indexFile) {
            const indexItem = document.createElement('a');
            indexItem.href = `/${indexFile.path}`;
            indexItem.className = 'list-group-item list-group-item-action';
            indexItem.target = '_blank';
            indexItem.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">Index</h6>
                    <small class="text-muted"><i class="bi bi-file-text"></i></small>
                </div>
                <small class="text-muted">Documentation index file</small>
            `;
            projectDocsList.appendChild(indexItem);
        }
        
        // Add all other documents
        project.files.filter(file => file.type !== 'Index').forEach(file => {
            const item = document.createElement('a');
            item.href = `/${file.path}`;
            item.className = 'list-group-item list-group-item-action';
            item.target = '_blank';
            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${file.type}</h6>
                    <small class="text-muted"><i class="bi bi-file-text"></i></small>
                </div>
                <small class="text-muted">${file.path.split('/').pop()}</small>
            `;
            projectDocsList.appendChild(item);
        });
        
        // Show the modal
        projectDocsModal.show();
    }
    
    // Send message to API
    async function sendMessage() {
        const userMessage = userMessageInput.value.trim();
        
        if (!userMessage) return;
        
        // Add user message to chat
        addUserMessage(userMessage);
        
        // Clear input
        userMessageInput.value = '';
        
        // Add message to history
        messageHistory.push({ role: 'user', content: userMessage });
        
        // Show loading indicator
        loadingOverlay.classList.remove('d-none');
        
        try {
            // Get project details
            const projectDetails = {
                name: projectNameInput.value.trim(),
                documentType: documentTypeSelect.value
            };
            
            // Make API request
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messageHistory,
                    projectDetails: projectDetails.name && projectDetails.documentType ? projectDetails : null
                })
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Add assistant message to chat
            addAssistantMessage(data.message.content);
            
            // Add message to history
            messageHistory.push({ role: 'assistant', content: data.message.content });
            
            // Update current document path if one was saved
            if (data.filePath) {
                currentDocumentPath = data.filePath;
                // Show toast notification
                toastMessage.textContent = 'Document saved successfully!';
                toast.show();
                // Add to saved documents list
                updateSavedDocumentsList(data.filePath);
            }
            
            // Update button states
            updateButtonStates();
            
        } catch (error) {
            console.error('Error sending message:', error);
            addSystemMessage('An error occurred while processing your request. Please try again.');
        } finally {
            // Hide loading indicator
            loadingOverlay.classList.add('d-none');
        }
    }
    
    // Add user message to chat
    function addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = message;
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString();
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Add assistant message to chat
    function addAssistantMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant-message';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content markdown-content';
        contentDiv.innerHTML = marked.parse(message);
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString();
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Add system message to chat
    function addSystemMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system-message';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = message;
        
        messageDiv.appendChild(contentDiv);
        
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Update document title based on selections
    function updateDocumentTitle() {
        const projectName = projectNameInput.value.trim();
        const documentTypeVal = documentTypeSelect.value;
        
        if (projectName && documentTypeVal) {
            const documentTypeName = documentTypeSelect.options[documentTypeSelect.selectedIndex].text;
            currentDocumentTitle.textContent = `${documentTypeName} - ${projectName}`;
        } else if (projectName) {
            currentDocumentTitle.textContent = `Documentation for ${projectName}`;
        } else {
            currentDocumentTitle.textContent = 'Technical Documentation Chat';
        }
    }
    
    // Save the current document
    async function saveDocument() {
        // Get project details
        const projectDetails = {
            name: projectNameInput.value.trim(),
            documentType: documentTypeSelect.value
        };
        
        // If missing details, show error
        if (!projectDetails.name || !projectDetails.documentType) {
            addSystemMessage('Please enter a project name and select a document type before saving.');
            return;
        }
        
        // Show loading indicator
        loadingOverlay.classList.remove('d-none');
        
        try {
            // Make API request
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messageHistory,
                    projectDetails: projectDetails
                })
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Update current document path
            if (data.filePath) {
                currentDocumentPath = data.filePath;
                // Show toast notification
                toastMessage.textContent = 'Document saved successfully!';
                toast.show();
                // Add to saved documents list
                updateSavedDocumentsList(data.filePath);
            } else {
                addSystemMessage('Document was processed but could not be saved. Please try again.');
            }
            
        } catch (error) {
            console.error('Error saving document:', error);
            addSystemMessage('An error occurred while saving your document. Please try again.');
        } finally {
            // Hide loading indicator
            loadingOverlay.classList.add('d-none');
        }
    }
    
    // Update the list of saved documents
    function updateSavedDocumentsList(filePath) {
        if (!filePath || savedDocuments.includes(filePath)) return;
        
        // Add to saved documents array
        savedDocuments.push(filePath);
        
        // Clear the "no documents" message if present
        if (savedDocsList.querySelector('.text-muted')) {
            savedDocsList.innerHTML = '';
        }
        
        // Create list item
        const listItem = document.createElement('a');
        listItem.href = `/${filePath}`;
        listItem.className = 'list-group-item list-group-item-action document-item';
        listItem.target = '_blank';
        
        // Extract filename from path
        const filename = filePath.split('/').pop();
        
        // Get document type from filename
        const docType = filename.split('-')[0].replace('.md', '');
        const docTypeName = getDocumentTypeName(docType);
        
        listItem.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${docTypeName || filename}</h6>
                <small class="text-muted"><i class="bi bi-file-text"></i></small>
            </div>
            <small class="text-muted">Click to view</small>
        `;
        
        savedDocsList.appendChild(listItem);
    }
    
    // Update project documents list
    function updateProjectDocumentsList(projectName, projectPath) {
        // Clear the "no documents" message if present
        if (savedDocsList.querySelector('.text-muted')) {
            savedDocsList.innerHTML = '';
        }
        
        // Create project folder item
        const folderItem = document.createElement('div');
        folderItem.className = 'list-group-item list-group-item-action document-item';
        folderItem.style.cursor = 'pointer';
        
        folderItem.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${projectName}</h6>
                <small class="text-muted"><i class="bi bi-folder-fill"></i></small>
            </div>
            <small class="text-muted">Complete documentation set</small>
        `;
        
        // Add click event to show project documents modal
        folderItem.addEventListener('click', () => {
            showProjectDocumentsModal(projectName);
        });
        
        savedDocsList.appendChild(folderItem);
    }
    
    // Get document type name from ID
    function getDocumentTypeName(docTypeId) {
        const option = Array.from(documentTypeSelect.options).find(opt => 
            opt.value.toLowerCase() === docTypeId.toLowerCase()
        );
        
        return option ? option.textContent : null;
    }
    
    // Clear the chat
    function clearChat() {
        // Confirm before clearing
        if (!confirm('Are you sure you want to clear the chat? This will remove all messages.')) {
            return;
        }
        
        // Reset message history
        messageHistory = [];
        
        // Clear chat messages, except the initial system message
        chatMessages.innerHTML = '';
        
        // Add initial system message
        addSystemMessage('Welcome to the Technical Documentation Generator! I\'ll help you create detailed documentation for your project following the Windsurf Meta-Workflow methodology.\n\nTo get started:\n1. Enter your project name in the sidebar\n2. Either:\n   - Select a specific document type to generate, or\n   - Click "Generate All Documents" to create a complete documentation set\n3. Describe your project and requirements\n\nWhat type of project are you working on?');
        
        // Reset current document path
        currentDocumentPath = null;
        
        // Reset document title
        currentDocumentTitle.textContent = 'Technical Documentation Chat';
        
        // Update button states
        updateButtonStates();
    }
}); 