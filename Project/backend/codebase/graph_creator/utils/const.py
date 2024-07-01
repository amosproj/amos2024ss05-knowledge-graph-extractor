from enum import StrEnum


class GraphStatus(StrEnum):
    DOC_UPLOADED = "document_uploaded"
    GRAPH_READY = "graph_ready"


class AllowedUploadFileFormat(StrEnum):
    PDF = "application/pdf"
    TXT = "text/plain"
    PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    JSON = "application/json"

    @classmethod
    def get_list_of_formats(cls) -> list:
        return [str(file_format) for file_format in cls]
