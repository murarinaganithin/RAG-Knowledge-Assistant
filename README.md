# RAG Knowledge Assistant 🧠⚡
> **Document-grounded Q&A system with LangChain, embeddings, vector search, FastAPI backend, and an evaluated React frontend.**

[![LangChain](https://img.shields.io/badge/LangChain-v0.3-1C3C3C?logo=langchain&logoColor=white)](https://python.langchain.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Recall@5](https://img.shields.io/badge/Recall%405-90%25-brightgreen)](./backend/benchmark/EVALUATION_REPORT.md)
[![Faithfulness](https://img.shields.io/badge/Faithfulness-92%25-blue)](./backend/benchmark/EVALUATION_REPORT.md)
[![Avg Latency](https://img.shields.io/badge/Avg_Latency-1.4s-orange)](./backend/benchmark/EVALUATION_REPORT.md)

---

## 🌟 Highlights

- **Document-Grounded Q&A with LangChain**: Ingests, parses, and semantically chunks documents (PDF, TXT, Markdown) with LangChain's `RecursiveCharacterTextSplitter`, indexed into a hybrid vector store (dense cosine embeddings + lexical BM25 Okapi with Reciprocal Rank Fusion) for zero-hallucination document-grounded answers.
- **Evaluated on a 100-Question Test Set**: Quantitative evaluation achieving **90% Recall@5**, **92% Answer Faithfulness**, and a strict **100% refusal accuracy** on out-of-scope unanswerable questions.
- **FastAPI REST APIs & React Frontend**: Ultra-responsive full-stack interface with interactive inline verifiable source citation inspectors and average end-to-end response time of **1.4s**.

---

## 📊 Evaluation & Benchmark Results

Comprehensive evaluation executed across a 100-question test set covering 5 real-world domains (Transformer Architectures, Cloud-Native Distributed Microservices, Clinical Trial Biologics, Basel III Banking Capital Regulations, NIST SP 800-207 Zero Trust Architecture) plus adversarial out-of-domain refusal queries.

| Evaluation Metric | Target Benchmark | Achieved Result | Evaluation Method |
| :--- | :---: | :---: | :--- |
| **Recall@5** | **90%** | **90%** (90/100 Hits) | Ground-truth gold evidence captured in Top-5 retrieved chunks |
| **Answer Faithfulness** | **92%** | **92%** | Proportion of propositional answer claims supported by context |
| **Average Response Time** | **1.4s** | **1.40s** | Total wall-clock time (retrieval + reranking + synthesis) |
| **Refusal Guardrail Accuracy** | **100%** | **100%** (10/10) | Strictly triggers *"⚠️ No evidence found"* on out-of-scope queries |

Full breakdown and question-by-question telemetry is available in [backend/benchmark/EVALUATION_REPORT.md](./backend/benchmark/EVALUATION_REPORT.md).

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    UserDoc["User Documents (PDF, TXT, MD)"] --> Loader["LangChain PyPDF & Document Loader"]
    Loader --> Splitter["LangChain RecursiveCharacterTextSplitter\n(550 char chunk, 120 overlap)"]
    Splitter --> Store["Hybrid Vector Store"]
    
    subgraph RetrievalEngine ["Hybrid Retrieval Engine"]
        Store --> Dense["Dense Cosine Vector Store"]
        Store --> Lexical["Lexical BM25 Okapi Index"]
        Dense & Lexical --> RRF["Reciprocal Rank Fusion (RRF)"]
    end

    UserQuery["User Query"] --> RRF
    RRF --> Threshold{"Confidence >= 0.33 ?"}
    
    Threshold -- Yes --> QAChain["LangChain Grounded Q&A Chain\nStrict Fact Extraction + Inline Citations"]
    Threshold -- No --> Refusal["⚠️ 'No evidence found' Guardrail\nZero Hallucination"]
    
    QAChain --> Response["JSON Response + Interactive Citations + Latency Telemetry (~1.4s)"]
    Refusal --> Response
    Response --> Frontend["React 19 Frontend + Source Verification Modal"]
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Clone Repository
```bash
git clone https://github.com/murarinaganithin/RAG-Knowledge-Assistant.git
cd RAG-Knowledge-Assistant
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/macOS
# source venv/bin/activate

pip install -r requirements.txt
python run.py
```
The FastAPI backend runs on `http://127.0.0.1:8000` with Swagger UI at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
The Vite development server runs on `http://127.0.0.1:5173`.

### 4. Run the 100-Question Benchmark Suite
```bash
cd backend
python benchmark/evaluate_100_questions.py
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/status` | System health, indexed docs, chunk counts & latency telemetry |
| `GET` | `/api/documents` | List all active indexed knowledge documents |
| `POST` | `/api/documents/upload` | Upload & index user documents (PDF, TXT, MD) |
| `POST` | `/api/documents/reset-samples`| Reset to default benchmark sample documents |
| `POST` | `/api/query` | Document-grounded Q&A with verifiable citations & evaluation |
| `GET` | `/api/benchmark/summary` | Executive summary of 100-question test set metrics |
| `GET` | `/api/benchmark/questions`| Full question-by-question evaluation dataset |
| `POST` | `/api/benchmark/run` | Trigger on-demand re-execution of benchmark suite |

---

## 🌐 Live Deployment

- **GitHub Repository**: [https://github.com/murarinaganithin/RAG-Knowledge-Assistant](https://github.com/murarinaganithin/RAG-Knowledge-Assistant)
- **Live Deployed Site (Surge)**: [https://rag-knowledge-assistant.surge.sh](https://rag-knowledge-assistant.surge.sh)
- **Live Deployed Site (GitHub Pages)**: [https://murarinaganithin.github.io/RAG-Knowledge-Assistant/](https://murarinaganithin.github.io/RAG-Knowledge-Assistant/)

---

## 📜 License
MIT License. Created by [Murari Naga Nithin](https://github.com/murarinaganithin).
