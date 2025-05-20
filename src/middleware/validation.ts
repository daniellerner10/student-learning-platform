import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateStudentData = (req: Request, res: Response, next: NextFunction) => {
    const { email, firstName, lastName, dateOfBirth, hebrewDateOfBirth, barMitzvahParasha } = req.body;
    const errors: string[] = [];

    // Validate email
    if (!email) {
        errors.push('Email is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Invalid email format');
        }
    }

    // Validate first name
    if (!firstName) {
        errors.push('First name is required');
    } else if (firstName.length < 2) {
        errors.push('First name must be at least 2 characters long');
    }

    // Validate last name
    if (!lastName) {
        errors.push('Last name is required');
    } else if (lastName.length < 2) {
        errors.push('Last name must be at least 2 characters long');
    }

    // Validate bar mitzvah parasha
    if (!barMitzvahParasha) {
        errors.push('Bar mitzvah parasha is required');
    } else if (barMitzvahParasha.length < 3) {
        errors.push('Bar mitzvah parasha must be at least 3 characters long');
    }

    // Validate date of birth (must be in the past)
    if (dateOfBirth) {
        const dob = new Date(dateOfBirth);
        const now = new Date();
        if (dob >= now) {
            errors.push('Date of birth must be in the past');
        }
    }

    // Validate Hebrew date of birth
    if (hebrewDateOfBirth) {
        const hebrewDateRegex = /^[א-ת\s]+$/;
        if (!hebrewDateRegex.test(hebrewDateOfBirth)) {
            errors.push('Invalid Hebrew date format');
        }
    }

    if (errors.length > 0) {
        throw new AppError(400, errors.join(', '));
    }

    next();
}; 