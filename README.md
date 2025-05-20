# Student Learning Platform

A comprehensive learning management system built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- Student management with validation
- Document sharing and management
- Classroom scheduling and management
- Permission-based access control
- RESTful API with Swagger documentation
- TypeScript for type safety
- PostgreSQL database with TypeORM

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Git

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd student-learning-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=student_learning_dev
```

4. Run database migrations:
```bash
npm run typeorm migration:run
```

## Development

Start the development server:
```bash
npm run dev
```

The server will start on port 3001 (or the port specified in your .env file).

## API Documentation

Once the server is running, you can access the Swagger documentation at:
```
http://localhost:3001/api-docs
```

## Available Endpoints

- `/api/auth` - Authentication endpoints
- `/api/students` - Student management
- `/api/documents` - Document management
- `/api/classrooms` - Classroom management
- `/api/permissions` - Permission management

## License

MIT
