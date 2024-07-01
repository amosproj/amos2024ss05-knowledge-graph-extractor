import json
import os
from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader
from langchain_community.document_loaders import TextLoader
from langchain_community.document_loaders import Docx2txtLoader
from langchain_community.document_loaders import UnstructuredPowerPointLoader

from langchain_text_splitters import RecursiveCharacterTextSplitter, RecursiveJsonSplitter


class FileHandler:

    def __init__(self, file_location: str):
        self.file_location = file_location
        self.file_loader = {
            ".pdf": PyPDFLoader,
            ".txt": TextLoader,
            ".docx": Docx2txtLoader,
            ".pptx": UnstructuredPowerPointLoader,
            ".json": RecursiveJsonSplitter,
        }

        if not os.path.isfile(self.file_location):
            raise ValueError("Invalid file path.")

    def process_file_into_chunks(self):
        file_loader = self._get_file_loader()
        if file_loader == RecursiveJsonSplitter:
            return self._get_json_chunks()
        loader = file_loader(self.file_location)
        docs = loader.load()
        splits = self._process_doc_to_chunks(docs)
        return splits

    @staticmethod
    def _process_doc_to_chunks(docs):
        if not docs:
            raise ValueError("Failed to load documents.")

        # splits text into chunks including metadata for mapping from chunk to pdf page (splits[0].metadata['page'])
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=os.getenv("CHUNK_SIZE", 1500), chunk_overlap=150)
        splits = text_splitter.split_documents(docs)
        return splits

    def _get_file_loader(self):
        _, extension = os.path.splitext(self.file_location)
        loader = self.file_loader.get(extension)
        if loader is None:
            raise ValueError("File format does not have a loader!")
        return loader

    def _get_json_chunks(self):
        json_data = json.loads(Path(self.file_location).read_text())
        splitter = RecursiveJsonSplitter(max_chunk_size=os.getenv("CHUNK_SIZE", 1500))
        json_chunks = splitter.create_documents(texts=[json_data])
        return json_chunks

