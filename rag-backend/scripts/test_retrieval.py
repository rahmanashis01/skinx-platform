"""
scripts/test_retrieval.py
-------------------------
Smoke-test retrieval from the ChromaDB collection using sample queries.

Usage:
    python scripts/test_retrieval.py
"""

from __future__ import annotations

import sys
from pathlib import Path

# ── Ensure repo root is on sys.path ──────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from src.config import TOP_K
from src.embedding_model import embed_query
from src.chroma_store import query, collection_count

# ── Test queries ──────────────────────────────────────────────────────────────
TEST_QUERIES: list[str] = [
    "What is melanoma?",
    "What is ringworm?",
    "What is scabies?",
    "What should I not do for steroid damaged face?",
]

PREVIEW_CHARS = 120  # max chars of content to show per result


def _separator(char: str = "─", width: int = 70) -> str:
    return char * width


def main() -> None:
    total_docs = collection_count()
    print()
    print("=" * 70)
    print("  SkinX Phase 3 — Retrieval Test")
    print(f"  Collection contains {total_docs} document(s)  |  TOP_K={TOP_K}")
    print("=" * 70)

    if total_docs == 0:
        print("\n  ⚠  Collection is empty — run ingest_chroma.py first.\n")
        sys.exit(1)

    for q in TEST_QUERIES:
        print(f"\n{_separator()}")
        print(f"  QUERY: {q}")
        print(_separator())

        q_emb = embed_query(q)
        results = query(q_emb, n_results=TOP_K)

        ids = results["ids"][0]
        docs = results["documents"][0]
        metas = results["metadatas"][0]
        dists = results["distances"][0]

        for rank, (cid, doc, meta, dist) in enumerate(
            zip(ids, docs, metas, dists), start=1
        ):
            preview = doc[:PREVIEW_CHARS].replace("\n", " ")
            if len(doc) > PREVIEW_CHARS:
                preview += "…"
            print(
                f"  #{rank}  id={cid}\n"
                f"       section  = {meta.get('section', '?')}\n"
                f"       category = {meta.get('category', '?')}\n"
                f"       distance = {dist:.4f}\n"
                f"       preview  = {preview}"
            )

    print(f"\n{_separator('=')}")
    print("  ✓  Retrieval test complete")
    print(_separator("="))
    print()


if __name__ == "__main__":
    main()
