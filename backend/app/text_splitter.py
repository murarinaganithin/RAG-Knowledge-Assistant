from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document


def split_documents(
    docs: List[Document],
    chunk_size: int = 600,
    chunk_overlap: int = 120
) -> List[Document]:
    """
    Splits LangChain Document objects into smaller semantic chunks
    using LangChain's RecursiveCharacterTextSplitter.
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
        length_function=len
    )

    split_chunks = text_splitter.split_documents(docs)

    # Augment each chunk with chunk_id and index
    augmented_chunks: List[Document] = []
    for idx, chunk in enumerate(split_chunks, start=1):
        meta = dict(chunk.metadata)
        meta["chunk_id"] = f"{meta.get('filename', 'doc')}-c{idx}"
        meta["chunk_index"] = idx
        meta["char_length"] = len(chunk.page_content)
        meta["estimated_tokens"] = len(chunk.page_content) // 4
        
        augmented_chunks.append(
            Document(
                page_content=chunk.page_content,
                metadata=meta
            )
        )

    return augmented_chunks
