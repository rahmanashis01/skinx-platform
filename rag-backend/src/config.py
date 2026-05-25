"""
src/config.py
-------------
Centralised configuration for the SkinX RAG backend.

All values can be overridden via environment variables or a `.env` file
located at the repository root.
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# ── Load .env from repo root ─────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(REPO_ROOT / ".env", override=True)

# ── Paths ─────────────────────────────────────────────────────────────────────
CHUNKS_PATH: Path = Path(
    os.getenv("CHUNKS_PATH", str(REPO_ROOT / "data" / "chunks" / "skinx_chunks.json"))
)
SYSTEM_PROMPT_PATH: Path = Path(
    os.getenv("SYSTEM_PROMPT_PATH", str(REPO_ROOT / "data" / "system_prompt.md"))
)

# ── ChromaDB ──────────────────────────────────────────────────────────────────
CHROMA_PERSIST_DIR: str = os.getenv(
    "CHROMA_PERSIST_DIR", str(REPO_ROOT / "data" / "chroma_db")
)
CHROMA_COLLECTION_NAME: str = os.getenv("CHROMA_COLLECTION_NAME", "skinx_knowledge")

# ── Embedding model ──────────────────────────────────────────────────────────
#   Default: Qwen/Qwen3-Embedding-8B
#   Lighter alternatives (set via env):
#     EMBEDDING_MODEL_NAME=Qwen/Qwen3-Embedding-4B
#     EMBEDDING_MODEL_NAME=Qwen/Qwen3-Embedding-0.6B   (1024-dim)
EMBEDDING_MODEL_NAME: str = os.getenv(
    "EMBEDDING_MODEL_NAME", "Qwen/Qwen3-Embedding-8B"
)

# ── Retrieval ─────────────────────────────────────────────────────────────────
TOP_K: int = int(os.getenv("TOP_K", "5"))

# ── RAG API (for later phases) ────────────────────────────────────────────────
RAG_PORT: int = int(os.getenv("RAG_PORT", "8000"))
OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "")
OPENROUTER_FALLBACK_MODEL: str = os.getenv(
    "OPENROUTER_FALLBACK_MODEL", "google/gemma-4-26b-a4b-it-20260403:free"
)
MAX_CONTEXT_CHARS: int = int(os.getenv("MAX_CONTEXT_CHARS", "6000"))

# ── Debug mode ────────────────────────────────────────────────────────────────
#   When true, /ask responses include: model name, token usage, distances, IDs.
#   When false, /ask returns only clean production JSON.
DEBUG_RAG: bool = os.getenv("DEBUG_RAG", "false").lower() in ("true", "1", "yes")
