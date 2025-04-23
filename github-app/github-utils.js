/**
 * Recursive function to get all files from a repository directory
 * @param {object} octokit - The authenticated Octokit instance
 * @param {string} owner - The repository owner
 * @param {string} repo - The repository name
 * @param {string} path - The path to scan (empty for root)
 * @param {string} ref - The reference (branch, commit SHA)
 * @returns {Promise<Array>} - List of file paths
 */
async function getFilesRecursively(octokit, owner, repo, path = '', ref) {
  const files = [];

  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path,
      ref,
      headers: {
        'x-github-api-version': '2022-11-28',
      },
    });

    for (const item of response.data) {
      if (item.type === 'file') {
        files.push(item);
      } else if (item.type === 'dir') {
        const nestedFiles = await getFilesRecursively(octokit, owner, repo, item.path, ref);
        files.push(...nestedFiles);
      }
    }
  } catch (error) {
    console.error(`Error fetching repository contents for ${path}: ${error.message}`);
  }

  return files;
}

/**
 * Fetch the content of a file from GitHub
 * @param {object} octokit - The authenticated Octokit instance
 * @param {string} owner - The repository owner
 * @param {string} repo - The repository name
 * @param {string} path - The file path
 * @param {string} ref - The reference (branch, commit SHA)
 * @returns {Promise<string>} - File content as a string
 */
async function getFileContent(octokit, owner, repo, path, ref) {
  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path,
      ref,
      headers: {
        'x-github-api-version': '2022-11-28',
      },
    });

    // Check if content is available directly in the response
    if (response.data.content && response.data.encoding === 'base64') {
      return Buffer.from(response.data.content, 'base64').toString('utf8');
    }
    
    // For larger files, we need to get the raw content using the download_url
    if (response.data.download_url) {
      const contentResponse = await fetch(response.data.download_url);
      return await contentResponse.text();
    }
    
    throw new Error('Could not retrieve file content - neither content nor download_url available');
  } catch (error) {
    throw new Error(`Error fetching content for ${path}: ${error.message}`);
  }
}

export {
  getFilesRecursively,
  getFileContent
}; 