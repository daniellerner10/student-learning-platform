import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { StudentRepository } from '../../repositories/StudentRepository';
import { DeepPartial } from 'typeorm';
import { Student } from '../../entities/Student';
import { validateStudentData } from '../../middleware/validation';

const router = Router();
const studentRepository = new StudentRepository();

// Apply auth middleware to all routes
//router.use(authMiddleware);

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: List of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 */
router.get('/', async (req, res, next) => {
    console.log('GET /api/students - Request received');
    try {
        console.log('Attempting to fetch students from repository');
        const students = await studentRepository.find();
        console.log('Students fetched:', students);
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        next(error);
    }
});

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Get a student by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 */
router.get('/:id', async (req, res, next) => {
    console.log(`GET /api/students/${req.params.id} - Request received`);
    try {
        console.log('Attempting to fetch student from repository');
        const student = await studentRepository.findOne({ where: { id: req.params.id } });
        console.log('Student fetched:', student);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        next(error);
    }
});

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
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
 *               age:
 *                 type: integer
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               hebrewDateOfBirth:
 *                 type: string
 *               barMitzvahParasha:
 *                 type: string
 *                 minLength: 3
 *     responses:
 *       201:
 *         description: Student created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/', validateStudentData, async (req, res, next) => {
    console.log('POST /api/students - Request received');
    try {
        const studentData = req.body;
        console.log('Creating new student with data:', { ...studentData, password: '[REDACTED]' });

        const newStudent = studentRepository.create({
            ...studentData,
            role: 'student'
        } as DeepPartial<Student>);

        await studentRepository.save(newStudent);
        console.log('Student created successfully:', { ...newStudent, password: '[REDACTED]' });

        res.status(201).json(newStudent);
    } catch (error) {
        console.error('Error creating student:', error);
        next(error);
    }
});

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: Update a student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *               age:
 *                 type: integer
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               hebrewDateOfBirth:
 *                 type: string
 *               barMitzvahParasha:
 *                 type: string
 *                 minLength: 3
 *     responses:
 *       200:
 *         description: Student updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 */
router.put('/:id', validateStudentData, async (req, res, next) => {
    console.log(`PUT /api/students/${req.params.id} - Request received`);
    try {
        const { id } = req.params;
        const updateData = req.body;
        console.log('Updating student with data:', { ...updateData, password: '[REDACTED]' });

        const student = await studentRepository.findOne({ where: { id } });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        await studentRepository.update(id, updateData);
        const updatedStudent = await studentRepository.findOne({ where: { id } });
        console.log('Student updated successfully:', { ...updatedStudent, password: '[REDACTED]' });

        res.json(updatedStudent);
    } catch (error) {
        console.error('Error updating student:', error);
        next(error);
    }
});

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: Delete a student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Student deleted successfully
 *       404:
 *         description: Student not found
 */
router.delete('/:id', async (req, res, next) => {
    console.log(`DELETE /api/students/${req.params.id} - Request received`);
    try {
        const { id } = req.params;
        const student = await studentRepository.findOne({ where: { id } });
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        await studentRepository.remove(student);
        console.log('Student deleted successfully');

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting student:', error);
        next(error);
    }
});

export const studentRoutes = router; 