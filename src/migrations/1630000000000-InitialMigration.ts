import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1630000000000 implements MigrationInterface {
    name = 'InitialMigration1630000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create students table
        await queryRunner.query(`
            CREATE TABLE "students" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "firstName" character varying,
                "lastName" character varying,
                "age" integer,
                "dateOfBirth" date,
                "hebrewDateOfBirth" character varying,
                "barMitzvahParasha" character varying,
                "avatarUrl" character varying,
                "isVerified" boolean NOT NULL DEFAULT false,
                "role" character varying NOT NULL DEFAULT 'student',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_students_email" UNIQUE ("email"),
                CONSTRAINT "PK_students" PRIMARY KEY ("id")
            )
        `);

        // Create documents table
        await queryRunner.query(`
            CREATE TABLE "documents" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" character varying,
                "fileUrl" character varying NOT NULL,
                "fileType" character varying NOT NULL,
                "fileSize" integer NOT NULL,
                "tags" text[],
                "visibility" character varying NOT NULL DEFAULT 'private',
                "downloadCount" integer NOT NULL DEFAULT 0,
                "viewCount" integer NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "ownerId" uuid,
                CONSTRAINT "PK_documents" PRIMARY KEY ("id"),
                CONSTRAINT "FK_documents_owner" FOREIGN KEY ("ownerId") REFERENCES "students"("id") ON DELETE CASCADE
            )
        `);

        // Create document_shares table (for many-to-many relationship)
        await queryRunner.query(`
            CREATE TABLE "document_shares" (
                "document_id" uuid NOT NULL,
                "student_id" uuid NOT NULL,
                CONSTRAINT "PK_document_shares" PRIMARY KEY ("document_id", "student_id"),
                CONSTRAINT "FK_document_shares_document" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_document_shares_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE
            )
        `);

        // Create classrooms table
        await queryRunner.query(`
            CREATE TABLE "classrooms" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "startTime" TIMESTAMP NOT NULL,
                "endTime" TIMESTAMP NOT NULL,
                "status" character varying NOT NULL DEFAULT 'scheduled',
                "maxParticipants" integer NOT NULL DEFAULT 10,
                "meetingLink" character varying,
                "isRecorded" boolean NOT NULL DEFAULT false,
                "recordingUrl" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "instructorId" uuid,
                CONSTRAINT "PK_classrooms" PRIMARY KEY ("id"),
                CONSTRAINT "FK_classrooms_instructor" FOREIGN KEY ("instructorId") REFERENCES "students"("id") ON DELETE CASCADE
            )
        `);

        // Create classroom_participants table
        await queryRunner.query(`
            CREATE TABLE "classroom_participants" (
                "classroom_id" uuid NOT NULL,
                "student_id" uuid NOT NULL,
                CONSTRAINT "PK_classroom_participants" PRIMARY KEY ("classroom_id", "student_id"),
                CONSTRAINT "FK_classroom_participants_classroom" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_classroom_participants_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE
            )
        `);

        // Create classroom_resources table
        await queryRunner.query(`
            CREATE TABLE "classroom_resources" (
                "classroom_id" uuid NOT NULL,
                "document_id" uuid NOT NULL,
                CONSTRAINT "PK_classroom_resources" PRIMARY KEY ("classroom_id", "document_id"),
                CONSTRAINT "FK_classroom_resources_classroom" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_classroom_resources_document" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE
            )
        `);

        // Create permissions table
        await queryRunner.query(`
            CREATE TYPE "permission_level_enum" AS ENUM ('read', 'write', 'share', 'admin')
        `);

        await queryRunner.query(`
            CREATE TABLE "permissions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "level" "permission_level_enum" NOT NULL DEFAULT 'read',
                "isActive" boolean NOT NULL DEFAULT false,
                "expiresAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "studentId" uuid NOT NULL,
                "documentId" uuid,
                "classroomId" uuid,
                CONSTRAINT "PK_permissions" PRIMARY KEY ("id"),
                CONSTRAINT "FK_permissions_student" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_permissions_document" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_permissions_classroom" FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE CASCADE
            )
        `);

        // Create indexes for better query performance
        await queryRunner.query(`CREATE INDEX "IDX_documents_owner" ON "documents" ("ownerId")`);
        await queryRunner.query(`CREATE INDEX "IDX_classrooms_instructor" ON "classrooms" ("instructorId")`);
        await queryRunner.query(`CREATE INDEX "IDX_permissions_student" ON "permissions" ("studentId")`);
        await queryRunner.query(`CREATE INDEX "IDX_permissions_document" ON "permissions" ("documentId")`);
        await queryRunner.query(`CREATE INDEX "IDX_permissions_classroom" ON "permissions" ("classroomId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_permissions_classroom"`);
        await queryRunner.query(`DROP INDEX "IDX_permissions_document"`);
        await queryRunner.query(`DROP INDEX "IDX_permissions_student"`);
        await queryRunner.query(`DROP INDEX "IDX_classrooms_instructor"`);
        await queryRunner.query(`DROP INDEX "IDX_documents_owner"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "permissions"`);
        await queryRunner.query(`DROP TYPE "permission_level_enum"`);
        await queryRunner.query(`DROP TABLE "classroom_resources"`);
        await queryRunner.query(`DROP TABLE "classroom_participants"`);
        await queryRunner.query(`DROP TABLE "classrooms"`);
        await queryRunner.query(`DROP TABLE "document_shares"`);
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TABLE "students"`);
    }
}
