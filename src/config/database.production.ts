export default {
  type: "postgres",
  host: "prod-db-host",
  port: 5432,
  username: "prod_user",
  password: "prod_password",
  database: "student_learning_prod",
  synchronize: false,
  logging: false,
  entities: ["dist/entities/*.js"],
  migrations: ["dist/migrations/*.js"],
  subscribers: [],
}; 