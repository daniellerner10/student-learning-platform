import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { ClassroomRepository } from '../../repositories/ClassroomRepository';

const router = Router();
const classroomRepository = new ClassroomRepository();

// Apply auth middleware to all routes
//router.use(authMiddleware);

/**
 * @swagger
 * /api/classrooms:
 *   get:
 *     summary: Get all classrooms
 *     tags: [Classrooms]
 *     responses:
 *       200:
 *         description: List of classrooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Classroom'
 */
router.get('/', async (req, res, next) => {
    console.log('GET /api/classrooms - Request received');
    try {
        console.log('Attempting to fetch classrooms from repository');
        const classrooms = await classroomRepository.find();
        console.log('Classrooms fetched:', classrooms);
        res.json(classrooms);
    } catch (error) {
        console.error('Error fetching classrooms:', error);
        next(error);
    }
});

/**
 * @swagger
 * /api/classrooms/{id}:
 *   get:
 *     summary: Get a classroom by ID
 *     tags: [Classrooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Classroom ID
 *     responses:
 *       200:
 *         description: Classroom found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Classroom'
 *       404:
 *         description: Classroom not found
 */
router.get('/:id', async (req, res, next) => {
    console.log(`GET /api/classrooms/${req.params.id} - Request received`);
    try {
        console.log('Attempting to fetch classroom from repository');
        const classroom = await classroomRepository.findOne({ where: { id: req.params.id } });
        console.log('Classroom fetched:', classroom);
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        res.json(classroom);
    } catch (error) {
        console.error('Error fetching classroom:', error);
        next(error);
    }
});

/**
 * @swagger
 * /api/classrooms:
 *   post:
 *     summary: Create a new classroom
 *     tags: [Classrooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - startTime
 *               - endTime
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               maxParticipants:
 *                 type: number
 *               meetingLink:
 *                 type: string
 *     responses:
 *       201:
 *         description: Classroom created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Classroom'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/', async (req, res, next) => {
    console.log('POST /api/classrooms - Request received');
    try {
        const { name, description, startTime, endTime, maxParticipants, meetingLink } = req.body;
        console.log('Creating new classroom with data:', { name, startTime, endTime });

        const newClassroom = classroomRepository.create({
            name,
            description,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            maxParticipants: maxParticipants || 10,
            meetingLink,
            status: 'scheduled',
            isRecorded: false
        });

        await classroomRepository.save(newClassroom);
        console.log('Classroom created successfully:', newClassroom);

        res.status(201).json(newClassroom);
    } catch (error) {
        console.error('Error creating classroom:', error);
        next(error);
    }
});

/**
 * @swagger
 * /api/classrooms/{id}:
 *   put:
 *     summary: Update a classroom
 *     tags: [Classrooms]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [scheduled, in-progress, completed, cancelled]
 *               maxParticipants:
 *                 type: integer
 *               meetingLink:
 *                 type: string
 *     responses:
 *       200:
 *         description: Classroom updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Classroom'
 *       404:
 *         description: Classroom not found
 */
router.put('/:id', async (req, res, next) => {
    console.log(`PUT /api/classrooms/${req.params.id} - Request received`);
    try {
        const { id } = req.params;
        const updateData = req.body;
        console.log('Updating classroom with data:', updateData);

        const classroom = await classroomRepository.findOne({ where: { id } });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        await classroomRepository.update(id, updateData);
        const updatedClassroom = await classroomRepository.findOne({ where: { id } });
        console.log('Classroom updated successfully:', updatedClassroom);

        res.json(updatedClassroom);
    } catch (error) {
        console.error('Error updating classroom:', error);
        next(error);
    }
});

/**
 * @swagger
 * /api/classrooms/{id}:
 *   delete:
 *     summary: Delete a classroom
 *     tags: [Classrooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Classroom deleted successfully
 *       404:
 *         description: Classroom not found
 */
router.delete('/:id', async (req, res, next) => {
    console.log(`DELETE /api/classrooms/${req.params.id} - Request received`);
    try {
        const { id } = req.params;
        const classroom = await classroomRepository.findOne({ where: { id } });
        
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        await classroomRepository.remove(classroom);
        console.log('Classroom deleted successfully');

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting classroom:', error);
        next(error);
    }
});

export const classroomRoutes = router; 