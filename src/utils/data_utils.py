from pathlib import Path


def is_pdf(filename: str) -> bool:
    return Path(filename).suffix.lower() == ".pdf"
