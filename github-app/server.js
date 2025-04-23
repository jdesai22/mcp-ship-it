import { App } from "octokit";
import { createNodeMiddleware } from "@octokit/webhooks";
import http from "http";
import { fileURLToPath } from 'url';
import path from 'path';

import { 
  appId, 
  webhookSecret, 
  privateKey, 
  port, 
  host, 
  path as webhookPath, 
  localWebhookUrl 
} from "./config.js";

import { handlePush } from "./webhook-handlers.js";

// Initialize the GitHub App
const app = new App({
  appId: appId,
  privateKey: privateKey,
  webhooks: {
    secret: webhookSecret
  },
});

// Register webhook event handlers
app.webhooks.on("push", handlePush);

// Error handling for webhooks
app.webhooks.onError((error) => {
  if (error.name === "AggregateError") {
    console.error(`Error processing request: ${error.event}`);
  } else {
    console.error(error);
  }
});

// Create middleware for handling incoming webhook events
const middleware = createNodeMiddleware(app.webhooks, { path: webhookPath });

// Start the server
const server = http.createServer(middleware);

// Export for testing or programmatic use
export { app, server };

// ES module equivalent of require.main === module
// Get the current file's URL and convert to path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if this file is being run directly
const isMainModule = process.argv[1] === __filename;

// Only start the server if this file is run directly
if (isMainModule) {
  server.listen(port, () => {
    console.log(`Server is listening for events at: ${localWebhookUrl}`);
    console.log('Press Ctrl + C to quit.');
  });
}