import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';


@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  age?: number;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ nullable: true })
  hebrewDateOfBirth?: string;

  @Column({ nullable: true })
  barMitzvahParasha?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ default: 'student' })
  role!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Helper method to calculate Bar Mitzvah countdown
  getBarMitzvahCountdown(): number | null {
    if (!this.dateOfBirth) {
      return null;
    }
    
    // Calculate 13 years from date of birth
    const barMitzvahDate = new Date(this.dateOfBirth);
    barMitzvahDate.setFullYear(barMitzvahDate.getFullYear() + 13);
    
    // Calculate days remaining
    const today = new Date();
    const diffTime = barMitzvahDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }
}