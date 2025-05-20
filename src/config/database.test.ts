import { DataSource } from 'typeorm';
import { Student } from '../entities/Student';
import { Document } from '../entities/Document';
import { Classroom } from '../entities/Classroom';
import { Permission } from '../entities/Permission';

export const TestDataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    synchronize: true,
    entities: [Student, Document, Classroom, Permission],
    logging: false
}); 