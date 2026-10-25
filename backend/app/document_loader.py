from pathlib import Path
from typing import List, Dict, Any
from langchain_core.documents import Document
from pypdf import PdfReader


def load_text_document(file_path: Path, category: str = "General") -> List[Document]:
    """Loads a plaintext or markdown file into LangChain Documents."""
    text = file_path.read_text(encoding="utf-8", errors="replace")
    return [
        Document(
            page_content=text,
            metadata={
                "source": file_path.name,
                "filename": file_path.name,
                "page": 1,
                "category": category,
                "file_type": file_path.suffix.lstrip(".").lower()
            }
        )
    ]


def load_pdf_document(file_path: Path, category: str = "General") -> List[Document]:
    """Loads a PDF file page by page into LangChain Documents."""
    reader = PdfReader(str(file_path))
    docs: List[Document] = []
    for page_idx, page in enumerate(reader.pages, start=1):
        page_text = page.extract_text() or ""
        if page_text.strip():
            docs.append(
                Document(
                    page_content=page_text,
                    metadata={
                        "source": file_path.name,
                        "filename": file_path.name,
                        "page": page_idx,
                        "category": category,
                        "file_type": "pdf"
                    }
                )
            )
    return docs


def load_document(file_path: Path, category: str = "General") -> List[Document]:
    """Universal loader dispatch based on file extension."""
    suffix = file_path.suffix.lower()
    if suffix == ".pdf":
        return load_pdf_document(file_path, category=category)
    else:
        return load_text_document(file_path, category=category)
