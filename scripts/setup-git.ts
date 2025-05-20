import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const requiredEnvVars = [
    'GIT_USER_NAME',
    'GIT_USER_EMAIL',
    'GIT_REPOSITORY_URL'
];

// Check if all required environment variables are set
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

try {
    // Configure Git user
    execSync(`git config --global user.name "${process.env.GIT_USER_NAME}"`);
    execSync(`git config --global user.email "${process.env.GIT_USER_EMAIL}"`);

    // Initialize Git repository if not already initialized
    try {
        execSync('git rev-parse --is-inside-work-tree');
    } catch {
        execSync('git init');
    }

    // Add remote repository if not already added
    try {
        execSync('git remote get-url origin');
    } catch {
        execSync(`git remote add origin ${process.env.GIT_REPOSITORY_URL}`);
    }

    console.log('Git configuration completed successfully!');
} catch (error) {
    console.error('Error configuring Git:', error);
    process.exit(1);
} 