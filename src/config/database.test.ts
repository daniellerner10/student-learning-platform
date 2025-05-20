export default {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "test_password",
  database: "student_learning_test",
  synchronize: true,
  logging: false,
  entities: ["src/entities/*.ts"],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
}; 