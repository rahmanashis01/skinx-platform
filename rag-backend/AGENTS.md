# Repository Guidelines

## Project Structure & Module Organization
This repository is currently a minimal scaffold: no application code, tests, or build files are checked in yet. Keep the root directory reserved for project-level files such as `README.md`, `AGENTS.md`, `.env.example`, and tool configuration.

When adding code, use a predictable layout:
- `src/` for runtime modules and services
- `tests/` for automated tests mirroring `src/`
- `scripts/` for repeatable developer utilities
- `docs/` for design notes, API contracts, or ADRs

Example:
```text
src/rag_backend/
tests/test_api.py
scripts/seed_data.py
```

## Build, Test, and Development Commands
No build, lint, or test commands are defined in this checkout yet. Contributors should add tooling together with the feature that needs it and document the commands in `README.md` and this file.

Until then, use:
- `ls -la` to verify the working tree
- `git status` to review pending changes
- `git diff --stat` to inspect change scope before a commit

If you introduce Python tooling, prefer a single documented entry point such as `make test` or `pytest`.

## Coding Style & Naming Conventions
Use 4-space indentation for Python and keep files ASCII unless a clear reason exists otherwise. Prefer small modules, explicit imports, and descriptive names such as `vector_store.py`, `embed_documents()`, and `RagIndexer`.

Use `snake_case` for files, functions, and variables; `PascalCase` for classes; and `UPPER_SNAKE_CASE` for constants. Add formatter/linter config with the code that needs it; `ruff` and `pytest` are sensible defaults for a Python backend.

## Testing Guidelines
Place tests under `tests/` and name them `test_*.py`. Mirror the source layout where practical, for example `src/rag_backend/api.py` with `tests/test_api.py`.

Every new feature or bug fix should include automated tests when behavior can be exercised deterministically. If coverage cannot be added, explain the gap in the pull request.

## Commit & Pull Request Guidelines
No project Git history is available in this workspace, so use clear, imperative commit messages with a conventional prefix, for example `feat: add retrieval pipeline` or `fix: handle empty query results`.

Pull requests should include:
- a short description of the change
- linked issue or task ID, if one exists
- test evidence or command output
- notes about config, schema, or API changes
