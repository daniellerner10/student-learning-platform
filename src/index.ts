import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { AppDataSource } from './data-source';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './api/routes/auth';
import studentRoutes from './api/routes/student';
import documentRoutes from './api/routes/document';
import classroomRoutes from './api/routes/classroom';
import permissionRoutes from './api/routes/permission';
import { swaggerSpec } from './config/swagger';
import logger from './utils/logger';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const DEV_PORT = 3001;
const isDevelopment = process.env.NODE_ENV === 'development';

// Middleware
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false // Disable CSP for Swagger UI
}));
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Student Learning Platform API"
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/permissions', permissionRoutes);

// Error handling
app.use(errorHandler);

// Database connection and server start
AppDataSource.initialize()
    .then(() => {
        logger.info('Database connection established');
        
        if (isDevelopment) {
            // In development, use HTTP
            http.createServer(app).listen(DEV_PORT, () => {
                logger.info(`HTTP Server is running on port ${DEV_PORT}`);
                logger.info(`Swagger documentation available at http://localhost:${DEV_PORT}/api-docs`);
            });
        } else {
            // In production, use HTTPS
            try {
                const sslOptions = {
                    key: fs.readFileSync(path.join(__dirname, '../ssl/private.key')),
                    cert: fs.readFileSync(path.join(__dirname, '../ssl/certificate.crt'))
                };
                https.createServer(sslOptions, app).listen(PORT, () => {
                    logger.info(`HTTPS Server is running on port ${PORT}`);
                });
            } catch (error) {
                logger.error('Error loading SSL certificates:', error);
                process.exit(1);
            }
        }
    })
    .catch((error) => {
        logger.error('Error during Data Source initialization:', error);
    });
