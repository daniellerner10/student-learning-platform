import { StudentRepository } from '../../repositories/StudentRepository';
import { ICreateManager, IUpdateManager, IDeleteManager, IListManager } from '../interfaces/IManager';
import { CreateStudentRequest, UpdateStudentRequest } from '../../viewModels/student/requests';
import { StudentResponse } from '../../viewModels/student/responses';
import { AppError } from '../../middleware/errorHandler';
import { Student } from '../../entities/Student';
import * as bcrypt from 'bcryptjs';
import logger from '../../utils/logger';
import { AppDataSource } from '../../data-source';

export class StudentManager implements 
    ICreateManager<CreateStudentRequest, StudentResponse>,
    IUpdateManager<UpdateStudentRequest, StudentResponse>,
    IDeleteManager<{ id: string }>,
    IListManager<{}, StudentResponse> {
    
    private studentRepository: StudentRepository;

    constructor(studentRepository?: StudentRepository) {
        this.studentRepository = studentRepository || new StudentRepository(AppDataSource);
    }

    async create(request: CreateStudentRequest): Promise<StudentResponse> {
        logger.info('Creating new student with data:', { ...request, password: '[REDACTED]' });
        
        const existingStudent = await this.studentRepository.findByEmail(request.email);
        if (existingStudent) {
            logger.warn('Email already exists:', request.email);
            throw new AppError(400, 'Email already exists');
        }

        const hashedPassword = await bcrypt.hash(request.password, 10);
        const { id, ...rest } = request as any;
        const student = this.studentRepository.create({
            ...rest,
            password: hashedPassword,
            role: 'student',
            isVerified: false
        });

        logger.debug('Saving new student to repository');
        const savedStudent = (await this.studentRepository.save(student) as unknown) as Student;
        if (Array.isArray(savedStudent)) {
            logger.warn('Unexpected array response from save');
            throw new AppError(500, 'Internal server error');
        }
        logger.info('Student created successfully:', { id: savedStudent.id, email: savedStudent.email });
        
        return this.mapToResponse(savedStudent);
    }

    async update(request: UpdateStudentRequest): Promise<StudentResponse> {
        logger.info('Updating student:', request.id);
        
        const student = await this.studentRepository.findOne({ where: { id: request.id } });
        if (!student) {
            logger.warn('Student not found:', request.id);
            throw new AppError(404, 'Student not found');
        }

        if (request.email && request.email !== student.email) {
            logger.debug('Checking email availability:', request.email);
            const existingStudent = await this.studentRepository.findByEmail(request.email);
            if (existingStudent) {
                logger.warn('Email already exists:', request.email);
                throw new AppError(400, 'Email already exists');
            }
        }

        logger.debug('Saving updated student to repository');
        const updatedStudent = await this.studentRepository.save({
            ...student,
            ...request
        });
        logger.info('Student updated successfully:', { ...updatedStudent, password: '[REDACTED]' });

        return this.mapToResponse(updatedStudent);
    }

    async delete(request: { id: string }): Promise<void> {
        logger.info('Deleting student:', request.id);
        
        const student = await this.studentRepository.findOne({ where: { id: request.id } });
        if (!student) {
            logger.warn('Student not found:', request.id);
            throw new AppError(404, 'Student not found');
        }

        logger.debug('Removing student from repository');
        await this.studentRepository.remove(student);
        logger.info('Student deleted successfully:', request.id);
    }

    async list(): Promise<StudentResponse[]> {
        logger.info('Fetching all students');
        
        const students = await this.studentRepository.find();
        logger.debug('Found', students.length, 'students');
        
        return students.map(student => this.mapToResponse(student));
    }

    private mapToResponse(student: Student): StudentResponse {
        const { password, ...studentResponse } = student;
        return {
            ...studentResponse,
            firstName: studentResponse.firstName || '',
            lastName: studentResponse.lastName || '',
            barMitzvahParasha: studentResponse.barMitzvahParasha || ''
        };
    }
} 