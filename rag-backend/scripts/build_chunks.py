"""
scripts/build_chunks.py
-----------------------
Phase 1 – Convert SkinXRag.docx into:
  1.  data/system_prompt.md          – system guardrails / identity / clinical rules
  2.  data/chunks/skinx_chunks.jsonl – dermatology knowledge chunks (one JSON per line)

Usage:
    python scripts/build_chunks.py

Requirements:
    pip install python-docx
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from docx import Document  # python-docx

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
REPO_ROOT = Path(__file__).resolve().parent.parent
DOCX_PATH = REPO_ROOT / "data" / "source_docs" / "SkinXRag.docx"
SYSTEM_PROMPT_PATH = REPO_ROOT / "data" / "system_prompt.md"
CHUNKS_PATH = REPO_ROOT / "data" / "chunks" / "skinx_chunks.json"

# ---------------------------------------------------------------------------
# Paragraph indices that belong to the SYSTEM GUARDRAIL zone.
#
# Determined by inspecting the document:
#   [0]  "System Guardrail:"                         ← guardrail header
#   [1]  "Operational Guidelines …"                  ← guardrail section
#   ...
#   [40] Experimental Research Disclosure            ← last guardrail bullet
#   [42] "System Identity"                           ← guardrail section
#   [43–48] Core Identity, Diagnostic Limitations,  ← guardrail paragraphs
#           Operational Scope, Critical Alert…
#
#   [50–68]  "Clinical Evaluation Rules" and sub-sections are ALSO guardrail
#            (they describe how SkinX evaluates images, not disease education).
#
#   [70]  "Skin Cancers"                             ← first knowledge section
#   …
#   [219] last knowledge paragraph
# ---------------------------------------------------------------------------
GUARDRAIL_END_INDEX = 68   # inclusive – everything up to and including this is system content
KNOWLEDGE_START_INDEX = 70  # first knowledge paragraph

# ---------------------------------------------------------------------------
# Category mapping: paragraph text → category label
# Used to assign metadata.category when we encounter a category header.
# ---------------------------------------------------------------------------
CATEGORY_HEADERS: dict[str, str] = {
    "skin cancers": "Skin Cancers",
    "fungal infections": "Fungal Infections",
    "parasitic infections": "Parasitic Infections",
    # Combined header that appears literally in the docx
    "fungal and parasitic infections": "Fungal Infections",
    "inflammatory and autoimmune conditions": "Inflammatory and Autoimmune Conditions",
    "pigmentation and cosmetic-induced conditions": "Pigmentation and Cosmetic-Induced Conditions",
    "viral infections": "Viral Infections",
    "longitudinal tracking and comparative evaluation": "Longitudinal Tracking and Comparative Evaluation",
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _normalise(text: str) -> str:
    """Strip and collapse internal whitespace."""
    return re.sub(r"\s+", " ", text.strip())


def _slug(text: str) -> str:
    """Create a filesystem/ID-safe slug from a heading string."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "_", text)
    return text.strip("_")


