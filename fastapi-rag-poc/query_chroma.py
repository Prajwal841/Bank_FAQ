import numpy as np
from chromadb import PersistentClient
from transformers import pipeline
import requests
import json

# 1. Connect to Chroma (same path and collection name as build_chroma.py)
chroma_client = PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="faq_embeddings")

# 2. Load the same embedding model
embedding_model = pipeline("feature-extraction", model="sentence-transformers/all-MiniLM-L6-v2")

# 3. Function to embed text consistently
def embed_text(text):
    embedding = embedding_model(text, return_tensors=False)   
    embedding = np.array(embedding)                           
    embedding = embedding.mean(axis=1).squeeze().tolist()     
    return embedding

# 4. Ask user for query
user_query = input("❓ Ask your question: ")

# 5. Convert to embedding
query_embedding = embed_text(user_query)

# 6. Debug: collection state
print(" Total documents in collection:", collection.count())
print(" Sample docs:", collection.peek())

# 7. Search in Chroma
results = collection.query(
    query_embeddings=[query_embedding],
    n_results=2
)

# 8. Call LLaMA via Ollama
def ask_llama(prompt):
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3:8b-instruct-q4_0",
            "prompt": prompt
        },
        stream=True
    )

    output = ""
    for line in response.iter_lines():
        if line:
            try:
                data = json.loads(line.decode("utf-8"))
                if "response" in data:
                    output += data["response"]
            except json.JSONDecodeError:
                continue
    return output.strip()

# 9. Build prompt for LLaMA
retrieved_docs = results["documents"][0]
context = "\n".join(retrieved_docs)

llama_prompt = f"""
You are a helpful banking FAQ assistant.
The user asked: "{user_query}"

Here is some relevant context from the knowledge base:
{context}

Based on this context, answer the user clearly and concisely.
"""

# 10. Get AI answer
ai_answer = ask_llama(llama_prompt)

# 11. Show results
print("\n Top matches:")
for i, doc in enumerate(retrieved_docs):
    print(f"\nResult {i+1}:")
    print(f"Q/A: {doc}")
    print(f"Score (distance): {results['distances'][0][i]}")

print("\n Final Answer:")
print(ai_answer)
