const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Webhook Server!');
});


app.post('/webhook', (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;

  if (event === 'push') {
    console.log(`🔔 Received a push event for ${payload.repository.full_name}`);
    payload.commits.forEach(commit => {
      console.log(`- ${commit.message}`);
      console.log(`  Added: ${commit.added.join(', ')}`);
      console.log(`  Modified: ${commit.modified.join(', ')}`);
      console.log(`  Removed: ${commit.removed.join(', ')}`);
    });
  }

  res.status(200).send('Webhook received');
});
// /test endpoint
app.all('/test', (req, res) => {
    console.log('✅ /test endpoint reached');
    console.log(`Method: ${req.method}`);
    console.log('Headers:', req.headers);
    console.log('Query:', req.query);
    console.log('Body:', req.body);
    res.status(200).send('Test endpoint reached');
  });
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });