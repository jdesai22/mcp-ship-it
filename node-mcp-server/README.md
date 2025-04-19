# node-mcp-server

Minimal Node.js MCP server implementing the official Model Context Protocol (https://modelcontextprotocol.io) for Windsurf troubleshooting.

## Endpoints

- `GET /` : MCP-compliant ServiceStatus
- `POST /context` : Upload a MCP ContextDocument (see spec)
- `GET /context` : List all ContextDocuments
- `GET /events` : SSE EventStream (heartbeat)

## ContextDocument Example
