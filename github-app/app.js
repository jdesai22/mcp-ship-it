// These are the dependencies for this file.
//
// You installed the `dotenv` and `octokit` modules earlier. The `@octokit/webhooks` is a dependency of the `octokit` module, so you don't need to install it separately. The `fs` and `http` dependencies are built-in Node.js modules.
import dotenv from "dotenv";
import {App} from "octokit";
import {createNodeMiddleware} from "@octokit/webhooks";
import fs from "fs";
import http from "http";

// This reads your `.env` file and adds the variables from that file to the `process.env` object in Node.js.
dotenv.config();

// This assigns the values of your environment variables to local variables.
const appId = process.env.APP_ID;
const webhookSecret = process.env.WEBHOOK_SECRET;
const privateKeyPath = process.env.PRIVATE_KEY_PATH;

// This reads the contents of your private key file.
const privateKey = fs.readFileSync(privateKeyPath, "utf8");

// This creates a new instance of the Octokit App class.
const app = new App({
  appId: appId,
  privateKey: privateKey,
  webhooks: {
    secret: webhookSecret
  },
});

// This defines the message that your app will post to push events
async function handlePush({ octokit, payload }) {
    const owner = payload.repository.owner.name || payload.repository.owner.login;
    const repo = payload.repository.name;
    const ref = payload.ref;
    const commits = payload.commits;
  
    console.log(`Received a push event on ${ref} with ${commits.length} commit(s).`);
  
    for (const commit of commits) {
      const sha = commit.id;
      const shortSha = sha.substring(0, 7); // Get first 7 characters of commit hash
      const message = commit.message;
      const author = commit.author.name;
      const timestamp = commit.timestamp;
      
      // Create a brief detail from commit message (first line, sanitized for filename)
      const briefDetail = message.split('\n')[0]
        .replace(/[^a-zA-Z0-9]/g, '_')  // Replace non-alphanumeric chars with underscore
        .replace(/_+/g, '_')            // Replace multiple underscores with single one
        .substring(0, 50)               // Limit length
        .trim();
  
      console.log(`Changes made in this commit:`);
      console.log(`Commit SHA: ${sha}`);
      console.log(`Author: ${author}`);
      console.log(`Date: ${timestamp}`);
      console.log(`Message: ${message}`);
      
      // Prepare content for the task markdown file
      let taskContent = `# Task: ${message.split('\n')[0]}\n\n`;
      taskContent += `## Commit Details\n\n`;
      taskContent += `- **Commit:** ${sha}\n`;
      taskContent += `- **Author:** ${author}\n`;
      taskContent += `- **Date:** ${timestamp}\n`;
      taskContent += `- **Branch:** ${ref.replace('refs/heads/', '')}\n\n`;
      taskContent += `## Commit Message\n\n\`\`\`\n${message}\n\`\`\`\n\n`;
      taskContent += `## Modified Files\n\n`;
      
      // Log the content of the files that were changed
      for (const modifiedFile of commit.modified) {
        console.log(`Modified file: ${modifiedFile}`);
        taskContent += `### ${modifiedFile}\n\n`;
        
        try {
          const fileContent = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner,
            repo,
            path: modifiedFile,
            ref: sha,
            headers: {
              'x-github-api-version': '2022-11-28',
            },
          });
          const content = Buffer.from(fileContent.data.content, 'base64').toString('utf8');
          console.log(`Content of ${modifiedFile}:\n${content}`);
          
          taskContent += `\`\`\`\n${content}\n\`\`\`\n\n`;
        } catch (error) {
          console.error(`Error fetching content for ${modifiedFile}: ${error.message}`);
          taskContent += `*Error fetching content: ${error.message}*\n\n`;
        }
      }
      
      // Create output_docs directory if it doesn't exist
      if (!fs.existsSync('./output_docs')) {
        fs.mkdirSync('./output_docs', { recursive: true });
      }
      
      // Write the task markdown file
      const filename = `./output_docs/task_${briefDetail}_${shortSha}.md`;
      fs.writeFileSync(filename, taskContent);
      console.log(`Task documentation created: ${filename}`);
      
      console.log('---');
    }
  
    // Optionally, post a summary comment or create an issue with the commit summaries
    // const summary = commits.map(c => `- ${c.message.split('\n')[0]} (by ${c.author.name})`).join('\n');
  
    // try {
    //   await octokit.request('POST /repos/{owner}/{repo}/issues', {
    //     owner,
    //     repo,
    //     title: `📝 Commit Summary for Push to ${ref}`,
    //     body: summary,
    //     headers: {
    //       'x-github-api-version': '2022-11-28',
    //     },
    //   });
    // } catch (error) {
    //   if (error.response) {
    //     console.error(`Error! Status: ${error.response.status}. Message: ${error.response.data.message}`);
    //   } else {
    //     console.error(`Error: ${error.message}`);
    //   }
    // }
  }
  

// This sets up a webhook event listener. When your app receives a webhook event from GitHub with a `X-GitHub-Event` header value of `pull_request` and an `action` payload value of `opened`, it calls the `handlePullRequestOpened` event handler that is defined above.
app.webhooks.on("push", handlePush);

// This logs any errors that occur.
app.webhooks.onError((error) => {
  if (error.name === "AggregateError") {
    console.error(`Error processing request: ${error.event}`);
  } else {
    console.error(error);
  }
});

// This determines where your server will listen.
//
// For local development, your server will listen to port 3000 on `localhost`. When you deploy your app, you will change these values. For more information, see [Deploy your app](#deploy-your-app).
const port = 3000;
const host = 'localhost';
const path = "/api/webhook";
const localWebhookUrl = `http://${host}:${port}${path}`;

// This sets up a middleware function to handle incoming webhook events.
//
// Octokit's `createNodeMiddleware` function takes care of generating this middleware function for you. The resulting middleware function will:
//
//    - Check the signature of the incoming webhook event to make sure that it matches your webhook secret. This verifies that the incoming webhook event is a valid GitHub event.
//    - Parse the webhook event payload and identify the type of event.
//    - Trigger the corresponding webhook event handler.
const middleware = createNodeMiddleware(app.webhooks, {path});

// This creates a Node.js server that listens for incoming HTTP requests (including webhook payloads from GitHub) on the specified port. When the server receives a request, it executes the `middleware` function that you defined earlier. Once the server is running, it logs messages to the console to indicate that it is listening.
http.createServer(middleware).listen(port, () => {
  console.log(`Server is listening for events at: ${localWebhookUrl}`);
  console.log('Press Ctrl + C to quit.')
});

