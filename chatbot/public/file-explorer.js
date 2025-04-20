document.addEventListener('DOMContentLoaded', function() {
    // Function to create a file explorer UI
    function createFileExplorer(containerId, projects) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Clear the container
        container.innerHTML = '';
        
        // Get the template
        const template = document.getElementById('file-explorer-template');
        if (!template) return;
        
        // For each project, create a folder item
        projects.forEach(project => {
            // Clone the template content
            const fileExplorer = template.content.cloneNode(true);
            
            // Set the project name and file count
            const folderName = fileExplorer.querySelector('.file-explorer-folder-name');
            const folderCount = fileExplorer.querySelector('.file-explorer-folder-count');
            
            folderName.textContent = project.name;
            folderCount.textContent = project.files ? project.files.length : 0;
            
            // Add files to the folder
            const filesList = fileExplorer.querySelector('.file-explorer-files');
            
            // Initially hide the files list
            filesList.style.display = 'none';
            
            // Toggle files visibility when clicking on folder
            const folderItem = fileExplorer.querySelector('.file-explorer-folder');
            folderItem.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent bubbling
                
                // Get project name from folder
                const projectName = folderName.textContent;
                
                // Check if we should expand or collapse
                if (filesList.style.display === 'none') {
                    // Show files and update icon
                    filesList.style.display = 'block';
                    const folderIcon = folderItem.querySelector('.file-explorer-folder-icon');
                    if (folderIcon) {
                        folderIcon.classList.remove('bi-folder-fill');
                        folderIcon.classList.add('bi-folder2-open');
                    }
                    
                    // Collapse all other folders
                    document.querySelectorAll('.file-explorer-files').forEach(list => {
                        if (list !== filesList) {
                            list.style.display = 'none';
                            // Find the associated folder icon
                            const parentFolder = list.previousElementSibling;
                            if (parentFolder) {
                                const icon = parentFolder.querySelector('.file-explorer-folder-icon');
                                if (icon) {
                                    icon.classList.remove('bi-folder2-open');
                                    icon.classList.add('bi-folder-fill');
                                }
                            }
                        }
                    });
                    
                    // Trigger project view update if we're on the dashboard
                    if (typeof showProjectDocuments === 'function') {
                        const project = window.dashboardProjects ? 
                            window.dashboardProjects.find(p => p.name === projectName) : null;
                        if (project) {
                            showProjectDocuments(project);
                        }
                    }
                } else {
                    // Hide files and update icon
                    filesList.style.display = 'none';
                    const folderIcon = folderItem.querySelector('.file-explorer-folder-icon');
                    if (folderIcon) {
                        folderIcon.classList.remove('bi-folder2-open');
                        folderIcon.classList.add('bi-folder-fill');
                    }
                }
            });
            
            // Add files if available
            if (project.files && project.files.length > 0) {
                project.files.forEach(file => {
                    const fileItem = document.createElement('li');
                    fileItem.className = 'file-explorer-file';
                    
                    // Determine file icon based on extension
                    let fileIcon = 'bi-file-text';
                    if (file.endsWith('.md')) {
                        fileIcon = 'bi-file-earmark-text';
                    } else if (file.endsWith('.js')) {
                        fileIcon = 'bi-file-earmark-code';
                    } else if (file.endsWith('.css')) {
                        fileIcon = 'bi-file-earmark-code';
                    } else if (file.endsWith('.html')) {
                        fileIcon = 'bi-file-earmark-code';
                    }
                    
                    // Create file item with icon and name
                    fileItem.innerHTML = `
                        <i class="bi ${fileIcon} file-explorer-file-icon"></i>
                        <span>${file}</span>
                    `;
                    
                    // Add click handler for file (can be customized)
                    fileItem.addEventListener('click', function(e) {
                        e.stopPropagation(); // Prevent folder toggle
                        
                        // Handle file click for dashboard
                        if (typeof viewDocument === 'function') {
                            const fileName = this.querySelector('span').textContent;
                            const projectName = this.closest('.file-explorer-item')
                                .querySelector('.file-explorer-folder-name').textContent;
                            
                            // Find the document in our data
                            const project = window.dashboardProjects ? 
                                window.dashboardProjects.find(p => p.name === projectName) : null;
                            if (project) {
                                const document = project.documents.find(d => d.fileName.includes(fileName));
                                if (document) {
                                    viewDocument(document.id);
                                }
                            }
                        } else {
                            console.log(`File clicked: ${file}`);
                        }
                    });
                    
                    filesList.appendChild(fileItem);
                });
            } else {
                // Show empty folder message
                const emptyItem = document.createElement('li');
                emptyItem.className = 'text-muted small';
                emptyItem.style.padding = '4px 8px';
                emptyItem.textContent = 'No files';
                filesList.appendChild(emptyItem);
            }
            
            // Add the explorer to the container
            container.appendChild(fileExplorer);
        });
    }
    
    // Make functions globally available
    window.FileExplorer = {
        create: createFileExplorer
    };
}); 