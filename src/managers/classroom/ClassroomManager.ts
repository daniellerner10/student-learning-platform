import { ClassroomRepository } from '../../repositories/ClassroomRepository';
import { ICreateManager, IUpdateManager, IDeleteManager, IListManager } from '../interfaces/IManager';
import { CreateClassroomRequest, UpdateClassroomRequest } from '../../viewModels/classroom/requests';
import { ClassroomResponse } from '../../viewModels/classroom/responses';
import { AppError } from '../../middleware/errorHandler';
import { Classroom } from '../../entities/Classroom';
import logger from '../../utils/logger';
import { AppDataSource } from '../../data-source';

export class ClassroomManager implements 
    ICreateManager<CreateClassroomRequest, ClassroomResponse>,
    IUpdateManager<UpdateClassroomRequest, ClassroomResponse>,
    IDeleteManager<{ id: string }>,
    IListManager<{}, ClassroomResponse> {
    
    private classroomRepository: ClassroomRepository;

    constructor(classroomRepository?: ClassroomRepository) {
        this.classroomRepository = classroomRepository || new ClassroomRepository(AppDataSource);
    }

    async create(request: CreateClassroomRequest): Promise<ClassroomResponse> {
        logger.info('Creating new classroom with data:', request);
        // Remove id if present in request
        const { id, ...rest } = request as any;
        const classroom = this.classroomRepository.create({
            ...rest
        });
        logger.debug('Saving new classroom to repository');
        const savedClassroom = (await this.classroomRepository.save(classroom) as unknown) as Classroom;
        if (Array.isArray(savedClassroom)) {
            logger.warn('Unexpected array response from save');
            throw new AppError(500, 'Internal server error');
        }
        logger.info('Classroom created successfully:', savedClassroom);
        return this.mapToResponse(savedClassroom);
    }

    async update(request: UpdateClassroomRequest): Promise<ClassroomResponse> {
        logger.info('Updating classroom:', request.id);
        
        const classroom = await this.classroomRepository.findOne({ where: { id: request.id } });
        if (!classroom) {
            logger.warn('Classroom not found:', request.id);
            throw new AppError(404, 'Classroom not found');
        }

        logger.debug('Saving updated classroom to repository');
        const updatedClassroom = await this.classroomRepository.save({
            ...classroom,
            ...request
        });
        logger.info('Classroom updated successfully:', updatedClassroom);

        return this.mapToResponse(updatedClassroom);
    }

    async delete(request: { id: string }): Promise<void> {
        logger.info('Deleting classroom:', request.id);
        
        const classroom = await this.classroomRepository.findOne({ where: { id: request.id } });
        if (!classroom) {
            logger.warn('Classroom not found:', request.id);
            throw new AppError(404, 'Classroom not found');
        }

        logger.debug('Removing classroom from repository');
        await this.classroomRepository.remove(classroom);
        logger.info('Classroom deleted successfully:', request.id);
    }

    async list(): Promise<ClassroomResponse[]> {
        logger.info('Fetching all classrooms');
        
        const classrooms = await this.classroomRepository.find();
        logger.debug('Found', classrooms.length, 'classrooms');
        
        return classrooms.map(classroom => this.mapToResponse(classroom));
    }

    private mapToResponse(classroom: Classroom): ClassroomResponse {
        return {
            id: classroom.id,
            name: classroom.name,
            description: classroom.description,
            startTime: classroom.startTime,
            endTime: classroom.endTime,
            status: classroom.status,
            maxParticipants: classroom.maxParticipants,
            instructorId: classroom.instructor?.id || '',
            meetingLink: classroom.meetingLink,
            isRecorded: classroom.isRecorded,
            recordingUrl: classroom.recordingUrl,
            createdAt: classroom.createdAt,
            updatedAt: classroom.updatedAt
        };
    }
}