# Model Context Protocol (MCP) Server – Python/FastAPI (Local Storage)

## Overview
Implements the core endpoints of the Model Context Protocol (https://modelcontextprotocol.io) using FastAPI and in-memory storage. Modular, <200 lines/file, ready for extension.

## Usage

```bash
pip install -r requirements.txt
uvicorn mcp_server.main:app --reload
```

## Endpoints
- `POST /context` – Create a context object
- `GET /context/{id}` – Retrieve a context object
- `GET /context` – List all context objects
- `DELETE /context/{id}` – Delete a context object

## Notes
- In-memory storage: data resets on restart
- All code under 200 lines/file
- Spec-compliant with [modelcontextprotocol.io](https://modelcontextprotocol.io)

## Extending
- Add more MCP endpoints or swap storage for a database as needed.
