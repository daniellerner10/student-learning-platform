export interface UpdateDocumentRequest {
    id: string;
    title?: string;
    description?: string;
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
    tags?: string[];
    visibility?: 'private' | 'public';
} 