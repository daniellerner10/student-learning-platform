export interface CreatePermissionRequest {
    level: 'read' | 'write' | 'share' | 'admin';
    isActive?: boolean;
    expiresAt?: Date;
    studentId: string;
    documentId?: string;
    classroomId?: string;
} 