import os
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

# Load token from .env
load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")

client = InferenceClient(
    provider="hf-inference",
    api_key=HF_TOKEN,
)

source = "That is a happy person"
sentences = [
    "That is a happy dog",
    "That is a very happy person",
    "Today is a sunny day"
]

#passing the model the parameters
result = client.sentence_similarity(
    source,
    sentences,
    model="sentence-transformers/all-MiniLM-L6-v2",
)

print(result)
