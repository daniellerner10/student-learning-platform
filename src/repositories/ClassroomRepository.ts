import { Repository, Between, DataSource } from "typeorm";
import { Classroom } from "../entities/Classroom";

export class ClassroomRepository extends Repository<Classroom> {    constructor(dataSource: DataSource) {
        super(Classroom, dataSource.manager);
    }

    async findByInstructor(instructorId: string): Promise<Classroom[]> {
        return this.find({
            where: { instructor: { id: instructorId } },
            relations: ["instructor", "participants", "resources"]
        });
    }

    async findActiveClassrooms(): Promise<Classroom[]> {
        const now = new Date();
        return this.find({
            where: {
                startTime: Between(now, new Date(now.getTime() + 24 * 60 * 60 * 1000)),
                status: "scheduled"
            },
            relations: ["instructor", "participants"]
        });
    }

    async findWithParticipants(id: string): Promise<Classroom | undefined> {
        const result = await this.findOne({
            where: { id },
            relations: ["participants", "instructor", "resources"]
        });
        return result ?? undefined;
    }

    async findUpcomingClassrooms(studentId: string): Promise<Classroom[]> {
        const now = new Date();
        return this.createQueryBuilder("classroom")
            .innerJoin("classroom.participants", "student")
            .where("student.id = :studentId", { studentId })
            .andWhere("classroom.startTime > :now", { now })
            .andWhere("classroom.status = :status", { status: "scheduled" })
            .getMany();
    }
} 