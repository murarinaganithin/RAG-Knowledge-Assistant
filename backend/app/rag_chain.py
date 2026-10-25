import time
import re
from typing import List, Dict, Any, Optional
import httpx

from app.vector_store import HybridVectorStore
from app.evaluator import evaluate_response
from app.config import DEFAULT_CONFIDENCE_THRESHOLD, DEFAULT_TOP_K


SYSTEM_PROMPT = """You are RAG Knowledge Assistant, an expert document-grounded question answering system built with LangChain.
Your mission is to provide accurate, reliable answers strictly grounded in the provided document context.

RULES:
1. Grounding: Answer ONLY using facts directly stated in the Context below. Do NOT hallucinate or extrapolate.
2. Refusal Guardrail: If the context does not contain adequate evidence to answer the question, state:
   "⚠️ No evidence found: The uploaded documents do not contain sufficient evidence to answer this question."
3. Citations: Every key factual sentence or statement must cite its source using this format:
   [Source: <filename>, Page: <page>, Chunk: <chunk_id>]
4. Precision: Be concise, clear, and informative.
"""


class RAGChain:
    """
    Document-grounded Q&A Chain built on LangChain principles:
    - Ingests user query
    - Retrieves top-k relevant chunks via Hybrid Vector Store
    - Evaluates retrieval confidence against refusal threshold
    - Generates grounded response with inline citation tags
    - Computes real-time latency and evaluation metrics
    """

    def __init__(self, vector_store: HybridVectorStore):
        self.vector_store = vector_store

    def query(
        self,
        question: str,
        top_k: int = DEFAULT_TOP_K,
        confidence_threshold: float = DEFAULT_CONFIDENCE_THRESHOLD,
        fusion_alpha: float = 0.55,
        ground_truth_concepts: Optional[List[str]] = None,
        llm_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Executes full RAG pipeline and returns answer, citations, and evaluation metrics."""
        start_time = time.time()

        # Step 1: Retrieval
        retrieval_start = time.time()
        retrieved_chunks = self.vector_store.search_hybrid(
            query=question,
            top_k=top_k,
            alpha=fusion_alpha
        )
        retrieval_latency = round(time.time() - retrieval_start, 3)

        # Step 2: Check confidence & threshold
        max_score = max([c.get("score", 0.0) for c in retrieved_chunks]) if retrieved_chunks else 0.0

        if not retrieved_chunks or max_score < confidence_threshold:
            # Refusal Guardrail Triggered
            answer = "⚠️ No evidence found: The uploaded documents do not contain sufficient evidence to answer this question."
            evidence_found = False
            citations = []
        else:
            evidence_found = True
            answer, citations = self._generate_grounded_answer(
                question=question,
                chunks=retrieved_chunks,
                llm_config=llm_config
            )

        total_latency = round(time.time() - start_time, 3)

        # Step 3: Evaluation
        evaluation = evaluate_response(
            question=question,
            answer=answer,
            retrieved_chunks=retrieved_chunks,
            ground_truth_concepts=ground_truth_concepts,
            latency_seconds=total_latency
        )

        return {
            "question": question,
            "answer": answer,
            "evidence_found": evidence_found,
            "confidence_score": round(max_score, 4),
            "threshold_used": confidence_threshold,
            "retrieved_chunks": retrieved_chunks,
            "citations": citations,
            "latency": {
                "retrieval_seconds": retrieval_latency,
                "total_seconds": total_latency
            },
            "evaluation": evaluation
        }

    def _generate_grounded_answer(
        self,
        question: str,
        chunks: List[Dict[str, Any]],
        llm_config: Optional[Dict[str, Any]] = None
    ) -> (str, List[Dict[str, Any]]):
        """Generates grounded answer using external LLM or high-fidelity local grounded extraction."""
        # Check if external API requested
        provider = (llm_config or {}).get("provider", "local").lower()
        api_key = (llm_config or {}).get("api_key")

        if provider == "gemini" and api_key:
            external_ans = self._call_gemini(question, chunks, api_key)
            if external_ans:
                return external_ans, self._extract_citations_from_chunks(chunks)

        if provider == "openai" and api_key:
            external_ans = self._call_openai(question, chunks, api_key)
            if external_ans:
                return external_ans, self._extract_citations_from_chunks(chunks)

        # High-Fidelity Local Grounded Extractor (deterministic, reproducible, zero API cost)
        return self._local_grounded_generator(question, chunks)

    def _local_grounded_generator(
        self,
        question: str,
        chunks: List[Dict[str, Any]]
    ) -> (str, List[Dict[str, Any]]):
        """Synthesizes high-fidelity answers directly grounded in top chunks."""
        q_words = re.findall(r"\b[a-zA-Z0-9_\-\.]{3,}\b", question.lower())
        stopwords = {"what", "when", "where", "which", "how", "does", "explain", "describe", "detail", "about"}
        query_terms = [w for w in q_words if w not in stopwords]

        scored_sentences = []
        for chunk in chunks[:4]:
            text = chunk.get("text", "")
            meta = chunk.get("metadata", {})
            citation_tag = f"[Source: {chunk.get('filename')}, Page: {chunk.get('page', 1)}, Chunk: {chunk.get('chunk_id')}]"

            sentences = re.split(r"(?<=[.!?])\s+", text)
            for s in sentences:
                s_clean = s.strip()
                if len(s_clean) < 25 or len(s_clean) > 350:
                    continue
                # Calculate term overlap
                s_lower = s_clean.lower()
                matches = sum(1 for term in query_terms if term in s_lower)
                if matches > 0:
                    scored_sentences.append({
                        "sentence": s_clean,
                        "score": matches + chunk.get("score", 0),
                        "chunk": chunk,
                        "citation": citation_tag
                    })

        scored_sentences.sort(key=lambda x: x["score"], reverse=True)

        selected = []
        used_texts = set()
        for item in scored_sentences:
            core = item["sentence"][:40]
            if core not in used_texts:
                used_texts.add(core)
                selected.append(item)
            if len(selected) >= 3:
                break

        if not selected:
            # Fall back to best chunk's key summary
            best = chunks[0]
            citation_tag = f"[Source: {best.get('filename')}, Page: {best.get('page', 1)}, Chunk: {best.get('chunk_id')}]"
            first_sentences = re.split(r"(?<=[.!?])\s+", best.get("text", ""))[:2]
            answer = " ".join([s.strip() for s in first_sentences if s.strip()]) + f" {citation_tag}"
        else:
            parts = []
            for item in selected:
                parts.append(f"{item['sentence']} {item['citation']}")
            answer = " ".join(parts)

        citations = self._extract_citations_from_chunks(chunks)
        return answer, citations

    def _extract_citations_from_chunks(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Formats citation records for frontend source inspection."""
        citations = []
        seen = set()
        for chunk in chunks[:4]:
            cid = chunk.get("chunk_id")
            if cid not in seen:
                seen.add(cid)
                citations.append({
                    "chunk_id": cid,
                    "filename": chunk.get("filename"),
                    "page": chunk.get("page", 1),
                    "category": chunk.get("category", "General"),
                    "snippet": chunk.get("text", "")[:280] + "...",
                    "full_text": chunk.get("text", ""),
                    "score": chunk.get("score", 0.0),
                    "tag": f"[Source: {chunk.get('filename')}, Page: {chunk.get('page', 1)}, Chunk: {cid}]"
                })
        return citations

    def _call_gemini(self, question: str, chunks: List[Dict[str, Any]], api_key: str) -> Optional[str]:
        """Calls Google Gemini API with RAG context."""
        try:
            context_str = "\n\n".join([
                f"--- Document: {c.get('filename')}, Page: {c.get('page')}, Chunk: {c.get('chunk_id')} ---\n{c.get('text')}"
                for c in chunks
            ])
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [{
                    "parts": [{"text": f"{SYSTEM_PROMPT}\n\nCONTEXT:\n{context_str}\n\nQUESTION: {question}"}]
                }]
            }
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception:
            pass
        return None

    def _call_openai(self, question: str, chunks: List[Dict[str, Any]], api_key: str) -> Optional[str]:
        """Calls OpenAI API with RAG context."""
        try:
            context_str = "\n\n".join([
                f"--- Document: {c.get('filename')}, Page: {c.get('page')}, Chunk: {c.get('chunk_id')} ---\n{c.get('text')}"
                for c in chunks
            ])
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {api_key}"}
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"CONTEXT:\n{context_str}\n\nQUESTION: {question}"}
                ],
                "temperature": 0.1
            }
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"].strip()
        except Exception:
            pass
        return None
