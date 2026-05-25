"""
src/openrouter_client.py
------------------------
Thin wrapper around the OpenRouter chat-completions API.

Reads OPENROUTER_API_KEY, OPENROUTER_MODEL, and OPENROUTER_FALLBACK_MODEL
from config/.env.

If the primary model fails, automatically retries with the fallback model
(defaults to google/gemma-4-26b-a4b-it-20260403:free).
"""

from __future__ import annotations

import sys
from typing import Any

import requests

from src.config import OPENROUTER_API_KEY, OPENROUTER_MODEL, OPENROUTER_FALLBACK_MODEL

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# ── Safety checks ─────────────────────────────────────────────────────────────

def _check_config() -> None:
    """Abort early if the API key or model are missing."""
    if not OPENROUTER_API_KEY or OPENROUTER_API_KEY == "replace_with_key":
        print(
            "[openrouter] ERROR: OPENROUTER_API_KEY is not set.\n"
            "             Add it to your .env file.",
            file=sys.stderr,
        )
        raise RuntimeError("Missing OPENROUTER_API_KEY")

    if not OPENROUTER_MODEL or OPENROUTER_MODEL == "replace_with_openrouter_model":
        print(
            "[openrouter] ERROR: OPENROUTER_MODEL is not set.\n"
            "             Add it to your .env file.\n"
            "             Example: OPENROUTER_MODEL=google/gemini-2.5-flash",
            file=sys.stderr,
        )
        raise RuntimeError("Missing OPENROUTER_MODEL")


# ── Internal request helper ───────────────────────────────────────────────────

def _send_request(
    model: str,
    system_prompt: str,
    user_message: str,
    temperature: float,
    max_tokens: int,
) -> dict[str, Any]:
    """
    Fire a single chat-completion request for the given model.

    Returns the parsed result dict or raises on failure.
    """
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://skinx.app",
        "X-Title": "SkinX RAG Backend",
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    resp = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=60)
    resp.raise_for_status()
    data = resp.json()

    # ── Handle errors returned inside a 200 response ──────────────────────
    if "error" in data:
        err = data["error"]
        msg = err.get("message", str(err)) if isinstance(err, dict) else str(err)
        raise RuntimeError(f"OpenRouter error ({model}): {msg}")

    # ── Parse the assistant reply ─────────────────────────────────────────
    choices = data.get("choices", [])
    if not choices:
        raise RuntimeError(f"OpenRouter returned no choices ({model}): {data}")

    choice = choices[0]
    message = choice.get("message", {})

    # Some free-tier models put the answer in "reasoning" instead of "content"
    content = message.get("content") or message.get("reasoning") or ""

    if not content:
        finish = choice.get("finish_reason", "unknown")
        raise RuntimeError(
            f"OpenRouter returned empty content ({model}, "
            f"finish_reason={finish})."
        )

    return {
        "content": content,
        "model": data.get("model", model),
        "usage": data.get("usage", {}),
    }


# ── Public API ────────────────────────────────────────────────────────────────

def chat_completion(
    system_prompt: str,
    user_message: str,
    *,
    temperature: float = 0.3,
    max_tokens: int = 1024,
) -> dict[str, Any]:
    """
    Send a chat-completion request to OpenRouter.

    Tries OPENROUTER_MODEL first. If it fails, retries with
    OPENROUTER_FALLBACK_MODEL (google/gemma-4-26b free by default).

    Returns
    -------
    dict with keys:
        "content"   – assistant reply text
        "model"     – model that actually served the request
        "usage"     – token counts (prompt / completion / total)
    """
    _check_config()

    # ── Try primary model ─────────────────────────────────────────────────
    try:
        return _send_request(
            OPENROUTER_MODEL, system_prompt, user_message,
            temperature, max_tokens,
        )
    except Exception as primary_err:
        # If no fallback configured, or same as primary, re-raise
        if (
            not OPENROUTER_FALLBACK_MODEL
            or OPENROUTER_FALLBACK_MODEL == OPENROUTER_MODEL
        ):
            raise

        print(
            f"[openrouter] Primary model failed ({OPENROUTER_MODEL}): "
            f"{primary_err}\n"
            f"[openrouter] Retrying with fallback: {OPENROUTER_FALLBACK_MODEL}",
            flush=True,
        )

    # ── Try fallback model ────────────────────────────────────────────────
    return _send_request(
        OPENROUTER_FALLBACK_MODEL, system_prompt, user_message,
        temperature, max_tokens,
    )
