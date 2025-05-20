import "reflect-metadata";
import { DataSource } from "typeorm";
import { Student } from "./entities/Student";
import { Document } from "./entities/Document";
import { Classroom } from "./entities/Classroom";
import { Permission } from "./entities/Permission";

const env = process.env.NODE_ENV || "development";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require(`./config/database.${env}`).default;

export const AppDataSource = new DataSource({
  ...config,
  entities: [Student, Document, Classroom, Permission], // override if needed
});