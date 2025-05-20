import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        // For development, let's allow all requests
        // TODO: Implement proper authentication
        next();
    } catch (error) {
        next(new AppError(401, 'Authentication failed'));
    }
}; 