// Minimal MCP-compliant server for Windsurf troubleshooting
// Implements https://modelcontextprotocol.io reference endpoints and schemas

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

// In-memory doc store
const contextDocs = [];

app.use(express.json());

// GET / : MCP health/status (MCP spec: ServiceStatus)
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'node-mcp-server',
    mcp_version: '1.0',
    time: new Date().toISOString()
  });
});

// POST /context : Accepts a context doc (MCP spec: ContextDocument)
app.post('/context', (req, res) => {
  const doc = req.body;
  // Per MCP: must have id, type, content, created_at
  if (!doc || typeof doc !== 'object' || !doc.id || !doc.type || !doc.content) {
    return res.status(400).json({ error: 'MCP ContextDocument requires id, type, content.' });
  }
  doc.created_at = doc.created_at || new Date().toISOString();
  contextDocs.push(doc);
  res.status(201).json({ message: 'ContextDocument stored.', id: doc.id });
});

// GET /context : List all context docs (MCP spec: ContextDocument[])
app.get('/context', (req, res) => {
  res.json(contextDocs);
});

// GET /events : SSE endpoint (MCP spec: EventStream)
app.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.flushHeaders();

  const sendHeartbeat = () => {
    res.write(`event: heartbeat\ndata: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);
  };
  const interval = setInterval(sendHeartbeat, 2000);
  sendHeartbeat();
  req.on('close', () => clearInterval(interval));
});

app.listen(PORT, () => {
  console.log(`MCP server running at http://localhost:${PORT}`);
});
