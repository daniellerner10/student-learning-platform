export default {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "Admin",
  database: "student_learning_dev",
  synchronize: false,
  logging: true,
  entities: ["src/entities/*.ts"],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
}; 