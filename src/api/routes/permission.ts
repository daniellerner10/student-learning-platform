import express from 'express';
import { PermissionManager } from '../../managers/permission/PermissionManager';
import { CreatePermissionRequest, UpdatePermissionRequest } from '../../viewModels/permission/requests';
import logger from '../../utils/logger';

const router = express.Router();
const permissionManager = new PermissionManager();

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     summary: Get all permissions
 *     responses:
 *       200:
 *         description: List of permissions
 */
router.get('/', async (req, res, next) => {
    try {
        const permissions = await permissionManager.list();
        res.json(permissions);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/permissions:
 *   post:
 *     summary: Create a new permission
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - level
 *             properties:
 *               studentId:
 *                 type: string
 *               documentId:
 *                 type: string
 *               classroomId:
 *                 type: string
 *               level:
 *                 type: string
 *                 enum: [read, write, share, admin]
 *               isActive:
 *                 type: boolean
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 */
router.post('/', async (req, res, next) => {
    try {
        const permissionData: CreatePermissionRequest = req.body;
        const permission = await permissionManager.create(permissionData);
        res.status(201).json(permission);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/permissions/{id}:
 *   put:
 *     summary: Update a permission
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
 *               level:
 *                 type: string
 *                 enum: [read, write, share, admin]
 *               isActive:
 *                 type: boolean
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 */
router.put('/:id', async (req, res, next) => {
    try {
        const updateData: UpdatePermissionRequest = {
            id: req.params.id,
            ...req.body
        };
        const permission = await permissionManager.update(updateData);
        res.json(permission);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/permissions/{id}:
 *   delete:
 *     summary: Delete a permission
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', async (req, res, next) => {
    try {
        await permissionManager.delete({ id: req.params.id });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router; 