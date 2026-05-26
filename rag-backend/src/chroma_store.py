"""
src/chroma_store.py
-------------------
Persistent ChromaDB collection wrapper for SkinX knowledge chunks.

Responsibilities:
  • Create or load a named collection with cosine distance.
  • Add documents with pre-computed embeddings and metadata.
  • Query the collection using an embedding vector.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

import chromadb
from chromadb.config import Settings

from src.config import CHROMA_COLLECTION_NAME, CHROMA_PERSIST_DIR

# ---------------------------------------------------------------------------
# Client & collection singletons
# ---------------------------------------------------------------------------

@lru_cache(maxsize=1)
def _get_client() -> chromadb.ClientAPI:
    """Return a persistent ChromaDB client (creates the dir if needed)."""
    persist_dir = Path(CHROMA_PERSIST_DIR)
    persist_dir.mkdir(parents=True, exist_ok=True)
    print(f"[chroma] Persist directory: {persist_dir}", flush=True)
    client = chromadb.PersistentClient(
        path=str(persist_dir),
        settings=Settings(anonymized_telemetry=False),
    )
    return client


@lru_cache(maxsize=1)
def get_collection() -> chromadb.Collection:
    """Get or create the SkinX knowledge collection."""
    client = _get_client()
    collection = client.get_or_create_collection(
        name=CHROMA_COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )
    print(
        f"[chroma] Collection '{CHROMA_COLLECTION_NAME}' — "
        f"{collection.count()} document(s)",
        flush=True,
    )
    return collection


# ---------------------------------------------------------------------------
# Write operations
# ---------------------------------------------------------------------------

def add_chunks(
    ids: list[str],
    documents: list[str],
    metadatas: list[dict[str, Any]],
    embeddings: list[list[float]],
) -> None:
    """
    Upsert chunks into the ChromaDB collection.

    Parameters
    ----------
    ids         Unique chunk IDs (e.g. "skinx_melanoma_001").
    documents   Raw text content for each chunk.
    metadatas   Metadata dicts (source, category, section, …).
    embeddings  Pre-computed embedding vectors.
    """
    collection = get_collection()
    collection.upsert(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
        embeddings=embeddings,
    )
    print(f"[chroma] Upserted {len(ids)} chunk(s).", flush=True)


# ---------------------------------------------------------------------------
# Read / query operations
# ---------------------------------------------------------------------------

def query(
    query_embedding: list[float],
    n_results: int = 5,
) -> dict[str, Any]:
    """
    Query the collection with a pre-computed embedding vector.

    Returns the raw ChromaDB result dict with keys:
        ids, documents, metadatas, distances
    Each value is a list-of-lists (one inner list per query — we always
    send a single query here).
    """
    collection = get_collection()
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        include=["documents", "metadatas", "distances"],
    )
    return results


def collection_count() -> int:
    """Return the current number of documents in the collection."""
    return get_collection().count()
