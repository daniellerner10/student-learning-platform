export interface CreateDocumentRequest {
    title: string;
    description?: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    tags?: string[];
    visibility?: 'private' | 'public';
    ownerId: string;
} 