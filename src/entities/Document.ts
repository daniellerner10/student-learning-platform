import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Student } from './Student';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  fileUrl!: string;

  @Column()
  fileType!: string; // 'pdf' or 'txt'

  @Column()
  fileSize!: number; // in bytes

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column({ default: 'private' })
  visibility!: 'private' | 'public' | 'shared';

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  owner!: Student;

  @ManyToMany(() => Student)
  @JoinTable({
    name: 'document_shares',
    joinColumn: { name: 'document_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'student_id', referencedColumnName: 'id' }
  })
  sharedWith?: Student[];

  @Column({ default: 0 })
  downloadCount!: number;

  @Column({ default: 0 })
  viewCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Helper method to check if file size is within limits (1MB)
  isFileSizeValid(): boolean {
    return this.fileSize <= 1024 * 1024; // 1MB in bytes
  }
}
