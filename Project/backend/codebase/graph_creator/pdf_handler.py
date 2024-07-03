import os

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter


def process_pdf_into_chunks(filename):
    """
    Takes pdf file, and converts it into text chunks of equal length

    Parameters
    ----------
    filename : str
        The name of the pdf file to be processed

    Returns
    -------
    list
        a list of strings that are the chunks of the pdf converted to text
    """

    # load pdf
    if not os.path.isfile(filename):
        raise ValueError("Invalid PDF file path.")
    if not filename.endswith(".pdf"):
        raise ValueError("File is not a PDF.")
    loader = PyPDFLoader(filename)
    docs = loader.load()

    if not docs:
        raise ValueError("Failed to load PDF documents.")

    # splits text into chunks including metadata for mapping from chunk to pdf page (splits[0].metadata['page'])
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=os.getenv("CHUNK_SIZE", 1500), chunk_overlap=150
    )
    splits = text_splitter.split_documents(docs)

    return splits
