export interface UpdatePermissionRequest {
    id: string;
    level?: 'read' | 'write' | 'share' | 'admin';
    isActive?: boolean;
    expiresAt?: Date;
} 