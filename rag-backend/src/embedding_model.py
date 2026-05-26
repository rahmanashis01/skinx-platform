"""
src/embedding_model.py
----------------------
Loads a Qwen3-Embedding model via sentence-transformers and exposes
convenience functions for embedding documents and queries.

Default model : Qwen/Qwen3-Embedding-8B
Override via  : EMBEDDING_MODEL_NAME env var
Lighter opts  : Qwen/Qwen3-Embedding-4B, Qwen/Qwen3-Embedding-0.6B (1024-d)

All embeddings are L2-normalised by default so that cosine similarity
equals the inner product.
"""

from __future__ import annotations

import sys
from functools import lru_cache

from sentence_transformers import SentenceTransformer

from src.config import EMBEDDING_MODEL_NAME

# ---------------------------------------------------------------------------
# Model singleton
# ---------------------------------------------------------------------------

@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    """Load and cache the embedding model (downloads on first run)."""
    print(f"[embedding] Loading model: {EMBEDDING_MODEL_NAME} …", flush=True)
    try:
        model = SentenceTransformer(
            EMBEDDING_MODEL_NAME,
            trust_remote_code=True,
        )
    except Exception as exc:
        print(
            f"[embedding] Failed to load {EMBEDDING_MODEL_NAME}: {exc}",
            file=sys.stderr,
        )
        raise
    # get_embedding_dimension() is the new name (sentence-transformers ≥3.x)
    dim = (model.get_embedding_dimension()
           if hasattr(model, "get_embedding_dimension")
           else model.get_sentence_embedding_dimension())
    print(f"[embedding] Model loaded — dimension={dim}", flush=True)
    return model


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------

def embed_texts(texts: list[str], *, batch_size: int = 32) -> list[list[float]]:
    """
    Embed a list of document texts.

    Returns a list of float-lists (one per input text), L2-normalised.
    """
    model = get_embedding_model()
    embeddings = model.encode(
        texts,
        batch_size=batch_size,
        show_progress_bar=len(texts) > 5,
        normalize_embeddings=True,
    )
    # numpy ndarray → plain Python lists for ChromaDB compatibility
    return [emb.tolist() for emb in embeddings]


def embed_query(query: str) -> list[float]:
    """
    Embed a single user query.

    Returns a single float-list, L2-normalised.
    """
    model = get_embedding_model()
    embedding = model.encode(
        query,
        normalize_embeddings=True,
    )
    return embedding.tolist()
