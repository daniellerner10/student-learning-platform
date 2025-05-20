import { DataSource } from "typeorm";

export const AppDataSource = {
    // Add minimal mock implementation
    initialize: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    manager: {
        // Add any methods used by your repositories
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        remove: jest.fn()
    }
} as unknown as DataSource;
