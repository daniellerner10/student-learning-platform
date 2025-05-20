export interface PermissionResponse {
    id: string;
    level: 'read' | 'write' | 'share' | 'admin';
    isActive: boolean;
    expiresAt?: Date;
    studentId: string;
    documentId?: string;
    classroomId?: string;
    createdAt: Date;
    updatedAt: Date;
} 