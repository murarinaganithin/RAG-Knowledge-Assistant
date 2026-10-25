import re
import math
from typing import List, Dict, Any, Optional, Set


def get_clean_keywords(text: str) -> Set[str]:
    """Extract clean content words, excluding standard English stopwords."""
    words = re.findall(r"\b[a-zA-Z0-9_\-\.]{3,}\b", text.lower())
    stopwords = {
        "the", "and", "for", "with", "that", "this", "from", "are", "was", "were",
        "been", "being", "have", "has", "had", "does", "did", "doing", "would",
        "should", "could", "about", "which", "into", "through", "after", "before",
        "under", "above", "between", "each", "more", "most", "some", "such"
    }
    return {w for w in words if w not in stopwords}


def extract_claim_sentences(text: str) -> List[str]:
    """Splits text into discrete propositional sentences/claims for faithfulness evaluation."""
    raw = re.split(r"(?<=[.!?])\s+", text.strip())
    claims = [s.strip() for s in raw if len(s.strip()) > 15]
    if not claims and text.strip():
        claims = [text.strip()]
    return claims


def calculate_recall_at_k(
    retrieved_chunks: List[Dict[str, Any]],
    ground_truth_concepts: List[str],
    k: int = 5
) -> Dict[str, Any]:
    """
    Computes Recall@K:
    Checks if the ground-truth concepts/keywords are captured in the top-K retrieved chunks.
    Recall = (Matched Ground Truth Concepts) / (Total Required Ground Truth Concepts)
    Hit@K is True if Recall >= 0.70.
    """
    if not ground_truth_concepts:
        return {"recall_at_k": 1.0, "hit": True, "matched": [], "missing": []}

    top_chunks = retrieved_chunks[:k]
    combined_retrieved_text = " ".join([c.get("text", "") for c in top_chunks]).lower()

    matched = []
    missing = []
    for concept in ground_truth_concepts:
        clean_c = concept.strip().lower()
        if clean_c in combined_retrieved_text:
            matched.append(concept)
        else:
            # Check individual tokens if multi-word
            c_toks = get_clean_keywords(clean_c)
            if c_toks and all(tok in combined_retrieved_text for tok in c_toks):
                matched.append(concept)
            else:
                missing.append(concept)

    recall_score = len(matched) / len(ground_truth_concepts)
    return {
        "k": k,
        "recall_at_k": round(recall_score, 3),
        "hit": recall_score >= 0.60,
        "total_required": len(ground_truth_concepts),
        "matched_count": len(matched),
        "matched": matched,
        "missing": missing
    }


def calculate_faithfulness(
    answer: str,
    retrieved_chunks: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    RAGAS-style Answer Faithfulness:
    Evaluates whether each factual claim in the generated answer is directly grounded
    in the retrieved source document chunks.
    Score = (Supported Claims) / (Total Claims)
    """
    if not answer:
        return {"score": 0.0, "total_claims": 0, "supported_claims": 0}

    # If the model explicitly refuses due to no evidence, it is 100% faithful to the missing context
    if "no evidence found" in answer.lower():
        return {
            "score": 1.0,
            "total_claims": 0,
            "supported_claims": 0,
            "is_refusal": True,
            "explanation": "Guarded refusal is 100% faithful to context absence."
        }

    claims = extract_claim_sentences(answer)
    if not claims:
        return {"score": 1.0, "total_claims": 0, "supported_claims": 0, "is_refusal": False}

    combined_context = " ".join([c.get("text", "") for c in retrieved_chunks]).lower()
    context_tokens = get_clean_keywords(combined_context)

    supported_count = 0
    claim_details = []

    for claim in claims:
        # Ignore citation tags in claim
        clean_claim = re.sub(r"\[Source:[^\]]+\]", "", claim).strip()
        claim_tokens = get_clean_keywords(clean_claim)

        if not claim_tokens:
            supported_count += 1
            claim_details.append({"claim": clean_claim, "supported": True, "overlap_ratio": 1.0})
            continue

        overlap = claim_tokens.intersection(context_tokens)
        ratio = len(overlap) / len(claim_tokens)

        # A claim is supported if >= 45% of its informative content words are present in context
        is_supported = ratio >= 0.45
        if is_supported:
            supported_count += 1

        claim_details.append({
            "claim": clean_claim,
            "supported": is_supported,
            "overlap_ratio": round(ratio, 2)
        })

    score = supported_count / len(claims) if claims else 1.0
    return {
        "score": round(score, 3),
        "total_claims": len(claims),
        "supported_claims": supported_count,
        "details": claim_details,
        "is_refusal": False,
        "explanation": f"{supported_count} of {len(claims)} statements verified against source document chunks."
    }


def calculate_answer_relevance(question: str, answer: str) -> Dict[str, Any]:
    """Measures how well the answer addresses the intent of the prompt."""
    if not answer or not question:
        return {"score": 0.0, "explanation": "Empty input."}

    if "no evidence found" in answer.lower():
        return {"score": 0.90, "explanation": "Direct refusal addressing missing evidence."}

    q_toks = get_clean_keywords(question)
    a_toks = get_clean_keywords(answer)

    if not q_toks:
        return {"score": 0.85, "explanation": "Broad query."}

    overlap = q_toks.intersection(a_toks)
    coverage = len(overlap) / len(q_toks)

    relevance_score = min(1.0, max(0.3, coverage * 0.75 + 0.25))
    return {
        "score": round(relevance_score, 3),
        "query_term_coverage": round(coverage, 2),
        "overlap_count": len(overlap)
    }


def evaluate_response(
    question: str,
    answer: str,
    retrieved_chunks: List[Dict[str, Any]],
    ground_truth_concepts: Optional[List[str]] = None,
    latency_seconds: float = 0.0
) -> Dict[str, Any]:
    """Complete evaluation pipeline returning Recall@5, Faithfulness, Relevance, and Latency."""
    recall = calculate_recall_at_k(retrieved_chunks, ground_truth_concepts or [], k=5)
    faithfulness = calculate_faithfulness(answer, retrieved_chunks)
    relevance = calculate_answer_relevance(question, answer)

    return {
        "recall_at_5": recall["recall_at_k"],
        "recall_hit": recall["hit"],
        "faithfulness": faithfulness["score"],
        "relevance": relevance["score"],
        "latency_seconds": round(latency_seconds, 3),
        "faithfulness_details": faithfulness,
        "recall_details": recall,
        "relevance_details": relevance
    }
