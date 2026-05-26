"""
src/api.py
----------
FastAPI server for the SkinX RAG backend.

Endpoints:
    GET  /health  → {"status": "ok"}
    POST /ask     → RAG answer from rag.py
"""

from __future__ import annotations

import sys
from pathlib import Path

# ── Ensure repo root is on sys.path so `from src…` works ─────────────────────
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.config import RAG_PORT
from src.rag import ask as run_rag

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="SkinX RAG Backend",
    description="Dermatology knowledge retrieval and AI-assisted answers.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request model ─────────────────────────────────────────────────────────────
class AskRequest(BaseModel):
    question: str | None = Field(default=None)
    message: str | None = Field(default=None)
    query: str | None = Field(default=None)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/ask")
async def ask(body: AskRequest):
    # Accept question from any of the three field names
    question = body.question or body.message or body.query

    if not question or not question.strip():
        return {
            "answer": "Please provide a question.",
            "sources": [],
        }

    result = run_rag(question.strip())
    return result


# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api:app", host="127.0.0.1", port=RAG_PORT, reload=True)
