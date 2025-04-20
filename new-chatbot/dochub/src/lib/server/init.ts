import { ensureTemplatesDirectory, ensureSampleTemplatesDirectory, initializeSampleTemplates } from './templates';
import { ensureOutputDirectory } from './documents';

// Initialize server resources
export const initServer = (): void => {
  // Ensure required directories exist
  ensureTemplatesDirectory();
  ensureSampleTemplatesDirectory();
  ensureOutputDirectory();
  
  // Initialize sample templates
  initializeSampleTemplates();
  
  console.log('Server resources initialized');
};

export default initServer; 