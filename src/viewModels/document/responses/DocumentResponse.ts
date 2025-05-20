export interface DocumentResponse {
    id: string;
    title: string;
    description?: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    tags?: string[];
    visibility: 'private' | 'public' | 'shared';
    downloadCount: number;
    viewCount: number;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
} 