import { Repository, LessThan, IsNull, DataSource } from "typeorm";
import { Permission } from "../entities/Permission";

export class PermissionRepository extends Repository<Permission> {
    constructor(dataSource: DataSource) {
        super(Permission, dataSource.manager);
    }

    async findActivePermissions(studentId: string): Promise<Permission[]> {
        const now = new Date();
        return this.find({
            where: [
                { student: { id: studentId }, isActive: true, expiresAt: LessThan(now) },
                { student: { id: studentId }, isActive: true, expiresAt: IsNull() }
            ],
            relations: ["document", "classroom"]
        });
    }

    async findDocumentPermissions(documentId: string): Promise<Permission[]> {
        return this.find({
            where: { document: { id: documentId } },
            relations: ["student"]
        });
    }

    async findClassroomPermissions(classroomId: string): Promise<Permission[]> {
        return this.find({
            where: { classroom: { id: classroomId } },
            relations: ["student"]
        });
    }

    async deactivateExpiredPermissions(): Promise<void> {
        const now = new Date();
        await this.update(
            { expiresAt: LessThan(now), isActive: true },
            { isActive: false }
        );
    }
} 