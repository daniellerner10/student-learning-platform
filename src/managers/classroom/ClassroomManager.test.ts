import { ClassroomManager } from './ClassroomManager';
import { ClassroomRepository } from '../../repositories/ClassroomRepository';
import { AppError } from '../../middleware/errorHandler';
import { Classroom } from '../../entities/Classroom';
import { CreateClassroomRequest, UpdateClassroomRequest } from '../../viewModels/classroom/requests';
import { FindOneOptions } from 'typeorm';

// Mock the data-source
jest.mock('../../data-source');

// Mock the ClassroomRepository
jest.mock('../../repositories/ClassroomRepository');

describe('ClassroomManager', () => {
    let classroomManager: ClassroomManager;
    let mockClassroomRepository: jest.Mocked<ClassroomRepository>;
    let inMemoryClassrooms: Classroom[];

    beforeEach(() => {
        jest.clearAllMocks();
        inMemoryClassrooms = [];        mockClassroomRepository = {
            create: jest.fn().mockImplementation((data) => ({ ...data, id: Math.random().toString() }))
        } as unknown as jest.Mocked<ClassroomRepository>;
        classroomManager = new ClassroomManager(mockClassroomRepository);

        mockClassroomRepository.findOne = jest.fn((options: FindOneOptions<Classroom>) => {
            const where = options.where as { id?: string };
            return Promise.resolve(inMemoryClassrooms.find(c => c.id === where.id) || null);
        });

        mockClassroomRepository.save = jest.fn((entity: any) => {
            const classroom = Array.isArray(entity) ? entity[0] : entity as Classroom;
            const existingIndex = inMemoryClassrooms.findIndex(c => c.id === classroom.id);
            if (existingIndex >= 0) {
                inMemoryClassrooms[existingIndex] = classroom;
            } else {
                inMemoryClassrooms.push(classroom);
            }
            return Promise.resolve(classroom);
        });

        mockClassroomRepository.remove = jest.fn((entity: any) => {
            const classroom = Array.isArray(entity) ? entity[0] : entity as Classroom;
            inMemoryClassrooms = inMemoryClassrooms.filter(c => c.id !== classroom.id);
            return Promise.resolve(classroom);
        });

        mockClassroomRepository.find = jest.fn(() => Promise.resolve(inMemoryClassrooms));
    });

    describe('create', () => {
        it('should create a new classroom successfully', async () => {
            const createRequest: CreateClassroomRequest = {
                name: 'Test Classroom',
                description: 'Test Description',
                startTime: new Date('2025-06-01T10:00:00'),
                endTime: new Date('2025-06-01T11:00:00'),
                instructorId: '1',
                maxParticipants: 10
            };

            const result = await classroomManager.create(createRequest);

            expect(mockClassroomRepository.create).toHaveBeenCalled();
            expect(mockClassroomRepository.save).toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({
                name: createRequest.name,
                description: createRequest.description,
                startTime: createRequest.startTime,
                endTime: createRequest.endTime,
                maxParticipants: createRequest.maxParticipants
            }));
        });
    });

    describe('update', () => {
        it('should update an existing classroom successfully', async () => {
            const existingClassroom: Classroom = {
                id: '1',
                name: 'Original Name',
                description: 'Original Description',
                startTime: new Date('2025-06-01T10:00:00'),
                endTime: new Date('2025-06-01T11:00:00'),
                status: 'scheduled',
                maxParticipants: 10,
                instructor: { id: '1' } as any,
                isRecorded: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                isFull: () => false,
                isActive: () => false
            };

            inMemoryClassrooms.push(existingClassroom);

            const updateRequest: UpdateClassroomRequest = {
                id: '1',
                name: 'Updated Name',
                description: 'Updated Description'
            };

            const result = await classroomManager.update(updateRequest);

            expect(mockClassroomRepository.findOne).toHaveBeenCalledWith({ where: { id: updateRequest.id } });
            expect(mockClassroomRepository.save).toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({
                id: updateRequest.id,
                name: updateRequest.name,
                description: updateRequest.description
            }));
        });

        it('should throw an error if classroom not found', async () => {
            const updateRequest: UpdateClassroomRequest = {
                id: '999',
                name: 'Updated Name'
            };

            await expect(classroomManager.update(updateRequest)).rejects.toThrow(AppError);
            expect(mockClassroomRepository.findOne).toHaveBeenCalledWith({ where: { id: updateRequest.id } });
            expect(mockClassroomRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should delete an existing classroom successfully', async () => {
            const existingClassroom: Classroom = {
                id: '1',
                name: 'Test Classroom',
                description: 'Test Description',
                startTime: new Date('2025-06-01T10:00:00'),
                endTime: new Date('2025-06-01T11:00:00'),
                status: 'scheduled',
                maxParticipants: 10,
                instructor: { id: '1' } as any,
                isRecorded: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                isFull: () => false,
                isActive: () => false
            };

            inMemoryClassrooms.push(existingClassroom);

            await classroomManager.delete({ id: '1' });

            expect(mockClassroomRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(mockClassroomRepository.remove).toHaveBeenCalledWith(existingClassroom);
            expect(inMemoryClassrooms).not.toContainEqual(existingClassroom);
        });

        it('should throw an error if classroom not found', async () => {
            await expect(classroomManager.delete({ id: '999' })).rejects.toThrow(AppError);
            expect(mockClassroomRepository.findOne).toHaveBeenCalledWith({ where: { id: '999' } });
            expect(mockClassroomRepository.remove).not.toHaveBeenCalled();
        });
    });

    describe('list', () => {
        it('should return a list of classrooms', async () => {
            const mockClassrooms: Classroom[] = [
                {
                    id: '1',
                    name: 'Classroom 1',
                    description: 'Description 1',
                    startTime: new Date('2025-06-01T10:00:00'),
                    endTime: new Date('2025-06-01T11:00:00'),
                    status: 'scheduled',
                    maxParticipants: 10,
                    instructor: { id: '1' } as any,
                    isRecorded: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isFull: () => false,
                    isActive: () => false
                },
                {
                    id: '2',
                    name: 'Classroom 2',
                    description: 'Description 2',
                    startTime: new Date('2025-06-02T10:00:00'),
                    endTime: new Date('2025-06-02T11:00:00'),
                    status: 'scheduled',
                    maxParticipants: 10,
                    instructor: { id: '1' } as any,
                    isRecorded: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isFull: () => false,
                    isActive: () => false
                }
            ];

            inMemoryClassrooms.push(...mockClassrooms);

            const result = await classroomManager.list();

            expect(mockClassroomRepository.find).toHaveBeenCalled();
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(expect.objectContaining({
                id: mockClassrooms[0].id,
                name: mockClassrooms[0].name,
                description: mockClassrooms[0].description
            }));
            expect(result[1]).toEqual(expect.objectContaining({
                id: mockClassrooms[1].id,
                name: mockClassrooms[1].name,
                description: mockClassrooms[1].description
            }));
        });
    });
});
