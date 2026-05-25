# SkinX RAG Migration Plan: PGVector → ChromaDB + Qwen3 Embeddings + OpenRouter

## Objective

Replace the current SkinX RAG retrieval layer from PostgreSQL/PGVector to local ChromaDB on the VPS, while keeping the same external API behavior.

The goal is to keep the existing production paths stable:

```text
GET  /health
POST /ask
```

and keep the public Node route stable:

```text
/api/ask
```

Only the internal RAG retrieval/storage layer should change.

---

## 1. Current Production Context

Current RAG backend path:

```text
/var/www/skinx/rag-backend/
```

Important current files:

```text
/var/www/skinx/rag-backend/src/api.py
/var/www/skinx/rag-backend/src/rag.py
/var/www/skinx/rag-backend/src/prompt_rules.py
```

Current external RAG endpoints:

```text
GET  /health
POST /ask
```

Current port:

```text
8000
```

Current public route:

```text
/api/ask
```

Do not change these unless explicitly approved.

---

## 2. Final Target Architecture

```text
User question
   ↓
Frontend / Node / Telegram
   ↓
/api/ask
   ↓
RAG backend :8000 /ask
   ↓
Load system guardrail
   ↓
Embed query using Qwen3-Embedding-8B
   ↓
Search local ChromaDB
   ↓
Retrieve top matching chunks
   ↓
Send system guardrail + retrieved context + user question to OpenRouter LLM
   ↓
Return safe SkinX assistant answer
```

---

## 3. What Must Stay the Same

Keep:

```text
GET /health
POST /ask
Port 8000
/api/ask
```

Do not change:

```text
Node backend routing
Frontend chat route
Nginx route
Model API :8080
Image analysis flow
```

The image model is separate and should not be touched.

---

## 4. What Changes Internally

Old retrieval flow:

```text
question
   ↓
embedding
   ↓
PostgreSQL/PGVector search
   ↓
chunks
   ↓
answer
```

New retrieval flow:

```text
question
   ↓
embedding using Qwen3-Embedding-8B
   ↓
ChromaDB search
   ↓
retrieved chunks
   ↓
OpenRouter LLM under system guardrail
   ↓
answer
```

---

## 5. Recommended New Local RAG Project Structure

Build locally first in Antigravity IDE.

```text
skinx-rag-chroma/
├── src/
│   ├── api.py
│   ├── rag.py
│   ├── config.py
│   ├── prompt_rules.py
│   ├── chroma_store.py
│   ├── embedding_model.py
│   ├── openrouter_client.py
│   ├── chunking.py
│   └── ingestion.py
│
├── data/
│   ├── source_docs/
│   │   └── SkinXRag.docx
│   ├── chunks/
│   │   └── skinx_chunks.jsonl
│   └── chroma_db/
│
├── scripts/
│   ├── ingest_docs.py
│   ├── test_retrieval.py
│   └── test_ask.py
│
├── requirements.txt
├── .env.example
└── README.md
```

Production target path should remain:

```text
/var/www/skinx/rag-backend/
```

Inside production:

```text
/var/www/skinx/rag-backend/chroma_db/
```

or:

```text
/var/www/skinx/rag-backend/data/chroma_db/
```

Use one consistent path.

---

## 6. Important Document Separation

Your uploaded `SkinXRag.docx` contains both:

```text
1. System guardrails / rules / identity
2. Medical knowledge content
```

These should be separated.

### 6.1 System Rules

System rules should become:

```text
src/prompt_rules.py
```

or:

```text
data/system_prompt.md
```

These are not usually embedded as normal chunks.

They are loaded into the prompt every time.

Examples of system rules:

```text
- Do not diagnose.
- Do not recommend treatments.
- Answer only from retrieved context.
- Decline out-of-scope questions.
- Ask users not to share PHI/PII.
- Maintain calm, simple language.
- Always advise dermatologist confirmation.
```

### 6.2 Knowledge Content

Disease descriptions and educational content should be chunked and embedded.

Examples:

```text
Melanoma
BCC
SCC
ALM
Tinea Corporis
Scabies
Eczema
Vitiligo
Melasma
Mpox
```

These go into ChromaDB.

---

## 7. Do We Need JSON Chunks?

Yes, but not exactly like this:

```json
{
  "doc_id": 12,
  "content": "abcd",
  "vector": [0.23, 0.45, 1.34]
}
```

That structure is possible, but not recommended for ChromaDB.

For ChromaDB, store:

```text
id
document text
metadata
embedding/vector
```

ChromaDB handles the vector storage internally.

Recommended chunk file before ingestion:

```json
{"id":"skinx_melanoma_001","content":"Melanoma is...","metadata":{"source":"SkinXRag.docx","section":"General Melanoma","category":"Skin Cancers"}}
{"id":"skinx_bcc_001","content":"Basal Cell Carcinoma is...","metadata":{"source":"SkinXRag.docx","section":"Basal Cell Carcinoma","category":"Skin Cancers"}}
```

