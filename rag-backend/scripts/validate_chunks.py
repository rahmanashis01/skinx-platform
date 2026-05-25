"""
scripts/validate_chunks.py
--------------------------
Phase 2 – Validate the generated RAG artefacts before embeddings.

Checks:
  1.  data/system_prompt.md    exists and is non-empty
  2.  data/chunks/skinx_chunks.json (or .jsonl) exists
  3.  Every chunk is valid JSON
  4.  Every chunk has: id, content, metadata, metadata.source,
      metadata.category, metadata.section, metadata.chunk_index,
      metadata.content_type
  5.  No chunk has a 'vector' field
  6.  content is not empty
  7.  IDs are unique
  8.  Warns if content < 100 chars or > 5000 chars
  9.  Prints total count, categories, first 5 IDs
 10.  Prints PASS / FAIL summary

Usage:
    python scripts/validate_chunks.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parent.parent
SYSTEM_PROMPT_PATH = REPO_ROOT / "data" / "system_prompt.md"

# Support both .json (pretty array) and .jsonl (one-per-line)
CHUNKS_JSON  = REPO_ROOT / "data" / "chunks" / "skinx_chunks.json"
CHUNKS_JSONL = REPO_ROOT / "data" / "chunks" / "skinx_chunks.jsonl"

REQUIRED_CHUNK_KEYS   = {"id", "content", "metadata"}
REQUIRED_META_KEYS    = {"source", "category", "section", "chunk_index", "content_type"}
CONTENT_WARN_MIN      = 100
CONTENT_WARN_MAX      = 5_000

# ── Helpers ───────────────────────────────────────────────────────────────────

def _rule(label: str, ok: bool, detail: str = "") -> bool:
    symbol = "  ✓" if ok else "  ✗"
    line = f"{symbol}  {label}"
    if detail:
        line += f"  →  {detail}"
    print(line)
    return ok


def _warn(msg: str) -> None:
    print(f"  ⚠  {msg}")


def _separator(title: str = "") -> None:
    if title:
        pad = (58 - len(title) - 2) // 2
        print(f"\n{'─' * pad} {title} {'─' * pad}")
    else:
        print("─" * 60)


# ── Loader ────────────────────────────────────────────────────────────────────

def _load_chunks(path: Path) -> tuple[list[dict], list[str]]:
    """
    Load chunks from either a JSON array file or a JSONL file.
    Returns (chunks, parse_errors).
    """
    raw = path.read_text(encoding="utf-8").strip()
    errors: list[str] = []

    # ── JSON array format ─────────────────────────────────────────────────────
    if raw.startswith("["):
        try:
            data = json.loads(raw)
            if not isinstance(data, list):
                errors.append("Root element is not a JSON array.")
                return [], errors
            return data, errors
        except json.JSONDecodeError as exc:
            errors.append(f"JSON parse error: {exc}")
            return [], errors

    # ── JSONL format (one object per line) ────────────────────────────────────
    chunks: list[dict] = []
    for lineno, line in enumerate(raw.splitlines(), start=1):
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
            chunks.append(obj)
        except json.JSONDecodeError as exc:
            errors.append(f"Line {lineno}: {exc}")
    return chunks, errors


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    failures: list[str] = []
    warnings: list[str] = []

    print()
    print("=" * 60)
    print("  SkinX Phase 2 — Validation Report")
    print("=" * 60)

    # ── 1. system_prompt.md ───────────────────────────────────────────────────
    _separator("System Prompt")

    sp_ok = SYSTEM_PROMPT_PATH.exists()
    _rule("system_prompt.md exists", sp_ok, str(SYSTEM_PROMPT_PATH) if sp_ok else "NOT FOUND")
    if not sp_ok:
        failures.append("system_prompt.md not found")
    else:
        sp_text = SYSTEM_PROMPT_PATH.read_text(encoding="utf-8")
        sp_chars = len(sp_text)
        sp_nonempty = sp_chars > 0
        _rule("system_prompt.md is non-empty", sp_nonempty, f"{sp_chars:,} characters")
        if not sp_nonempty:
            failures.append("system_prompt.md is empty")

    # ── 2. Locate chunks file ─────────────────────────────────────────────────
    _separator("Chunks File")

    chunks_path: Path | None = None
    if CHUNKS_JSON.exists():
        chunks_path = CHUNKS_JSON
    elif CHUNKS_JSONL.exists():
        chunks_path = CHUNKS_JSONL

    found = chunks_path is not None
    _rule(
        "chunks file exists",
        found,
        str(chunks_path) if found else f"NOT FOUND  (checked {CHUNKS_JSON.name} and {CHUNKS_JSONL.name})",
    )
    if not found:
        failures.append("chunks file not found")

    # ── 3. Parse + schema validation ──────────────────────────────────────────
    chunks: list[dict] = []
    if found:
        _separator("JSON Validity")
        chunks, parse_errors = _load_chunks(chunks_path)  # type: ignore[arg-type]

        json_ok = len(parse_errors) == 0
        _rule("all chunks are valid JSON", json_ok, f"{len(parse_errors)} parse error(s)" if not json_ok else "")
        for err in parse_errors:
            _warn(err)
            failures.append(f"JSON parse: {err}")

        # ── 4–8. Per-chunk validation ─────────────────────────────────────────
        _separator("Schema Validation")

        seen_ids: set[str] = set()
        duplicate_ids: list[str] = []
        schema_errors: list[str] = []
        vector_hits: list[str] = []
        empty_content: list[str] = []
        short_content: list[str] = []
        long_content: list[str] = []

        for i, chunk in enumerate(chunks):
            label = chunk.get("id", f"chunk[{i}]")

            # Required top-level keys
            missing_keys = REQUIRED_CHUNK_KEYS - chunk.keys()
            if missing_keys:
                schema_errors.append(f"{label}: missing keys {missing_keys}")

            # Vector field
            if "vector" in chunk:
                vector_hits.append(label)

            # content checks
            content = chunk.get("content", "")
            if not content:
                empty_content.append(label)
            else:
                if len(content) < CONTENT_WARN_MIN:
                    short_content.append(f"{label} ({len(content)} chars)")
                if len(content) > CONTENT_WARN_MAX:
                    long_content.append(f"{label} ({len(content)} chars)")

            # metadata keys
            meta = chunk.get("metadata", {})
            if isinstance(meta, dict):
                missing_meta = REQUIRED_META_KEYS - meta.keys()
                if missing_meta:
                    schema_errors.append(f"{label}: metadata missing {missing_meta}")
            else:
                schema_errors.append(f"{label}: 'metadata' is not an object")

            # ID uniqueness
            cid = chunk.get("id")
            if cid is not None:
                if cid in seen_ids:
                    duplicate_ids.append(cid)
                else:
                    seen_ids.add(cid)

        schema_ok = len(schema_errors) == 0
        _rule("all required fields present", schema_ok,
              f"{len(schema_errors)} error(s)" if not schema_ok else f"{len(chunks)} chunks checked")
        for err in schema_errors:
            _warn(err)
            failures.append(f"Schema: {err}")

        no_vectors = len(vector_hits) == 0
        _rule("no vector fields found", no_vectors,
              f"found in: {', '.join(vector_hits)}" if not no_vectors else "")
        if not no_vectors:
            failures.append(f"Vector fields found in: {vector_hits}")

        no_empty = len(empty_content) == 0
        _rule("no empty content fields", no_empty,
              f"empty in: {', '.join(empty_content)}" if not no_empty else "")
        if not no_empty:
            failures.append(f"Empty content: {empty_content}")

        ids_unique = len(duplicate_ids) == 0
        _rule("all chunk IDs are unique", ids_unique,
              f"duplicates: {', '.join(duplicate_ids)}" if not ids_unique else "")
        if not ids_unique:
            failures.append(f"Duplicate IDs: {duplicate_ids}")

        # Warnings (do not fail)
        for s in short_content:
            msg = f"Short content (<{CONTENT_WARN_MIN} chars): {s}"
            _warn(msg)
            warnings.append(msg)
        for s in long_content:
            msg = f"Long content (>{CONTENT_WARN_MAX} chars): {s}"
            _warn(msg)
            warnings.append(msg)

        # ── Summary stats ─────────────────────────────────────────────────────
        _separator("Summary")

        print(f"  Total chunks   : {len(chunks)}")

        categories: dict[str, int] = {}
        for c in chunks:
            cat = c.get("metadata", {}).get("category", "Unknown")
            categories[cat] = categories.get(cat, 0) + 1
        print(f"  Categories     : {len(categories)}")
        for cat, count in sorted(categories.items()):
            print(f"      • {cat}: {count} chunk(s)")

        first_ids = [c.get("id", "?") for c in chunks[:5]]
        print(f"  First 5 IDs    :")
        for cid in first_ids:
            print(f"      - {cid}")

    # ── Final verdict ─────────────────────────────────────────────────────────
    _separator("Result")

    if warnings:
        print(f"  Warnings : {len(warnings)}")
        for w in warnings:
            print(f"    ⚠  {w}")

    if not failures:
        print()
        print("  ██████████████████████████████")
        print("  ██                          ██")
        print("  ██        ✓  PASS           ██")
        print("  ██                          ██")
        print("  ██████████████████████████████")
        print()
        sys.exit(0)
    else:
        print(f"\n  Failures ({len(failures)}):")
        for f in failures:
            print(f"    ✗  {f}")
        print()
        print("  ██████████████████████████████")
        print("  ██                          ██")
        print("  ██        ✗  FAIL           ██")
        print("  ██                          ██")
        print("  ██████████████████████████████")
        print()
        sys.exit(1)


if __name__ == "__main__":
    main()
