import { mainBranch } from "./config.js";
import { 
  ensureOutputDirectories, 
  loadFileDictionary, 
  scanRepository, 
  createTaskDocument, 
  saveFileDictionary,
  genTechnicalDocs,
  updateTechnicalDocs
} from "./documentation-utils.js";
import fs from 'fs';
import path from 'path';

/**
 * Handle push webhook events
 * @param {Object} param0 - Event data containing octokit and payload
 */
async function handlePush({ octokit, payload }) {
  const owner = payload.repository.owner.name || payload.repository.owner.login;
  const repo = payload.repository.name;
  const ref = payload.ref;
  const commits = payload.commits;
  const branch = ref.replace('refs/heads/', '');
  const isMainBranch = branch === (mainBranch || 'main');

  console.log(`Received a push event on ${ref} with ${commits.length} commit(s).`);
  
  // Setup directories and load dictionary
  const { repoFolder, repoFolderExists } = ensureOutputDirectories(repo);
  const { fileContentsDict, dictionaryFilePath } = loadFileDictionary(repoFolder);
  
  // Flag to track if this is the first push to main branch
  const isFirstPushToMain = isMainBranch && !repoFolderExists;
  
  // Check if docs folder exists
  const docsFolder = path.join(repoFolder, 'docs');
  const docsFolderExists = fs.existsSync(docsFolder);
  
  // Track modified files for this push
  const modifiedFiles = [];
  
  // If this is the first push to main branch, scan the whole repository
  if (isFirstPushToMain) {
    console.log(`First push to main branch for ${repo}. Scanning all repository files...`);
    await scanRepository(octokit, owner, repo, branch, fileContentsDict);
  } else {
    if (!isMainBranch) {
      console.log(`Push is not to main branch. Only processing modified files.`);
    } else if (repoFolderExists) {
      console.log(`Repository folder already exists. Only processing modified files.`);
    }
  }

  // Process each commit in the push
  for (const commit of commits) {
    const { validFileModified, modifiedFilesList } = await createTaskDocument(
      commit, 
      branch, 
      repoFolder, 
      octokit, 
      owner, 
      repo, 
      isMainBranch, 
      fileContentsDict
    );
    
    // Add modified files from this commit to the list
    if (modifiedFilesList && modifiedFilesList.length > 0) {
      modifiedFiles.push(...modifiedFilesList);
    }
    
    console.log('---');
  }
  
  // Save the dictionary if necessary
  saveFileDictionary(isMainBranch, fileContentsDict, dictionaryFilePath);
  
  // If this is the first push to main branch, generate technical documentation
  if (isFirstPushToMain) {
    console.log('First push to main detected. Generating technical documentation...');
    
    try {
      const docGenResult = await genTechnicalDocs(repo, octokit, owner, true);
      
      if (docGenResult.success) {
        console.log(`Technical documentation generated successfully in ${docGenResult.docsFolder}`);
        console.log(`Generated ${docGenResult.filePaths.length} documentation files.`);
      } else {
        console.error(`Failed to generate technical documentation: ${docGenResult.reason || docGenResult.error}`);
      }
    } catch (error) {
      console.error('Error during technical documentation generation:', error);
    }
  } 
  // If it's a push to main and docs folder already exists, update documentation
  else if (isMainBranch && docsFolderExists && modifiedFiles.length > 0) {
    console.log('Push to main detected with existing documentation. Checking for documentation updates...');
    
    try {
      const updateResult = await updateTechnicalDocs(repo, octokit, owner, modifiedFiles, fileContentsDict);
      
      if (updateResult.success) {
        console.log(`Technical documentation updated successfully.`);
        if (updateResult.updatedFiles && updateResult.updatedFiles.length > 0) {
          console.log(`Updated ${updateResult.updatedFiles.length} documentation file(s):`);
          updateResult.updatedFiles.forEach(file => console.log(`- ${file}`));
        } else {
          console.log('No documentation changes were needed.');
        }
      } else {
        console.error(`Failed to update technical documentation: ${updateResult.reason || updateResult.error}`);
      }
    } catch (error) {
      console.error('Error during technical documentation update:', error);
    }
  }
}

export { handlePush }; 