Use JSONL:

```text
one JSON object per line
```

Recommended file:

```text
data/chunks/skinx_chunks.jsonl
```

Do not manually store vectors in this file unless needed for export/debugging.

ChromaDB will persist embeddings inside:

```text
data/chroma_db/
```

---

## 8. Are Chunks and Vectors Separate Files?

Recommended answer:

```text
Chunks file = source text + metadata
ChromaDB directory = stored embeddings/vectors
```

So you should have both:

```text
data/chunks/skinx_chunks.jsonl
data/chroma_db/
```

Meaning:

```text
skinx_chunks.jsonl
```

is useful for versioning and re-ingestion.

```text
chroma_db/
```

is the actual vector database used by the RAG backend.

Do not rely only on ChromaDB without keeping the chunk source file.

---

## 9. Does the LLM Need the Vector File?

No.

The LLM does not directly read vectors.

Flow:

```text
User question
   ↓
query embedding
   ↓
ChromaDB similarity search
   ↓
top matching text chunks
   ↓
LLM receives text chunks, not vectors
```

OpenRouter LLM receives:

```text
system prompt
retrieved text context
user question
```

It does not receive:

```text
raw vector arrays
```

---

## 10. Qwen3-Embedding-8B Usage

You want to use:

```text
Qwen3-Embedding-8B
```

Use it for:

```text
1. Document chunk embeddings during ingestion
2. Query embeddings during /ask
```

Important rule:

```text
The same embedding model must be used for both document ingestion and query search.
```

If documents are embedded with Qwen3-Embedding-8B, queries must also be embedded with Qwen3-Embedding-8B.

---

## 11. Environment Variables

```env
RAG_PORT=8000

CHROMA_PERSIST_DIR=/var/www/skinx/rag-backend/data/chroma_db
CHROMA_COLLECTION_NAME=skinx_knowledge

EMBEDDING_MODEL_NAME=Qwen/Qwen3-Embedding-8B

OPENROUTER_API_KEY=
OPENROUTER_MODEL=

SYSTEM_PROMPT_PATH=/var/www/skinx/rag-backend/data/system_prompt.md

TOP_K=5
MAX_CONTEXT_CHARS=6000
```

---

## 12. Required Files and Their Purpose

### `src/api.py`

FastAPI/Flask API layer.

Must expose:

```text
GET /health
POST /ask
```

### `src/rag.py`

Main RAG orchestration.

Responsible for:

```text
question → retrieve chunks → call OpenRouter → return answer
```

### `src/prompt_rules.py`

Loads and applies system guardrails.

### `src/chroma_store.py`

Responsible for:

```text
create/load ChromaDB collection
add documents
query documents
```

### `src/embedding_model.py`

Responsible for:

```text
load Qwen3-Embedding-8B
embed documents
embed query
```

### `src/openrouter_client.py`

Responsible for:

```text
call OpenRouter chat completion API
```

### `src/chunking.py`

Responsible for:

```text
convert docs into clean chunks
separate system rules from knowledge content
preserve metadata
```

### `src/ingestion.py`

Responsible for:

```text
read chunks
create embeddings
store in ChromaDB
```

---

## 13. `/ask` Request and Response Contract

Keep request flexible because Node/frontend may already use an existing shape.

Recommended input support:

```json
{
  "question": "What is melanoma?"
}
```

Also support:

```json
{
  "message": "What is melanoma?"
}
```

and:

```json
{
  "query": "What is melanoma?"
}
```

Recommended response:

```json
{
  "success": true,
  "answer": "Melanoma is...",
  "sources": [
    {
      "section": "General Melanoma",
      "source": "SkinXRag.docx"
    }
  ],
  "metadata": {
    "retrieval": "chroma",
    "top_k": 5
  }
}
```

Error response:

```json
{
  "success": false,
  "code": "RAG_ERROR",
  "error": "Unable to answer right now."
}
```

---

## 14. Guardrail Behavior

Every OpenRouter call must include system rules.

Minimum rules:

```text
- You are SkinX assistant.
- You are an educational AI assistant, not a doctor.
- Do not diagnose.
- Do not prescribe or recommend treatments.
- Answer only using retrieved context.
- If context is missing, say the information is not available in the provided SkinX knowledge base.
- Keep response concise and readable.
- For urgent symptoms, advise emergency services.
- End with gentle dermatologist confirmation reminder.
```

---

## 15. Development Phases

## Phase 1 — Local Project Setup

Goal:

```text
Create local RAG Chroma project structure.
```

Codex can:

```text
- Create folder structure.
- Add requirements.txt.
- Add .env.example.
- Add placeholder modules.
- Keep /health and /ask route signatures.
```

Manual:

