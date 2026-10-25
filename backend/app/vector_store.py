import re
import math
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from rank_bm25 import BM25Okapi
from langchain_core.documents import Document


def tokenize_text(text: str) -> List[str]:
    """Tokenize and normalize text for BM25 indexing."""
    return re.findall(r"\b[a-zA-Z0-9_\-\.]{2,}\b", text.lower())


class HybridVectorStore:
    """
    Production-grade Hybrid Vector Store:
    Combines dense semantic vector embeddings (Cosine similarity)
    with lexical keyword search (BM25 Okapi) and Reciprocal Rank Fusion (RRF).
    """

    def __init__(self):
        self.documents: List[Document] = []
        self.chunk_texts: List[str] = []
        
        # Dense vector store components
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.doc_vectors: Optional[np.ndarray] = None
        
        # BM25 lexical index
        self.bm25: Optional[BM25Okapi] = None
        self.tokenized_corpus: List[List[str]] = []

    def index_documents(self, documents: List[Document]):
        """Indexes an array of LangChain Document objects."""
        if not documents:
            self.documents = []
            self.chunk_texts = []
            self.vectorizer = None
            self.doc_vectors = None
            self.bm25 = None
            self.tokenized_corpus = []
            return

        self.documents = documents
        self.chunk_texts = [doc.page_content for doc in documents]

        # 1. Build Dense Vector Index
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            norm="l2",
            stop_words="english",
            max_features=25000
        )
        self.doc_vectors = self.vectorizer.fit_transform(self.chunk_texts).toarray()

        # 2. Build BM25 Lexical Index
        self.tokenized_corpus = [tokenize_text(text) for text in self.chunk_texts]
        self.bm25 = BM25Okapi(self.tokenized_corpus)

    def search_vector(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Dense vector search using cosine similarity."""
        if not self.documents or self.vectorizer is None or self.doc_vectors is None:
            return []

        query_vec = self.vectorizer.transform([query]).toarray()
        sim_scores = cosine_similarity(query_vec, self.doc_vectors)[0]

        top_indices = np.argsort(sim_scores)[::-1][:top_k]
        results = []
        for idx in top_indices:
            score = float(sim_scores[idx])
            doc = self.documents[idx]
            results.append({
                "chunk_id": doc.metadata.get("chunk_id", f"c-{idx}"),
                "filename": doc.metadata.get("filename", "unknown"),
                "page": doc.metadata.get("page", 1),
                "category": doc.metadata.get("category", "General"),
                "text": doc.page_content,
                "score": round(score, 4),
                "retrieval_method": "vector_cosine",
                "metadata": doc.metadata
            })
        return results

    def search_bm25(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Lexical search using BM25 Okapi."""
        if not self.documents or self.bm25 is None:
            return []

        query_tokens = tokenize_text(query)
        if not query_tokens:
            return []

        bm25_scores = self.bm25.get_scores(query_tokens)
        top_indices = np.argsort(bm25_scores)[::-1][:top_k]

        max_score = max(float(np.max(bm25_scores)), 1e-6)
        results = []
        for idx in top_indices:
            raw_score = float(bm25_scores[idx])
            norm_score = raw_score / max_score
            doc = self.documents[idx]
            results.append({
                "chunk_id": doc.metadata.get("chunk_id", f"c-{idx}"),
                "filename": doc.metadata.get("filename", "unknown"),
                "page": doc.metadata.get("page", 1),
                "category": doc.metadata.get("category", "General"),
                "text": doc.page_content,
                "score": round(norm_score, 4),
                "retrieval_method": "lexical_bm25",
                "metadata": doc.metadata
            })
        return results

    def search_hybrid(
        self,
        query: str,
        top_k: int = 5,
        alpha: float = 0.55,
        fusion_method: str = "rrf",
        rrf_k: int = 60
    ) -> List[Dict[str, Any]]:
        """
        Hybrid search combining Dense Cosine Vector Similarity and BM25 Lexical Matching.
        Supports Reciprocal Rank Fusion (RRF) and Weighted Linear Combination.
        """
        if not self.documents:
            return []

        # Vector scores
        query_vec = self.vectorizer.transform([query]).toarray()
        v_scores = cosine_similarity(query_vec, self.doc_vectors)[0]

        # BM25 scores
        query_tokens = tokenize_text(query)
        b_scores = self.bm25.get_scores(query_tokens) if query_tokens else np.zeros(len(self.documents))
        max_bm25 = max(float(np.max(b_scores)), 1e-6)
        b_scores_norm = b_scores / max_bm25

        fused_scores = {}
        n_docs = len(self.documents)

        if fusion_method.lower() == "rrf":
            # Reciprocal Rank Fusion: RRF = sum(1 / (k + rank_i))
            v_ranks = np.argsort(v_scores)[::-1]
            b_ranks = np.argsort(b_scores)[::-1]

            for rank, idx in enumerate(v_ranks, start=1):
                fused_scores[idx] = fused_scores.get(idx, 0.0) + (1.0 - alpha) * (1.0 / (rrf_k + rank))

            for rank, idx in enumerate(b_ranks, start=1):
                fused_scores[idx] = fused_scores.get(idx, 0.0) + alpha * (1.0 / (rrf_k + rank))
        else:
            # Weighted linear combination
            for idx in range(n_docs):
                fused_scores[idx] = (1.0 - alpha) * float(v_scores[idx]) + alpha * float(b_scores_norm[idx])

        # Sort indices by fused score descending
        sorted_indices = sorted(fused_scores.keys(), key=lambda i: fused_scores[i], reverse=True)[:top_k]

        max_fused = max(fused_scores.values()) if fused_scores else 1.0

        results = []
        for idx in sorted_indices:
            doc = self.documents[idx]
            raw_fused = fused_scores[idx]
            norm_confidence = min(1.0, raw_fused / (max_fused if max_fused > 0 else 1.0))
            
            # Hybrid confidence combines dense overlap and BM25 alignment
            combined_conf = round(float(v_scores[idx] * 0.45 + b_scores_norm[idx] * 0.55), 4)

            results.append({
                "chunk_id": doc.metadata.get("chunk_id", f"c-{idx}"),
                "filename": doc.metadata.get("filename", "unknown"),
                "page": doc.metadata.get("page", 1),
                "category": doc.metadata.get("category", "General"),
                "text": doc.page_content,
                "score": combined_conf,
                "vector_score": round(float(v_scores[idx]), 4),
                "bm25_score": round(float(b_scores_norm[idx]), 4),
                "fused_rank_score": round(float(raw_fused), 5),
                "retrieval_method": "hybrid_rrf",
                "metadata": doc.metadata
            })

        return results
