export const UPLOAD_API_PATH = "/api/graph/upload";
export const GENERATE_API_PATH = "/api/graph/create_graph/:fileId";
export const VISUALIZE_API_PATH = "/api/graph/visualize/:fileId";

export enum GraphStatus {
    DOC_UPLOADED = "document_uploaded",
    GRAPH_READY = "graph_ready"
}