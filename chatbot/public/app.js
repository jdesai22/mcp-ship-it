document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const chatMessages = document.getElementById('chatMessages');
    const userMessageInput = document.getElementById('userMessage');
    const sendMessageBtn = document.getElementById('sendMessage');
    const documentTypeSelect = document.getElementById('documentType');
    const projectNameInput = document.getElementById('projectName');
    const saveDocumentBtn = document.getElementById('saveDocument');
    const clearChatBtn = document.getElementById('clearChat');
    const currentDocumentTitle = document.getElementById('currentDocument');
    const savedDocsList = document.getElementById('savedDocsList');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const documentSavedToast = document.getElementById('documentSavedToast');
    
    // Create toast instance
    const toast = new bootstrap.Toast(documentSavedToast);
    
    // Chat history
    let messageHistory = [];
    let currentDocumentPath = null;
    let savedDocuments = [];
    
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
    
    documentTypeSelect.addEventListener('change', updateDocumentTitle);
    projectNameInput.addEventListener('input', updateDocumentTitle);
    saveDocumentBtn.addEventListener('click', saveDocument);
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
                toast.show();
                // Add to saved documents list
                updateSavedDocumentsList(data.filePath);
            }
            
            // Enable save button if we have content and project details
            updateSaveButtonState();
            
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
        } else {
            currentDocumentTitle.textContent = 'Technical Documentation Chat';
        }
        
        // Update save button state
        updateSaveButtonState();
    }
    
    // Update save button state
    function updateSaveButtonState() {
        // Enable save button if we have a project name, document type, and at least one message
        const projectName = projectNameInput.value.trim();
        const documentType = documentTypeSelect.value;
        const hasMessages = messageHistory.length > 0;
        
        saveDocumentBtn.disabled = !(projectName && documentType && hasMessages);
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
        
        listItem.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${filename}</h6>
            </div>
            <small class="text-muted">Click to view</small>
        `;
        
        savedDocsList.appendChild(listItem);
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
        addSystemMessage('Welcome to the Technical Documentation Generator! I\'ll help you create detailed documentation for your project following the Windsurf Meta-Workflow methodology.\n\nTo get started:\n1. Enter your project name in the sidebar\n2. Select the type of document you want to create\n3. Describe your project and requirements\n\nWhat type of project are you working on?');
        
        // Reset current document path
        currentDocumentPath = null;
        
        // Reset document title
        currentDocumentTitle.textContent = 'Technical Documentation Chat';
        
        // Update save button state
        updateSaveButtonState();
    }
}); 