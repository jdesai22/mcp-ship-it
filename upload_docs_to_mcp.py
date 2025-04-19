import os
import requests
from datetime import datetime

MCP_URL = "http://localhost:3000/context"
DOCS_DIR = "technical-docs"

def get_format(filename):
    ext = filename.split('.')[-1].lower()
    if ext in ["md", "markdown"]:
        return "text/markdown"
    elif ext in ["txt"]:
        return "text/plain"
    elif ext in ["rst"]:
        return "text/x-rst"
    return "application/octet-stream"

for root, _, files in os.walk(DOCS_DIR):
    for fname in files:
        path = os.path.join(root, fname)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        payload = {
            "id": fname,
            "type": get_format(fname),
            "content": content,
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        resp = requests.post(MCP_URL, json=payload)
        if resp.status_code in (200, 201):
            print(f"Uploaded: {fname}")
        else:
            print(f"Failed: {fname} ({resp.status_code}) - {resp.text}")