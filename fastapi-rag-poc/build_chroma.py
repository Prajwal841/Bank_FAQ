from transformers import pipeline
import numpy as np
import json
import chromadb

# Initialize Chroma
client = chromadb.PersistentClient(path="chroma_db")
collection = client.get_or_create_collection("faq_embeddings")

# Embedding pipeline
embedding_model = pipeline(
    "feature-extraction",
    model="sentence-transformers/all-MiniLM-L6-v2"
)

with open("faqs.json", "r", encoding="utf-8") as f:
    faqs = json.load(f)

print(f"Loaded {len(faqs)} FAQs from JSON")

for idx, faq in enumerate(faqs):
    question = faq["question"]

    # Get raw embeddings: shape [1, seq_len, hidden_size]
    embedding = embedding_model(question, return_tensors=False)

    # Convert to numpy
    embedding = np.array(embedding)

    # Mean pool over sequence length → shape [hidden_size]
    embedding = embedding.mean(axis=1).squeeze().tolist()


    print(f" Embedding FAQ {idx+1}: {question}")
    print(f" Got embedding of length {len(embedding)}")

    # Store in Chroma
    collection.add(
        ids=[str(idx)],
        documents=[question + " " + faq["answer"]],
        embeddings=[embedding]
    )

print("All FAQs embedded and stored in Chroma!")