def _split_into_sections(paras: list[str]) -> list[dict]:
    """
    Walk knowledge paragraphs and group them into per-disease sections.

    A new section is started whenever we detect a 'disease/topic header' –
    identified as a short paragraph (≤ 12 words) that is NOT a known
    sub-question prompt (Why / How / What not to do…) and NOT a category
    header.
    """
    SUB_PROMPTS = {
        "why does this disease happen?",
        "how to prevent this?",
        "what not to do for this disease?",
        "what is this disease?",
    }

    sections: list[dict] = []
    current_category = "General"
    current_section: str | None = None
    current_lines: list[str] = []

    def flush() -> None:
        if current_section and current_lines:
            sections.append(
                {
                    "section": current_section,
                    "category": current_category,
                    "lines": list(current_lines),
                }
            )

    for raw in paras:
        text = _normalise(raw)
        if not text:
            continue

        lower = text.lower()

        # ── Category header ──────────────────────────────────────────────
        # Must flush the open section FIRST, then switch category, so the
        # flushed section retains the old (correct) category label.
        if lower in CATEGORY_HEADERS:
            flush()
            current_section = None
            current_lines = []
            current_category = CATEGORY_HEADERS[lower]
            continue

        # ── Sub-question prompts fold into the current section ────────────
        if lower.rstrip("?") + "?" in SUB_PROMPTS or lower in SUB_PROMPTS:
            if current_section:
                current_lines.append(text)
            continue

        # ── Detect a new disease/topic heading ───────────────────────────
        word_count = len(text.split())
        looks_like_header = (
            word_count <= 12
            and not text.endswith(".")
            and not text.endswith(",")
            and text[0].isupper()
        )

        if looks_like_header:
            flush()
            current_section = text
            current_lines = [text]   # heading is first line of the chunk
        else:
            if current_section is None:
                # Safety net: assign to a catch-all section
                current_section = "General Information"
                current_lines = []
            current_lines.append(text)

    flush()
    return sections


