from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from typing import List
from mcp_server.schemas import ContextObject, ContextObjectCreate
import asyncio

app = FastAPI(title="Model Context Protocol (MCP) Server")

# In-memory storage for context objects (replace with DB in production)
context_store = {}

@app.get("/")
async def root():
    return {
        "service": "Model Context Protocol Server",
        "status": "ok",
        "mcp_version": "1.0"
    }

@app.post("/context", response_model=ContextObject)
def create_context_object(obj: ContextObjectCreate):
    # Generate a simple unique ID (replace with UUID in prod)
    obj_id = str(len(context_store) + 1)
    context_obj = ContextObject(id=obj_id, **obj.dict())
    context_store[obj_id] = context_obj
    return context_obj

@app.get("/context/{obj_id}", response_model=ContextObject)
def get_context_object(obj_id: str):
    obj = context_store.get(obj_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Context object not found")
    return obj

@app.get("/context", response_model=List[ContextObject])
def list_context_objects():
    return list(context_store.values())

@app.delete("/context/{obj_id}", response_model=dict)
def delete_context_object(obj_id: str):
    if obj_id not in context_store:
        raise HTTPException(status_code=404, detail="Context object not found")
    del context_store[obj_id]
    return {"deleted": obj_id}

@app.get("/events")
@app.get("/events/")
@app.get("/v1/events")
@app.get("/v1/events/")
@app.get("/mcp/v1/events")
@app.get("/mcp/v1/events/")
async def events(request: Request):
    print("SSE endpoint hit:", request.url.path)
    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
            yield "data: heartbeat\n\n"
            await asyncio.sleep(10)
    return StreamingResponse(event_generator(), media_type="text/event-stream")
