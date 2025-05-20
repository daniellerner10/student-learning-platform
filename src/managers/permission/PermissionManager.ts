import { PermissionRepository } from '../../repositories/PermissionRepository';
import { ICreateManager, IUpdateManager, IDeleteManager, IListManager } from '../interfaces/IManager';
import { CreatePermissionRequest, UpdatePermissionRequest } from '../../viewModels/permission/requests';
import { PermissionResponse } from '../../viewModels/permission/responses';
import { AppError } from '../../middleware/errorHandler';
import { Permission } from '../../entities/Permission';
import logger from '../../utils/logger';
import { AppDataSource } from '../../data-source';

export class PermissionManager implements 
    ICreateManager<CreatePermissionRequest, PermissionResponse>,
    IUpdateManager<UpdatePermissionRequest, PermissionResponse>,
    IDeleteManager<{ id: string }>,
    IListManager<{}, PermissionResponse> {
    
    private permissionRepository: PermissionRepository;

    constructor(permissionRepository?: PermissionRepository) {
        this.permissionRepository = permissionRepository || new PermissionRepository(AppDataSource);
    }

    async create(request: CreatePermissionRequest): Promise<PermissionResponse> {
        logger.info('Creating new permission with data:', request);        // Remove id if present in request
        const { id, studentId, documentId, classroomId, ...rest } = request as any;
        const permission = this.permissionRepository.create({
            student: studentId ? { id: studentId } : undefined,
            document: documentId ? { id: documentId } : undefined,
            classroom: classroomId ? { id: classroomId } : undefined,
            ...rest
        });
        logger.debug('Saving new permission to repository');
        const savedPermission = (await this.permissionRepository.save(permission) as unknown) as Permission;
        if (Array.isArray(savedPermission)) {
            logger.warn('Unexpected array response from save');
            throw new AppError(500, 'Internal server error');
        }
        logger.info('Permission created successfully:', savedPermission);
        return this.mapToResponse(savedPermission);
    }

    async update(request: UpdatePermissionRequest): Promise<PermissionResponse> {
        logger.info('Updating permission:', request.id);
        
        const permission = await this.permissionRepository.findOne({ where: { id: request.id } });
        if (!permission) {
            logger.warn('Permission not found:', request.id);
            throw new AppError(404, 'Permission not found');
        }

        logger.debug('Saving updated permission to repository');
        const updatedPermission = await this.permissionRepository.save({
            ...permission,
            ...request
        });
        logger.info('Permission updated successfully:', updatedPermission);

        return this.mapToResponse(updatedPermission);
    }

    async delete(request: { id: string }): Promise<void> {
        logger.info('Deleting permission:', request.id);
        
        const permission = await this.permissionRepository.findOne({ where: { id: request.id } });
        if (!permission) {
            logger.warn('Permission not found:', request.id);
            throw new AppError(404, 'Permission not found');
        }

        logger.debug('Removing permission from repository');
        await this.permissionRepository.remove(permission);
        logger.info('Permission deleted successfully:', request.id);
    }

    async list(): Promise<PermissionResponse[]> {
        logger.info('Fetching all permissions');
        
        const permissions = await this.permissionRepository.find();
        logger.debug('Found', permissions.length, 'permissions');
        
        return permissions.map(permission => this.mapToResponse(permission));
    }

    private mapToResponse(permission: Permission): PermissionResponse {
        return {
            id: permission.id,
            level: permission.level,
            isActive: permission.isActive,
            expiresAt: permission.expiresAt,
            studentId: permission.student?.id || '',
            documentId: permission.document?.id,
            classroomId: permission.classroom?.id,
            createdAt: permission.createdAt,
            updatedAt: permission.updatedAt
        };
    }
}