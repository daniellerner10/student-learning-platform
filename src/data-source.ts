import "reflect-metadata";
import { DataSource } from "typeorm";
import { Student } from "./entities/Student";
import { Document } from "./entities/Document";
import { Classroom } from "./entities/Classroom";
import { Permission } from "./entities/Permission";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Define the AppDataSource
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "student_learning_dev",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [Student, Document, Classroom, Permission],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
});