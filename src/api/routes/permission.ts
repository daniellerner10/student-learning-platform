import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { PermissionRepository } from '../../repositories/PermissionRepository';
import { DeepPartial } from 'typeorm';
import { Permission } from '../../entities/Permission';

const router = Router();
const permissionRepository = new PermissionRepository();

// Apply auth middleware to all routes
//router.use(authMiddleware);

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Permissions]
 *     responses:
 *       200:
 *         description: List of permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Permission'
 */
router.get('/', async (req, res, next) => {
    console.log('GET /api/permissions - Request received');
    try {
        console.log('Attempting to fetch permissions from repository');
        const permissions = await permissionRepository.find();
        console.log('Permissions fetched:', permissions);
        res.json(permissions);
    } catch (error) {
        console.error('Error fetching permissions:', error);
        next(error);
    }
});

/**
 * @swagger
 * /api/permissions/{id}:
 *   get:
 *     summary: Get a permission by ID
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 *       404:
 *         description: Permission not found
 */
router.get('/:id', async (req, res, next) => {
    console.log(`GET /api/permissions/${req.params.id} - Request received`);
    try {
        console.log('Attempting to fetch permission from repository');
        const permission = await permissionRepository.findOne({ where: { id: req.params.id } });
        console.log('Permission fetched:', permission);
        if (!permission) {
            return res.status(404).json({ message: 'Permission not found' });
        }
        res.json(permission);
    } catch (error) {
        console.error('Error fetching permission:', error);
        next(error);
    }
});

/**
 * @swagger
 * /api/permissions:
 *   post:
 *     summary: Create a new permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - level
 *               - studentId
 *             properties:
 *               level:
 *                 type: string
 *                 enum: [read, write, share, admin]
 *               isActive:
 *                 type: boolean
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               studentId:
 *                 type: string
 *                 format: uuid
 *               documentId:
 *                 type: string
 *                 format: uuid
 *               classroomId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Permission created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/', async (req, res, next) => {
    console.log('POST /api/permissions - Request received');
    try {
        const { level, isActive, expiresAt, studentId, documentId, classroomId } = req.body;
        console.log('Creating new permission with data:', { level, studentId, documentId, classroomId });

        const newPermission = permissionRepository.create({
            level,
            isActive: isActive ?? true,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            student: { id: studentId },
            document: documentId ? { id: documentId } : undefined,
            classroom: classroomId ? { id: classroomId } : undefined
        } as DeepPartial<Permission>);

        await permissionRepository.save(newPermission);
        console.log('Permission created successfully:', newPermission);

        res.status(201).json(newPermission);
    } catch (error) {
        console.error('Error creating permission:', error);
        next(error);
    }
});

/**
 * @swagger
 * /api/permissions/{id}:
 *   put:
 *     summary: Update a permission
 *     tags: [Permissions]
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
 *               level:
 *                 type: string
 *                 enum: [read, write, share, admin]
 *               isActive:
 *                 type: boolean
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 *       404:
 *         description: Permission not found
 */
router.put('/:id', async (req, res, next) => {
    console.log(`PUT /api/permissions/${req.params.id} - Request received`);
    try {
        const { id } = req.params;
        const updateData = req.body;
        console.log('Updating permission with data:', updateData);

        const permission = await permissionRepository.findOne({ where: { id } });
        if (!permission) {
            return res.status(404).json({ message: 'Permission not found' });
        }

        await permissionRepository.update(id, updateData);
        const updatedPermission = await permissionRepository.findOne({ where: { id } });
        console.log('Permission updated successfully:', updatedPermission);

        res.json(updatedPermission);
    } catch (error) {
        console.error('Error updating permission:', error);
        next(error);
    }
});

/**
 * @swagger
 * /api/permissions/{id}:
 *   delete:
 *     summary: Delete a permission
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Permission deleted successfully
 *       404:
 *         description: Permission not found
 */
router.delete('/:id', async (req, res, next) => {
    console.log(`DELETE /api/permissions/${req.params.id} - Request received`);
    try {
        const { id } = req.params;
        const permission = await permissionRepository.findOne({ where: { id } });
        
        if (!permission) {
            return res.status(404).json({ message: 'Permission not found' });
        }

        await permissionRepository.remove(permission);
        console.log('Permission deleted successfully');

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting permission:', error);
        next(error);
    }
});

export const permissionRoutes = router; 