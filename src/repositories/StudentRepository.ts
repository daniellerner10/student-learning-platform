import { Repository, DataSource } from "typeorm";
import { Student } from "../entities/Student";

export class StudentRepository extends Repository<Student> {
    constructor(dataSource: DataSource) {
        super(Student, dataSource.manager);
    }

    async findByEmail(email: string): Promise<Student | undefined> {
        const result = await this.findOne({ where: { email } });
        return result ?? undefined;
    }

    async findWithDocuments(id: string): Promise<Student | undefined> {
        const result = await this.findOne({
            where: { id },
            relations: ["documents"]
        });
        return result ?? undefined;
    }

    async findWithClassrooms(id: string): Promise<Student | undefined> {
        const result = await this.findOne({
            where: { id },
            relations: ["classrooms"]
        });
        return result ?? undefined;
    }

    async findWithPermissions(id: string): Promise<Student | undefined> {
        const result = await this.findOne({
            where: { id },
            relations: ["permissions"]
        });
        return result ?? undefined;
    }
}
