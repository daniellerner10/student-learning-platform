import express from 'express';
import { ClassroomManager } from '../../managers/classroom/ClassroomManager';
import { CreateClassroomRequest, UpdateClassroomRequest } from '../../viewModels/classroom/requests';
import logger from '../../utils/logger';

const router = express.Router();
const classroomManager = new ClassroomManager();

/**
 * @swagger
 * /api/classrooms:
 *   get:
 *     summary: Get all classrooms
 *     responses:
 *       200:
 *         description: List of classrooms
 */
router.get('/', async (req, res, next) => {
    try {
        const classrooms = await classroomManager.list();
        res.json(classrooms);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/classrooms:
 *   post:
 *     summary: Create a new classroom
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
 *               - instructorId
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
 *               instructorId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [scheduled, in-progress, completed, cancelled]
 *               meetingLink:
 *                 type: string
 */
router.post('/', async (req, res, next) => {
    try {
        const classroomData: CreateClassroomRequest = req.body;
        const classroom = await classroomManager.create(classroomData);
        res.status(201).json(classroom);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/classrooms/{id}:
 *   put:
 *     summary: Update a classroom
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
 *               instructorId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [scheduled, in-progress, completed, cancelled]
 *               meetingLink:
 *                 type: string
 */
router.put('/:id', async (req, res, next) => {
    try {
        const updateData: UpdateClassroomRequest = {
            id: req.params.id,
            ...req.body
        };
        const classroom = await classroomManager.update(updateData);
        res.json(classroom);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/classrooms/{id}:
 *   delete:
 *     summary: Delete a classroom
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', async (req, res, next) => {
    try {
        await classroomManager.delete({ id: req.params.id });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router; 