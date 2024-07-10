export const UPLOAD_API_PATH = '/api/graph/upload';
export const GENERATE_API_PATH = '/api/graph/create_graph/:fileId';
export const VISUALIZE_API_PATH = '/api/graph/visualize/:fileId';
export const GRAPH_LIST_API_PATH = '/api/graph/graph_jobs';
export const GRAPH_DELETE_API_PATH = '/api/graph/graph_jobs/:fileId';
export const KEYWORDS_API_PATH = '/api/graph/graph_keywords/:fileId';

export enum GraphStatus {
  DOC_UPLOADED = 'document_uploaded',
  GRAPH_READY = 'graph_ready',
}

export enum messageSeverity {
  ERROR = 'error',
  SUCCESS = 'success',
  WARNING = 'info',
  INFO = 'success',
}
