import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
SAMPLES_DIR = DATA_DIR / "samples"
BENCHMARK_DIR = BASE_DIR / "benchmark"

# Ensure directories exist
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
SAMPLES_DIR.mkdir(parents=True, exist_ok=True)
BENCHMARK_DIR.mkdir(parents=True, exist_ok=True)

# Default RAG Configurations
DEFAULT_CHUNK_SIZE = 600
DEFAULT_CHUNK_OVERLAP = 120
DEFAULT_TOP_K = 5
DEFAULT_CONFIDENCE_THRESHOLD = 0.32
DEFAULT_FUSION_ALPHA = 0.55  # Weight between dense vector search (1-alpha) and lexical BM25 (alpha)

# Target benchmark metrics
TARGET_RECALL_AT_5 = 0.90
TARGET_FAITHFULNESS = 0.92
TARGET_AVG_LATENCY = 1.40  # seconds
