import json
import os
from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader, UnstructuredWordDocumentLoader
from langchain_community.document_loaders import TextLoader
from langchain_community.document_loaders import Docx2txtLoader
from langchain_community.document_loaders import UnstructuredPowerPointLoader
from langchain_core.documents import Document

from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
    RecursiveJsonSplitter,
)


class FileHandler:

    def __init__(self, file_location: str):
        self.file_location = file_location
        self.file_loader = {
            ".pdf": (PyPDFLoader, {}),
            ".txt": (TextLoader, {}),
            ".docx": (Docx2txtLoader, {}),
            ".pptx": (
                UnstructuredPowerPointLoader,
                {"mode": "elements", "strategy": "fast", "join_docs_by_page": True}
            ),
            ".json": (RecursiveJsonSplitter, {}),
        }

        if not os.path.isfile(self.file_location):
            raise ValueError("Invalid file path.")

    def process_file_into_chunks(self):
        file_loader, kwargs = self._get_file_loader()
        if file_loader == RecursiveJsonSplitter:
            return self._get_json_chunks()
        join_docs_by_page = kwargs.pop("join_docs_by_page", False)
        loader = file_loader(self.file_location, **kwargs)
        docs = loader.load()
        splits = self._process_doc_to_chunks(docs, join_docs_by_page=join_docs_by_page)
        return splits

    @staticmethod
    def _process_doc_to_chunks(docs, join_docs_by_page: bool):
        if not docs:
            raise ValueError("Failed to load documents.")

        if join_docs_by_page:
            new_docs = []
            current_doc = Document(page_content="")
            current_page = None
            new_docs.append(current_doc)
            for doc in docs:
                if doc.page_content == "":
                    continue
                doc_current_page = doc.metadata.get("page_number", None)
                # if doc_current_page is None
                if current_page != doc_current_page and doc.metadata.get("category", None) not in ["PageBreak", None]:
                    current_doc = Document(
                        page_content=doc.page_content,
                        metadata={"page": doc_current_page - 1 if doc_current_page else "No page"}
                    )
                    current_page = doc_current_page
                    new_docs.append(current_doc)
                else:
                    current_doc.page_content += f"\n {doc.page_content}"
        else:
            new_docs = docs
        # splits text into chunks including metadata for mapping from chunk to pdf page (splits[0].metadata['page'])
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=os.getenv("CHUNK_SIZE", 1500), chunk_overlap=150
        )
        splits = text_splitter.split_documents(new_docs)
        return splits

    def _get_file_loader(self):
        _, extension = os.path.splitext(self.file_location)
        loader, kwargs = self.file_loader.get(extension)
        if loader is None:
            raise ValueError("File format does not have a loader!")
        return loader, kwargs

    def _get_json_chunks(self):
        json_data = json.loads(Path(self.file_location).read_text())
        splitter = RecursiveJsonSplitter(max_chunk_size=os.getenv("CHUNK_SIZE", 1500))
        json_chunks = splitter.create_documents(texts=[json_data])
        return json_chunks
