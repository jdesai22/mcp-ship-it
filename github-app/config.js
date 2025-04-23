import dotenv from "dotenv";
import fs from "fs";

// Load environment variables
dotenv.config();

// App configuration
const appId = process.env.APP_ID;
const webhookSecret = process.env.WEBHOOK_SECRET;
const privateKeyPath = process.env.PRIVATE_KEY_PATH;
const mainBranch = process.env.MAIN_BRANCH || 'main';

// Parse valid file extensions from environment variable or use defaults
let validFileExtensions;
if (process.env.VALID_FILE_EXTENSIONS) {
  validFileExtensions = process.env.VALID_FILE_EXTENSIONS.split(',');
} else {
  validFileExtensions = ['.js', '.html', '.css', '.md', '.json'];
}

// Templates directory path (relative to project root)
const templatesDir = process.env.TEMPLATES_DIR || '../templates';

// Server configuration
const port = 3000;
const host = 'localhost';
const path = "/api/webhook";
const localWebhookUrl = `http://${host}:${port}${path}`;

// Read private key
const privateKey = fs.readFileSync(privateKeyPath, "utf8");

export {
  appId,
  webhookSecret,
  privateKeyPath,
  mainBranch,
  validFileExtensions,
  templatesDir,
  port,
  host,
  path,
  localWebhookUrl,
  privateKey
}; 