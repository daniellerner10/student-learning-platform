import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Student } from './Student';
import { Document } from './Document';

@Entity('classrooms')
export class Classroom {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  startTime!: Date;

  @Column()
  endTime!: Date;

  @Column({ default: 'scheduled' })
  status!: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

  @Column({ default: 10 })
  maxParticipants!: number;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  instructor!: Student;

  @ManyToMany(() => Student)
  @JoinTable({
    name: 'classroom_participants',
    joinColumn: { name: 'classroom_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'student_id', referencedColumnName: 'id' }
  })
  participants?: Student[];

  @ManyToMany(() => Document)
  @JoinTable({
    name: 'classroom_resources',
    joinColumn: { name: 'classroom_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'document_id', referencedColumnName: 'id' }
  })
  resources?: Document[];

  @Column({ nullable: true })
  meetingLink?: string;

  @Column({ default: false })
  isRecorded!: boolean;

  @Column({ nullable: true })
  recordingUrl?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Helper method to check if classroom is full
  isFull(): boolean {
    return (this.participants ?? []).length >= this.maxParticipants;
  }

  // Helper method to check if classroom is currently active
  isActive(): boolean {
    const now = new Date();
    return now >= this.startTime && now <= this.endTime;
  }
}
