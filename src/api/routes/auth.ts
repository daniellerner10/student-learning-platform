import { Router } from 'express';
import { StudentRepository } from '../../repositories/StudentRepository';

const router = Router();
const studentRepository = new StudentRepository();

/**
 * @swagger
 * /api/auth/test:
 *   get:
 *     summary: Test endpoint for auth routes
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Test successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Auth routes are working!
 */
router.get('/test', (req, res) => {
    console.log('Auth test route hit');
    res.json({ message: 'Auth routes are working!' });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/Student'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res, next) => {
    console.log('POST /api/auth/login - Request received');
    try {
        const { email, password } = req.body;
        console.log('Attempting to find user by email:', email);
        const user = await studentRepository.findByEmail(email);
        
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // TODO: Add proper password comparison
        if (password !== user.password) {
            console.log('Invalid password');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('Login successful for user:', user);
        // TODO: Generate JWT token
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: Invalid input
 */
router.post('/register', async (req, res, next) => {
    console.log('POST /api/auth/register - Request received');
    try {
        const { email, password, firstName, lastName } = req.body;
        console.log('Checking if user already exists:', email);
        
        const existingUser = await studentRepository.findByEmail(email);
        if (existingUser) {
            console.log('User already exists');
            return res.status(400).json({ message: 'User already exists' });
        }

        console.log('Creating new user');
        const newUser = studentRepository.create({
            email,
            password, // TODO: Hash password
            firstName,
            lastName
        });

        await studentRepository.save(newUser);
        console.log('User created successfully:', newUser);

        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName
            }
        });
    } catch (error) {
        console.error('Error during registration:', error);
        next(error);
    }
});

export const authRoutes = router; 