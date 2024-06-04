export const UPLOAD_API_PATH = "/api/graph/upload";
export const GENERATE_API_PATH = "/api/generate/:fileId";
//export const VISUALIZE_API_PATH = "https://run.mocky.io/v3/0d596fcc-8909-4b4b-bae3-4c0400f2fa49";
export const VISUALIZE_API_PATH = "/api/graph/:fileId";
export enum GraphStatus {
    DOC_UPLOADED = "document_uploaded",
    GRAPH_READY = "graph_ready"
}