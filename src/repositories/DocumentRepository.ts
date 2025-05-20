import { Repository } from "typeorm";
import { Document } from "../entities/Document";
import { AppDataSource } from "../data-source";

export class DocumentRepository extends Repository<Document> {
    constructor() {
        super(Document, AppDataSource.manager);
    }

    async findByOwner(ownerId: string): Promise<Document[]> {
        return this.find({
            where: { owner: { id: ownerId } },
            relations: ["owner", "sharedWith"]
        });
    }

    async findSharedWithStudent(studentId: string): Promise<Document[]> {
        return this.createQueryBuilder("document")
            .innerJoin("document.sharedWith", "student")
            .where("student.id = :studentId", { studentId })
            .getMany();
    }

    async findPublicDocuments(): Promise<Document[]> {
        return this.find({
            where: { visibility: "public" },
            relations: ["owner"]
        });
    }

    async incrementViewCount(id: string): Promise<void> {
        await this.update(id, { viewCount: () => "viewCount + 1" });
    }

    async incrementDownloadCount(id: string): Promise<void> {
        await this.update(id, { downloadCount: () => "downloadCount + 1" });
    }
} 