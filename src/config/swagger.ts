import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import fs from 'fs';

// Function to recursively get all TypeScript files in a directory
function getAllTsFiles(dir: string): string[] {
    const files: string[] = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files.push(...getAllTsFiles(fullPath));
        } else if (item.name.endsWith('.ts')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// Get all route files
const routesDir = path.join(__dirname, '../api/routes');
const routeFiles = getAllTsFiles(routesDir);

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Student Learning Platform API',
            version: '1.0.0',
            description: 'API documentation for the Student Learning Platform',
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        message: { type: 'string' },
                        stack: { type: 'string' }
                    }
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        page: { type: 'number', example: 1 },
                        limit: { type: 'number', example: 10 },
                        total: { type: 'number', example: 100 },
                        totalPages: { type: 'number', example: 10 }
                    }
                },
                Student: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        age: { type: 'number' },
                        dateOfBirth: { type: 'string', format: 'date' },
                        hebrewDateOfBirth: { type: 'string' },
                        barMitzvahParasha: { type: 'string' },
                        avatarUrl: { type: 'string' },
                        isVerified: { type: 'boolean' },
                        role: { type: 'string', enum: ['student', 'admin'] },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Document: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        fileUrl: { type: 'string' },
                        fileType: { type: 'string' },
                        fileSize: { type: 'number' },
                        tags: { type: 'array', items: { type: 'string' } },
                        visibility: { type: 'string', enum: ['private', 'public'] },
                        downloadCount: { type: 'number' },
                        viewCount: { type: 'number' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Classroom: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        startTime: { type: 'string', format: 'date-time' },
                        endTime: { type: 'string', format: 'date-time' },
                        status: { type: 'string', enum: ['scheduled', 'in-progress', 'completed', 'cancelled'] },
                        maxParticipants: { type: 'number' },
                        meetingLink: { type: 'string' },
                        isRecorded: { type: 'boolean' },
                        recordingUrl: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Permission: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        level: { type: 'string', enum: ['read', 'write', 'share', 'admin'] },
                        isActive: { type: 'boolean' },
                        expiresAt: { type: 'string', format: 'date-time' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Access token is missing or invalid',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                NotFoundError: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                ValidationError: {
                    description: 'Validation error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: routeFiles // This will automatically include all route files
};

export const swaggerSpec = swaggerJsdoc(options); 