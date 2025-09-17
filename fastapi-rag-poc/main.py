from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from transformers import pipeline
from chromadb import PersistentClient
import requests, json, os


# ----- Config -----
EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
CHROMA_DIR = "./chroma_db"  # same directory you used when ingesting
CHROMA_COLLECTION_NAME = "faq_embeddings"
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3:8b-instruct-q4_0")
OLLAMA_TIMEOUT = 30

# ----- FastAPI app -----
app = FastAPI(title="RAG FAQ POC")

# Allow frontend calls (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Load embedding model and Chroma -----
print("Loading embedding model (this may take a moment)...")
embedding_model = pipeline("feature-extraction", model=EMBED_MODEL)
print("Embedding model ready.")

chroma_client = PersistentClient(path=CHROMA_DIR)
collection = chroma_client.get_or_create_collection(name=CHROMA_COLLECTION_NAME)
print("Connected to Chroma collection:", CHROMA_COLLECTION_NAME)


# ----- Helpers -----
def embed_text(text: str):
    """
    Produce a single pooled vector from transformers pipeline output.
    Returns: list[float]
    """
    raw = embedding_model(text, return_tensors=False)
    arr = np.array(raw)

    if arr.ndim == 3:  # (1, seq_len, hidden)
        vec = arr.mean(axis=1).squeeze(0)
    elif arr.ndim == 2:  # (seq_len, hidden) or (1, hidden)
        vec = arr.mean(axis=0) if arr.shape[0] > 1 else arr.squeeze(0)
    else:
        vec = arr.squeeze()

    return vec.tolist()


def call_ollama(prompt: str, timeout: int = OLLAMA_TIMEOUT) -> str:
    """
    Call local Ollama HTTP API and return the combined text response.
    """
    try:
        resp = requests.post(
            OLLAMA_URL,
            json={"model": OLLAMA_MODEL, "prompt": prompt},
            stream=True,
            timeout=timeout,
        )
        resp.raise_for_status()
    except Exception as e:
        raise RuntimeError(f"Ollama request failed: {e}")

    output = ""
    for raw_line in resp.iter_lines():
        if not raw_line:
            continue
        try:
            data = json.loads(raw_line.decode("utf-8"))
            if "response" in data:
                output += data["response"]
        except json.JSONDecodeError:
            continue
    return output.strip()


# ----- Schemas -----
class AskRequest(BaseModel):
    question: str
    top_k: int = 3


class RetrievedItem(BaseModel):
    document: str
    distance: float


class AskResponse(BaseModel):
    answer: str
    retrieved: list[RetrievedItem]


# ----- Endpoints -----
@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ask", response_model=AskResponse)
def ask(req: AskRequest):
    # 1) embed the question
    try:
        q_emb = embed_text(req.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding error: {e}")

    # 2) retrieve from Chroma
    try:
        res = collection.query(
            query_embeddings=[q_emb],
            n_results=req.top_k,
            include=["documents", "distances"],
        )
        docs = res.get("documents", [[]])[0]
        distances = res.get("distances", [[]])[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chroma query error: {e}")

    # 3) construct the LLM prompt
    context = "\n\n".join(docs) if docs else "No relevant context found."
    prompt = f"""
You are a helpful, accurate banking FAQ assistant.
Use ONLY the context below to answer the user's question.
If the answer is not present, say "I don't know. Please contact the bank."

CONTEXT:
{context}

USER QUESTION:
{req.question}

Answer concisely:
"""

    # 4) call LLaMA (Ollama)
    try:
        answer = call_ollama(prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 5) response
    retrieved = [
        {"document": d, "distance": float(dist)} for d, dist in zip(docs, distances)
    ]
    return AskResponse(answer=answer, retrieved=retrieved)
