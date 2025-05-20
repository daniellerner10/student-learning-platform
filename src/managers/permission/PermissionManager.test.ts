import { PermissionManager } from './PermissionManager';
import { PermissionRepository } from '../../repositories/PermissionRepository';
import { AppError } from '../../middleware/errorHandler';
import { Permission } from '../../entities/Permission';
import { CreatePermissionRequest, UpdatePermissionRequest } from '../../viewModels/permission/requests';
import { FindOneOptions } from 'typeorm';

// Mock the data-source
jest.mock('../../data-source');

// Mock the PermissionRepository
jest.mock('../../repositories/PermissionRepository');

describe('PermissionManager', () => {
    let permissionManager: PermissionManager;
    let mockPermissionRepository: jest.Mocked<PermissionRepository>;
    let inMemoryPermissions: Permission[];

    beforeEach(() => {
        jest.clearAllMocks();
        inMemoryPermissions = [];

        mockPermissionRepository = {
            create: jest.fn().mockImplementation((data) => {
                const permission = {
                    id: Math.random().toString(),
                    student: data.student ? { id: data.student.id } : null,
                    document: data.document ? { id: data.document.id } : null,
                    classroom: data.classroom ? { id: data.classroom.id } : null,
                    level: data.level,
                    isActive: data.isActive,
                    expiresAt: data.expiresAt,
                    isExpired: () => false,
                    isValid: () => true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                } as Permission;
                return permission;
            }),
            findOne: jest.fn().mockImplementation((options: FindOneOptions<Permission>) => {
                const where = options.where as { id?: string };
                const found = inMemoryPermissions.find(p => p.id === where.id);
                return Promise.resolve(found || null);
            }),
            save: jest.fn().mockImplementation((entity: any) => {
                const permission = Array.isArray(entity) ? entity[0] : entity as Permission;
                const existingIndex = inMemoryPermissions.findIndex(p => p.id === permission.id);
                if (existingIndex >= 0) {
                    inMemoryPermissions[existingIndex] = permission;
                } else {
                    inMemoryPermissions.push(permission);
                }
                return Promise.resolve(permission);
            }),
            remove: jest.fn().mockImplementation((entity: any) => {
                const permission = Array.isArray(entity) ? entity[0] : entity as Permission;
                inMemoryPermissions = inMemoryPermissions.filter(p => p.id !== permission.id);
                return Promise.resolve(permission);
            }),
            find: jest.fn().mockImplementation(() => Promise.resolve(inMemoryPermissions))
        } as unknown as jest.Mocked<PermissionRepository>;

        permissionManager = new PermissionManager(mockPermissionRepository);
    });

    describe('create', () => {
        it('should create a new permission successfully', async () => {
            const createRequest: CreatePermissionRequest = {
                studentId: '1',
                documentId: '2',
                level: 'read',
                isActive: true,
                expiresAt: new Date('2025-12-31')
            };

            const result = await permissionManager.create(createRequest);

            expect(mockPermissionRepository.create).toHaveBeenCalledWith({
                student: { id: createRequest.studentId },
                document: { id: createRequest.documentId },
                level: createRequest.level,
                isActive: createRequest.isActive,
                expiresAt: createRequest.expiresAt
            });
            expect(mockPermissionRepository.save).toHaveBeenCalled();
            expect(result).toMatchObject({
                studentId: createRequest.studentId,
                documentId: createRequest.documentId,
                level: createRequest.level,
                isActive: createRequest.isActive,
                expiresAt: createRequest.expiresAt
            });
        });
    });

    describe('update', () => {
        it('should update an existing permission successfully', async () => {
            const existingPermission: Permission = {
                id: '1',
                student: { id: '1' } as any,
                document: { id: '2' } as any,
                level: 'read',
                isActive: true,
                expiresAt: new Date('2025-12-31'),
                isExpired: () => false,
                isValid: () => true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            inMemoryPermissions.push(existingPermission);

            const updateRequest: UpdatePermissionRequest = {
                id: '1',
                level: 'write',
                isActive: true
            };

            const result = await permissionManager.update(updateRequest);

            expect(mockPermissionRepository.findOne).toHaveBeenCalledWith({ where: { id: updateRequest.id } });
            expect(mockPermissionRepository.save).toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({
                id: updateRequest.id,
                level: updateRequest.level,
                isActive: updateRequest.isActive
            }));
        });

        it('should throw an error if permission not found', async () => {
            const updateRequest: UpdatePermissionRequest = {
                id: '999',
                level: 'write'
            };

            await expect(permissionManager.update(updateRequest)).rejects.toThrow(AppError);
            expect(mockPermissionRepository.findOne).toHaveBeenCalledWith({ where: { id: updateRequest.id } });
            expect(mockPermissionRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should delete an existing permission successfully', async () => {
            const existingPermission: Permission = {
                id: '1',
                student: { id: '1' } as any,
                document: { id: '2' } as any,
                level: 'read',
                isActive: true,
                expiresAt: new Date('2025-12-31'),
                isExpired: () => false,
                isValid: () => true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            inMemoryPermissions.push(existingPermission);

            await permissionManager.delete({ id: '1' });

            expect(mockPermissionRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(mockPermissionRepository.remove).toHaveBeenCalledWith(existingPermission);
            expect(inMemoryPermissions).not.toContainEqual(existingPermission);
        });

        it('should throw an error if permission not found', async () => {
            await expect(permissionManager.delete({ id: '999' })).rejects.toThrow(AppError);
            expect(mockPermissionRepository.findOne).toHaveBeenCalledWith({ where: { id: '999' } });
            expect(mockPermissionRepository.remove).not.toHaveBeenCalled();
        });
    });

    describe('list', () => {
        it('should return a list of permissions', async () => {
            const mockPermissions: Permission[] = [
                {
                    id: '1',
                    student: { id: '1' } as any,
                    document: { id: '2' } as any,
                    level: 'read',
                    isActive: true,
                    expiresAt: new Date('2025-12-31'),
                    isExpired: () => false,
                    isValid: () => true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: '2',
                    student: { id: '2' } as any,
                    classroom: { id: '3' } as any,
                    level: 'write',
                    isActive: true,
                    expiresAt: new Date('2025-12-31'),
                    isExpired: () => false,
                    isValid: () => true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            inMemoryPermissions.push(...mockPermissions);

            const result = await permissionManager.list();

            expect(mockPermissionRepository.find).toHaveBeenCalled();
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(expect.objectContaining({
                id: mockPermissions[0].id,
                studentId: mockPermissions[0].student?.id,
                documentId: mockPermissions[0].document?.id,
                level: mockPermissions[0].level,
                isActive: mockPermissions[0].isActive,
                expiresAt: mockPermissions[0].expiresAt
            }));
            expect(result[1]).toEqual(expect.objectContaining({
                id: mockPermissions[1].id,
                studentId: mockPermissions[1].student?.id,
                classroomId: mockPermissions[1].classroom?.id,
                level: mockPermissions[1].level,
                isActive: mockPermissions[1].isActive,
                expiresAt: mockPermissions[1].expiresAt
            }));
        });
    });
});