```text
- Place SkinXRag.docx into data/source_docs/
- Add OpenRouter API key to .env later
```

Completion:

```text
python src/api.py
GET /health works
```

---

## Phase 2 — Chunking and Guardrail Separation

Goal:

```text
Convert SkinXRag.docx into:
1. system prompt/rules
2. knowledge chunks
```

Codex can:

```text
- Parse docx text.
- Extract system guardrail sections.
- Extract disease/knowledge sections.
- Generate data/system_prompt.md.
- Generate data/chunks/skinx_chunks.jsonl.
```

Manual:

```text
- Review system_prompt.md.
- Review chunks for correctness.
```

Completion:

```text
system_prompt.md exists
skinx_chunks.jsonl exists
chunks contain metadata
```

---

## Phase 3 — Qwen3 Embeddings + ChromaDB Ingestion

Goal:

```text
Embed chunks and store them in ChromaDB.
```

Codex can:

```text
- Add Qwen3 embedding loader.
- Add ChromaDB collection creation.
- Add ingestion script.
- Store ChromaDB persistently.
```

Manual:

```text
- Confirm VPS/local machine has enough RAM/disk for Qwen3-Embedding-8B.
- If too heavy, choose smaller fallback embedding model.
```

Completion:

```text
python scripts/ingest_docs.py
ChromaDB collection created
test retrieval returns relevant chunks
```

---

## Phase 4 — Retrieval Test

Goal:

```text
Test ChromaDB retrieval before adding OpenRouter.
```

Codex can:

```text
- Add scripts/test_retrieval.py.
- Print top chunks for test questions.
```

Manual test questions:

```text
What is melanoma?
What is ringworm?
What is scabies?
What should I not do for steroid damaged face?
```

Completion:

```text
Correct chunks retrieved.
```

---

## Phase 5 — OpenRouter LLM Integration

Goal:

```text
Use retrieved chunks + system prompt + user question to generate answer.
```

Codex can:

```text
- Add openrouter_client.py.
- Add prompt construction.
- Add safe response parsing.
```

Manual:

```text
- Add OPENROUTER_API_KEY.
- Select OpenRouter model.
```

Completion:

```text
Question → retrieved context → OpenRouter answer.
```

---

## Phase 6 — Preserve `/ask` API

Goal:

```text
Replace old PGVector retrieval with ChromaDB retrieval while keeping API stable.
```

Codex can:

```text
- Update src/api.py.
- Update src/rag.py.
- Keep POST /ask unchanged.
- Keep GET /health unchanged.
```

Manual:

```text
- Compare old /ask response shape.
- Confirm Node backend accepts new response.
```

Completion:

```text
curl POST /ask works locally.
```

---

## Phase 7 — VPS Deployment

Goal:

```text
Deploy ChromaDB RAG to VPS path.
```

Manual deployment:

```bash
rsync -avz --delete skinx-rag-chroma/ "${VPS_USER}@${VPS_HOST}:/var/www/skinx/rag-backend/"
```

On VPS:

```bash
cd /var/www/skinx/rag-backend
source venv/bin/activate
pip install -r requirements.txt
python scripts/ingest_docs.py
```

Restart RAG:

```bash
pkill -f gunicorn
nohup /var/www/skinx/rag-backend/venv/bin/gunicorn -w 2 -b 127.0.0.1:8000 src.api:app --timeout 120 > /var/www/skinx/rag-backend/logs/gunicorn.log 2>&1 &
```

Completion:

```bash
curl -i http://127.0.0.1:8000/health
curl -s -X POST http://127.0.0.1:8000/ask -H "Content-Type: application/json" -d '{"question":"What is melanoma?"}' | jq
```

---

## Phase 8 — Node/Public Route Test

Goal:

```text
Confirm existing Node /api/ask still works.
```

Test:

```bash
curl -s -X POST http://127.0.0.1:5001/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What is melanoma?"}' | jq
```

Completion:

```text
Frontend chat and future Telegram bot can use /api/ask.
```

---

## 16. What Codex Can Automate

Codex can:

```text
- Build local RAG project structure.
- Write chunking script.
- Write ChromaDB ingestion logic.
- Write Qwen3 embedding wrapper.
- Write retrieval test script.
- Write OpenRouter client.
- Preserve API endpoint structure.
- Add README and .env.example.
```

---

## 17. What Must Be Manual

Manual:

```text
- Review medical guardrail separation.
- Review chunk quality.
- Add OpenRouter API key.
- Confirm Qwen3-Embedding-8B fits local/VPS resources.
- Run ingestion.
- Deploy to VPS.
- Restart RAG service.
- Test Node /api/ask.
```

---

## 18. First Build Decision

Start with:

```text
Phase 1: Local project setup
Phase 2: Chunking + guardrail separation
```

Do not touch VPS yet.

Do not touch Node backend yet.

Do not touch Telegram bot yet.

Do not touch model API.
