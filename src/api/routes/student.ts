import { Router } from 'express';
import { StudentManager } from '../../managers/student/StudentManager';
import { CreateStudentRequest, UpdateStudentRequest } from '../../viewModels/student/requests';
import { validateStudentData } from '../../middleware/validation';

const router = Router();
const studentManager = new StudentManager();

/**
 * @swagger
 * /api/students:
 *   get:
 *     tags: [Students]
 *     summary: Get all students
 *     responses:
 *       200:
 *         description: List of students
 */
router.get('/', async (req, res, next) => {
    try {
        const students = await studentManager.list();
        res.json(students);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/students:
 *   post:
 *     tags: [Students]
 *     summary: Create a new student
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
 *               - barMitzvahParasha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *               barMitzvahParasha:
 *                 type: string
 *                 minLength: 3
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               hebrewDateOfBirth:
 *                 type: string
 */
router.post('/', validateStudentData, async (req, res, next) => {
    try {
        const studentData: CreateStudentRequest = req.body;
        const student = await studentManager.create(studentData);
        res.status(201).json(student);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     tags: [Students]
 *     summary: Update a student
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *               barMitzvahParasha:
 *                 type: string
 *                 minLength: 3
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               hebrewDateOfBirth:
 *                 type: string
 */
router.put('/:id', validateStudentData, async (req, res, next) => {
    try {
        const updateData: UpdateStudentRequest = {
            id: req.params.id,
            ...req.body
        };
        const student = await studentManager.update(updateData);
        res.json(student);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     tags: [Students]
 *     summary: Delete a student
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', async (req, res, next) => {
    try {
        await studentManager.delete({ id: req.params.id });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router; 