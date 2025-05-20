import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Student } from './Student';
import { Document } from './Document';
import { Classroom } from './Classroom';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  student!: Student;

  @ManyToOne(() => Document, { nullable: true, onDelete: 'CASCADE' })
  document?: Document;

  @ManyToOne(() => Classroom, { nullable: true, onDelete: 'CASCADE' })
  classroom?: Classroom;

  @Column({
    type: 'enum',
    enum: ['read', 'write', 'share', 'admin'],
    default: 'read'
  })
  level!: 'read' | 'write' | 'share' | 'admin';

  @Column({ default: false })
  isActive!: boolean;

  @Column({ nullable: true })
  expiresAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Helper method to check if permission is expired
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  // Helper method to check if permission is valid
  isValid(): boolean {
    return this.isActive && !this.isExpired();
  }
}