def _chunk_section(section: dict, chunk_index: int, category_slug_counters: dict) -> list[dict]:
    """
    Convert one section dict into one or more JSONL chunk dicts.

    Chunks are kept at 300–700 words where possible; very long sections
    are split at blank-line boundaries to preserve readability.
    """
    section_name = section["section"]
    category = section["category"]
    lines = section["lines"]

    # Build full text
    full_text = "\n".join(lines)

    # Split into sub-chunks only if very long (> ~700 words)
    MAX_WORDS = 700
    words = full_text.split()
    chunks_text: list[str] = []

    if len(words) <= MAX_WORDS:
        chunks_text = [full_text]
    else:
        # Split on double-newline paragraph boundaries
        paragraphs = re.split(r"\n{2,}", full_text)
        current_chunk_paras: list[str] = []
        current_wc = 0
        for para in paragraphs:
            para_wc = len(para.split())
            if current_wc + para_wc > MAX_WORDS and current_chunk_paras:
                chunks_text.append("\n\n".join(current_chunk_paras))
                current_chunk_paras = [para]
                current_wc = para_wc
            else:
                current_chunk_paras.append(para)
                current_wc += para_wc
        if current_chunk_paras:
            chunks_text.append("\n\n".join(current_chunk_paras))

    # Generate stable IDs
    cat_slug = _slug(category)
    sec_slug = _slug(section_name)
    base_id = f"skinx_{sec_slug}"

    chunk_dicts: list[dict] = []
    for sub_idx, text in enumerate(chunks_text, start=1):
        suffix = f"_{sub_idx:03d}" if len(chunks_text) > 1 else f"_{chunk_index:03d}"
        chunk_id = f"{base_id}{suffix}"

        chunk_dicts.append(
            {
                "id": chunk_id,
                "content": text,
                "metadata": {
                    "source": "SkinXRag.docx",
                    "category": category,
                    "section": section_name,
                    "chunk_index": chunk_index,
                    "content_type": "knowledge",
                },
            }
        )

    return chunk_dicts


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    if not DOCX_PATH.exists():
        print(f"[ERROR] Source document not found: {DOCX_PATH}", file=sys.stderr)
        sys.exit(1)

    doc = Document(str(DOCX_PATH))
    all_paras = [p.text for p in doc.paragraphs]

    # ── 1. Collect system guardrail paragraphs ────────────────────────────
    guardrail_paras: list[str] = []
    for i, text in enumerate(all_paras):
        if i > GUARDRAIL_END_INDEX:
            break
        stripped = _normalise(text)
        if stripped:
            guardrail_paras.append(stripped)

    # ── 2. Collect knowledge paragraphs ──────────────────────────────────
    knowledge_paras: list[str] = []
    for i, text in enumerate(all_paras):
        if i < KNOWLEDGE_START_INDEX:
            continue
        stripped = _normalise(text)
        if stripped:
            knowledge_paras.append(stripped)

    # ── 3. Write system_prompt.md ─────────────────────────────────────────
    SYSTEM_PROMPT_PATH.parent.mkdir(parents=True, exist_ok=True)

    system_md_lines = [
        "# SkinX System Prompt",
        "",
        "> **Purpose**: This file contains the complete system guardrails, assistant identity, ",
        "> operational guidelines, and clinical evaluation rules for the SkinX AI assistant.",
        "> It is loaded at the start of every LLM call and is NOT embedded as a RAG knowledge chunk.",
        "",
        "---",
        "",
        "## Operational Guidelines (Behavior, Data Handling, and Transparency)",
        "",
    ]

    # Split guardrail content into sections for readability
    in_identity = False
    in_eval = False
    in_boundaries = False

    for para in guardrail_paras:
        lower = para.lower()
        if lower.startswith("system guardrail"):
            continue  # Skip the bare header line
        if lower.startswith("system identity"):
            system_md_lines += ["", "---", "", "## System Identity", ""]
            in_identity = True
            in_eval = False
            in_boundaries = False
            continue
        if lower.startswith("operational scope"):
            system_md_lines += ["", "### Operational Scope", ""]
            continue
        if lower.startswith("clinical evaluation rules"):
            system_md_lines += ["", "---", "", "## Clinical Evaluation Rules", ""]
            in_eval = True
            in_identity = False
            in_boundaries = False
            continue
        if lower.startswith("strict medical boundaries"):
            system_md_lines += ["", "---", "", "## Strict Medical Boundaries (Prohibitions)", ""]
            in_boundaries = True
            in_eval = False
            in_identity = False
            continue

        # Sub-headings inside Clinical Evaluation Rules
        eval_subheadings = [
            "evaluating shape and asymmetry",
            "evaluating border irregularity",
            "evaluating color variations",
            "evaluating size and diameter",
            "evaluating changes over time",
            "evaluating surface texture",
            "evaluating inflammation and swelling",
            "evaluating elevation and fluid content",
            "evaluating distribution and spread",
        ]
        if any(lower.startswith(h) for h in eval_subheadings):
            system_md_lines += ["", f"### {para}", ""]
            continue

        system_md_lines.append(f"- {para}")

    SYSTEM_PROMPT_PATH.write_text("\n".join(system_md_lines), encoding="utf-8")

    # ── 4. Parse knowledge sections ───────────────────────────────────────
    sections = _split_into_sections(knowledge_paras)

    # ── 5. Build JSONL chunks ─────────────────────────────────────────────
    CHUNKS_PATH.parent.mkdir(parents=True, exist_ok=True)

    all_chunks: list[dict] = []
    category_slug_counters: dict[str, int] = {}
    chunk_index = 1

    for section in sections:
        new_chunks = _chunk_section(section, chunk_index, category_slug_counters)
        all_chunks.extend(new_chunks)
        chunk_index += len(new_chunks)

    with CHUNKS_PATH.open("w", encoding="utf-8") as f:
        json.dump(all_chunks, f, ensure_ascii=False, indent=2)
        f.write("\n")

    # ── 6. CLI summary ────────────────────────────────────────────────────
    system_char_count = len(SYSTEM_PROMPT_PATH.read_text(encoding="utf-8"))
    categories = sorted({c["metadata"]["category"] for c in all_chunks})

    print()
    print("=" * 60)
    print("  SkinX Phase 1 — Chunk Build Complete")
    print("=" * 60)
    print(f"  System prompt characters : {system_char_count:,}")
    print(f"  Knowledge chunks created : {len(all_chunks)}")
    print()
    print("  Detected categories:")
    for cat in categories:
        count = sum(1 for c in all_chunks if c["metadata"]["category"] == cat)
        print(f"    • {cat} ({count} chunks)")
    print()
    print("  Output files:")
    print(f"    • {SYSTEM_PROMPT_PATH}")
    print(f"    • {CHUNKS_PATH}")
    print("=" * 60)
    print()


if __name__ == "__main__":
    main()
