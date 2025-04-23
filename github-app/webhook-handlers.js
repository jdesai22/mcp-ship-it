import { mainBranch } from "./config.js";
import { 
  ensureOutputDirectories, 
  loadFileDictionary, 
  scanRepository, 
  createTaskDocument, 
  saveFileDictionary,
  genTechnicalDocs 
} from "./documentation-utils.js";

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
    await createTaskDocument(
      commit, 
      branch, 
      repoFolder, 
      octokit, 
      owner, 
      repo, 
      isMainBranch, 
      fileContentsDict
    );
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
}

export { handlePush }; 