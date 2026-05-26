"""
scripts/ingest_chroma.py
------------------------
Read the validated knowledge chunks, embed them with the configured
Qwen3-Embedding model, and upsert everything into a persistent ChromaDB
collection.

Usage:
    python scripts/ingest_chroma.py
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path

# ── Ensure repo root is on sys.path so `from src…` works ─────────────────────
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from src.config import CHUNKS_PATH, CHROMA_COLLECTION_NAME, CHROMA_PERSIST_DIR
from src.embedding_model import embed_texts
from src.chroma_store import add_chunks, collection_count


def main() -> None:
    # ── 1. Load chunks ────────────────────────────────────────────────────────
    chunks_path = Path(CHUNKS_PATH)
    if not chunks_path.exists():
        print(f"[ERROR] Chunks file not found: {chunks_path}", file=sys.stderr)
        sys.exit(1)

    raw = chunks_path.read_text(encoding="utf-8").strip()

    # Support both JSON array and JSONL
    if raw.startswith("["):
        chunks: list[dict] = json.loads(raw)
    else:
        chunks = [json.loads(line) for line in raw.splitlines() if line.strip()]

    print(f"[ingest] Loaded {len(chunks)} chunk(s) from {chunks_path.name}")

    # ── 2. Light validation ───────────────────────────────────────────────────
    required = {"id", "content", "metadata"}
    for i, c in enumerate(chunks):
        missing = required - c.keys()
        if missing:
            print(f"[ERROR] Chunk {i} missing keys: {missing}", file=sys.stderr)
            sys.exit(1)
        if not c["content"]:
            print(f"[ERROR] Chunk {i} ({c['id']}) has empty content", file=sys.stderr)
            sys.exit(1)

    # ── 3. Embed ──────────────────────────────────────────────────────────────
    texts = [c["content"] for c in chunks]
    print(f"[ingest] Embedding {len(texts)} chunk(s) …")

    t0 = time.perf_counter()
    embeddings = embed_texts(texts)
    elapsed = time.perf_counter() - t0

    print(f"[ingest] Embedding complete — {elapsed:.1f}s  "
          f"(dim={len(embeddings[0])})")

    # ── 4. Upsert into ChromaDB ───────────────────────────────────────────────
    ids = [c["id"] for c in chunks]
    documents = texts
    metadatas = []
    for c in chunks:
        meta = dict(c["metadata"])
        # ChromaDB metadata values must be str | int | float | bool
        for k, v in list(meta.items()):
            if isinstance(v, (list, dict)):
                meta[k] = json.dumps(v, ensure_ascii=False)
        metadatas.append(meta)

    add_chunks(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
        embeddings=embeddings,
    )

    # ── 5. Summary ────────────────────────────────────────────────────────────
    total = collection_count()
    print()
    print("=" * 60)
    print("  SkinX Phase 3 — ChromaDB Ingestion Complete")
    print("=" * 60)
    print(f"  Chunks ingested    : {len(chunks)}")
    print(f"  Collection name    : {CHROMA_COLLECTION_NAME}")
    print(f"  Persist directory  : {CHROMA_PERSIST_DIR}")
    print(f"  Total in collection: {total}")
    print(f"  Embedding time     : {elapsed:.1f}s")
    print(f"  Embedding dim      : {len(embeddings[0])}")
    print("=" * 60)
    print()


if __name__ == "__main__":
    main()
