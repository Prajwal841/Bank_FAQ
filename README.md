# **RAG FAQ Chatbot POC**


Screenshot
<img width="1787" height="845" alt="image" src="https://github.com/user-attachments/assets/6553a89c-e55f-42de-a9a0-79bb01681161" />
Video Demo
---[screen-capture.webm](https://github.com/user-attachments/assets/e67e8455-1dab-48fe-8623-744688553b60)


## **1. Objective**

Build a **chatbot** that can answer user queries based on a **dynamic FAQ dataset**. Users can upload **JSON **, and the chatbot will provide **accurate answers** using:

- **ChromaDB** → for storing and retrieving embeddings  
- **Transformers** → for text embeddings  
- **Local LLaMA (Ollama)** → for generating natural language answers  
- **FastAPI** → for backend API  

---

## **2. File Structure & Purpose**

| File | Purpose |
|------|---------|
| `build_chroma.py` | Read JSON, generate embeddings using `sentence-transformers/all-MiniLM-L6-v2`, and store in ChromaDB |
| `query_chroma.py` | Test retrieval: embed a user query, search ChromaDB, and generate response via LLaMA |
| `main.py` | FastAPI backend with `/ask` endpoint for chatbot queries. Handles embeddings, retrieval, and LLaMA response |
| `faqs.json` | Sample FAQ data to build the initial ChromaDB collection |

---

## **3. Flow of the POC**

### **Step 1 – Build ChromaDB**
- Read FAQs from `faqs.json`  
- Embed each question using **transformers pipeline**  
- Store embeddings + full Q/A in **ChromaDB**  
- **Output:** persistent collection ready for retrieval  

**File:** `build_chroma.py`  

---

### **Step 2 – Test Query**
- Take a sample user question  
- Embed it the same way as FAQs  
- Query **ChromaDB** to get top-k relevant documents  
- Pass retrieved docs + question as **context to LLaMA**  
- Get **final answer**  

**File:** `query_chroma.py`  

---

### **Step 3 – FastAPI Backend**
- **Endpoints:**  
  - `/ask` → Accepts user question, embeds, retrieves top-k docs, calls LLaMA, returns **final answer**  
**File:** `main.py`  

---

### **Step 4 – Frontend (React / Tailwind)**
- Chat UI with:  
  - Input box + send button  
  - Left/right chat bubbles for bot and user  
  - Shows only the **final answer** from backend  
  - Loading indicator while waiting for response  
- Connects to FastAPI `/ask` endpoint using **fetch**  

---

## **4. Example API Call**


## **4. Example API Call**

```bash
curl -X POST "http://127.0.0.1:8000/ask" \
-H "Content-Type: application/json" \
-d "{\"question\": \"How do I create an account?\", \"top_k\": 3}"
Response:

json
{
  "answer": "To open a savings account, visit the nearest branch with your KYC documents.",
  "retrieved": [
    {"document": "How do I open a savings account? ...", "distance": 32.04},
    {"document": "How can I reset my net banking password? ...", "distance": 64.09}
  ]
}
