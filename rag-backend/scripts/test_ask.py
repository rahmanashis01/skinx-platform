"""
scripts/test_ask.py
-------------------
⚠️  TEST SCRIPT ONLY — NOT API OUTPUT.
This prints debug information to the terminal for development verification.
The actual /ask API endpoint returns clean JSON controlled by DEBUG_RAG.

End-to-end smoke test for the full RAG pipeline:
  question → embed → retrieve → OpenRouter LLM → answer

Usage:
    python scripts/test_ask.py
"""

from __future__ import annotations

import json
import os
import sys
import textwrap
from pathlib import Path

# ── Ensure repo root is on sys.path ──────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

# Force DEBUG_RAG=true for test script so we get full details
os.environ["DEBUG_RAG"] = "true"

from src.rag import ask

# ── Test queries ──────────────────────────────────────────────────────────────
TEST_QUERIES: list[dict[str, str]] = [
    {
        "question": "What is melanoma?",
        "expect": "Should answer using retrieved melanoma context. NO Critical Alert.",
    },
    {
        "question": "What is ringworm?",
        "expect": "Should answer using retrieved Tinea Corporis context.",
    },
    {
        "question": "What should I not do for steroid damaged face?",
        "expect": "Should answer using TSDF context with don'ts.",
    },
    {
        "question": "Can you prescribe cream for my rash?",
        "expect": "Should refuse — treatment recommendation is prohibited.",
    },
    {
        "question": "Who won the World Cup?",
        "expect": "Should refuse — out-of-scope (not dermatology).",
    },
]

LINE = "─" * 70


def main() -> None:
    print()
    print("=" * 70)
    print("  SkinX Phase 4 — End-to-End RAG Test")
    print("  ⚠️  TEST-ONLY OUTPUT (not API response format)")
    print("=" * 70)

    for i, test in enumerate(TEST_QUERIES, start=1):
        question = test["question"]
        expect = test["expect"]

        print(f"\n{LINE}")
        print(f"  Q{i}: {question}")
        print(f"  Expected: {expect}")
        print(LINE)

        result = ask(question)

        if "answer" in result:
            # Print answer
            answer = result["answer"]
            wrapped = textwrap.fill(answer, width=72, initial_indent="  ",
                                    subsequent_indent="  ")
            print(f"\n  ✓ ANSWER:\n{wrapped}\n")

            # Print sources
            sources = result.get("sources", [])
            if sources:
                print(f"  Sources:")
                for s in sources[:3]:
                    print(f"    • {s['section']} [{s['category']}]")
            else:
                print("  Sources: (none)")
        else:
            print(f"\n  ✗ FAILED: {result.get('code', 'UNKNOWN')}")
            print(f"    {result.get('error', 'No error message')}")

    print(f"\n{'=' * 70}")
    print("  ✓ Test complete")
    print(f"{'=' * 70}\n")


if __name__ == "__main__":
    main()
