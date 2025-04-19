from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class ContextObjectCreate(BaseModel):
    # Model Context Protocol: minimal fields (expand per MCP spec)
    type: str = Field(..., description="Type of context object")
    data: Dict[str, Any] = Field(..., description="Contextual data")
    description: Optional[str] = Field(None, description="Description of the context object")

class ContextObject(ContextObjectCreate):
    id: str = Field(..., description="Unique context object ID")
