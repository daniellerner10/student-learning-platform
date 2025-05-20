import { StudentManager } from './StudentManager';
import { StudentRepository } from '../../repositories/StudentRepository';
import { AppError } from '../../middleware/errorHandler';
import { Student } from '../../entities/Student';
import { CreateStudentRequest, UpdateStudentRequest } from '../../viewModels/student/requests';
import { StudentResponse } from '../../viewModels/student/responses';
import { FindOneOptions, DeepPartial } from 'typeorm';

// Mock the data-source
jest.mock('../../data-source');

// Mock the StudentRepository
jest.mock('../../repositories/StudentRepository');

describe('StudentManager', () => {
    let studentManager: StudentManager;
    let mockStudentRepository: jest.Mocked<StudentRepository>;
    let inMemoryStudents: Student[];    beforeEach(() => {
        jest.clearAllMocks();
        inMemoryStudents = [];
        mockStudentRepository = {
            create: jest.fn().mockImplementation((data) => ({ ...data, id: Math.random().toString() }))
        } as unknown as jest.Mocked<StudentRepository>;
        studentManager = new StudentManager(mockStudentRepository);

        mockStudentRepository.findByEmail = jest.fn((email: string) => {
            return Promise.resolve(inMemoryStudents.find(s => s.email === email));
        });

        mockStudentRepository.findOne = jest.fn((options: FindOneOptions<Student>) => {
            const where = options.where as { id?: string };
            return Promise.resolve(inMemoryStudents.find(s => s.id === where.id) || null);
        });

        mockStudentRepository.save = jest.fn((entity: any) => {
            const student = Array.isArray(entity) ? entity[0] : entity as Student;
            const existingIndex = inMemoryStudents.findIndex(s => s.id === student.id);
            if (existingIndex >= 0) {
                inMemoryStudents[existingIndex] = student;
            } else {
                inMemoryStudents.push(student);
            }
            return Promise.resolve(student);
        }) as any;

        mockStudentRepository.remove = jest.fn((entity: any) => {
            const student = Array.isArray(entity) ? entity[0] : entity as Student;
            inMemoryStudents = inMemoryStudents.filter(s => s.id !== student.id);
            return Promise.resolve(student);
        }) as any;

        mockStudentRepository.find = jest.fn(() => Promise.resolve(inMemoryStudents));
    });

    describe('create', () => {
        it('should create a new student successfully', async () => {
            const createRequest: CreateStudentRequest = {
                email: 'newstudent@example.com',
                password: 'password123',
                firstName: 'New',
                lastName: 'Student',
                barMitzvahParasha: 'Vayikra'
            };

            const result = await studentManager.create(createRequest);

            expect(mockStudentRepository.findByEmail).toHaveBeenCalledWith(createRequest.email);
            expect(mockStudentRepository.save).toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({
                email: createRequest.email,
                firstName: createRequest.firstName,
                lastName: createRequest.lastName,
                barMitzvahParasha: createRequest.barMitzvahParasha
            }));
        });

        it('should throw an error if email already exists', async () => {
            const createRequest: CreateStudentRequest = {
                email: 'existing@example.com',
                password: 'password123',
                firstName: 'Existing',
                lastName: 'Student',
                barMitzvahParasha: 'Vayikra'
            };

            const existingStudent: Student = {
                id: '1',
                email: createRequest.email,
                password: 'hashedPassword',
                firstName: 'Existing',
                lastName: 'Student',
                barMitzvahParasha: 'Vayikra',
                isVerified: false,
                role: 'student',
                createdAt: new Date(),
                updatedAt: new Date(),
                getBarMitzvahCountdown: () => 42
            };

            inMemoryStudents.push(existingStudent);

            await expect(studentManager.create(createRequest)).rejects.toThrow(AppError);
            expect(mockStudentRepository.findByEmail).toHaveBeenCalledWith(createRequest.email);
            expect(mockStudentRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should update an existing student successfully', async () => {
            const updateRequest: UpdateStudentRequest = {
                id: '1',
                firstName: 'Updated',
                lastName: 'Student',
                barMitzvahParasha: 'Vayikra'
            };

            const existingStudent: Student = {
                id: '1',
                email: 'existing@example.com',
                password: 'hashedPassword',
                firstName: 'Existing',
                lastName: 'Student',
                barMitzvahParasha: 'Vayikra',
                isVerified: false,
                role: 'student',
                createdAt: new Date(),
                updatedAt: new Date(),
                getBarMitzvahCountdown: () => 42
            };

            inMemoryStudents.push(existingStudent);

            const result = await studentManager.update(updateRequest);

            expect(mockStudentRepository.findOne).toHaveBeenCalledWith({ where: { id: updateRequest.id } });
            expect(mockStudentRepository.save).toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({
                id: updateRequest.id,
                firstName: updateRequest.firstName,
                lastName: updateRequest.lastName,
                barMitzvahParasha: updateRequest.barMitzvahParasha
            }));
        });

        it('should throw an error if student not found', async () => {
            const updateRequest: UpdateStudentRequest = {
                id: '999',
                firstName: 'Updated',
                lastName: 'Student',
                barMitzvahParasha: 'Vayikra'
            };

            await expect(studentManager.update(updateRequest)).rejects.toThrow(AppError);
            expect(mockStudentRepository.findOne).toHaveBeenCalledWith({ where: { id: updateRequest.id } });
            expect(mockStudentRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should delete an existing student successfully', async () => {
            const deleteRequest = { id: '1' };

            const existingStudent: Student = {
                id: '1',
                email: 'existing@example.com',
                password: 'hashedPassword',
                firstName: 'Existing',
                lastName: 'Student',
                barMitzvahParasha: 'Vayikra',
                isVerified: false,
                role: 'student',
                createdAt: new Date(),
                updatedAt: new Date(),
                getBarMitzvahCountdown: () => 42
            };

            inMemoryStudents.push(existingStudent);

            await studentManager.delete(deleteRequest);

            expect(mockStudentRepository.findOne).toHaveBeenCalledWith({ where: { id: deleteRequest.id } });
            expect(mockStudentRepository.remove).toHaveBeenCalledWith(existingStudent);
            expect(inMemoryStudents).not.toContainEqual(existingStudent);
        });

        it('should throw an error if student not found', async () => {
            const deleteRequest = { id: '999' };

            await expect(studentManager.delete(deleteRequest)).rejects.toThrow(AppError);
            expect(mockStudentRepository.findOne).toHaveBeenCalledWith({ where: { id: deleteRequest.id } });
            expect(mockStudentRepository.remove).not.toHaveBeenCalled();
        });
    });

    describe('list', () => {
        it('should return a list of students', async () => {
            const mockStudents: Student[] = [
                {
                    id: '1',
                    email: 'student1@example.com',
                    password: 'hashedPassword1',
                    firstName: 'Student',
                    lastName: 'One',
                    barMitzvahParasha: 'Vayikra',
                    isVerified: false,
                    role: 'student',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    getBarMitzvahCountdown: () => 42
                },
                {
                    id: '2',
                    email: 'student2@example.com',
                    password: 'hashedPassword2',
                    firstName: 'Student',
                    lastName: 'Two',
                    barMitzvahParasha: 'Vayikra',
                    isVerified: false,
                    role: 'student',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    getBarMitzvahCountdown: () => 42
                }
            ];

            inMemoryStudents.push(...mockStudents);

            const result = await studentManager.list();

            expect(mockStudentRepository.find).toHaveBeenCalled();
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(expect.objectContaining({
                id: mockStudents[0].id,
                email: mockStudents[0].email,
                firstName: mockStudents[0].firstName,
                lastName: mockStudents[0].lastName,
                barMitzvahParasha: mockStudents[0].barMitzvahParasha
            }));
            expect(result[1]).toEqual(expect.objectContaining({
                id: mockStudents[1].id,
                email: mockStudents[1].email,
                firstName: mockStudents[1].firstName,
                lastName: mockStudents[1].lastName,
                barMitzvahParasha: mockStudents[1].barMitzvahParasha
            }));
        });
    });
});