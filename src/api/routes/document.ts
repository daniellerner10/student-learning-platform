import { Router } from 'express';
import { DocumentManager } from '../../managers/document/DocumentManager';
import { CreateDocumentRequest, UpdateDocumentRequest } from '../../viewModels/document/requests';

const router = Router();
const documentManager = new DocumentManager();

// Apply auth middleware to all routes
//router.use(authMiddleware);

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get all documents
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Document'
 */
router.get('/', async (req, res, next) => {
    try {
        const documents = await documentManager.list();
        res.json(documents);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Get a document by ID
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *       404:
 *         description: Document not found
 */
router.get('/:id', async (req, res, next) => {
    console.log(`GET /api/documents/${req.params.id} - Request received`);
    try {
        console.log('Attempting to fetch document from repository');
        const document = await documentManager.get(req.params.id);
        console.log('Document fetched:', document);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json(document);
    } catch (error) {
        console.error('Error fetching document:', error);
        next(error);
    }
});

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Create a new document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - fileUrl
 *               - fileType
 *               - fileSize
 *               - ownerId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *               fileType:
 *                 type: string
 *               fileSize:
 *                 type: number
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               visibility:
 *                 type: string
 *                 enum: [private, public]
 *               ownerId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/', async (req, res, next) => {
    try {
        const documentData: CreateDocumentRequest = req.body;
        const document = await documentManager.create(documentData);
        res.status(201).json(document);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/documents/{id}:
 *   put:
 *     summary: Update a document
 *     tags: [Documents]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *               fileType:
 *                 type: string
 *               fileSize:
 *                 type: number
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               visibility:
 *                 type: string
 *                 enum: [private, public]
 */
router.put('/:id', async (req, res, next) => {
    try {
        const updateData: UpdateDocumentRequest = {
            id: req.params.id,
            ...req.body
        };
        const document = await documentManager.update(updateData);
        res.json(document);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Document deleted successfully
 *       404:
 *         description: Document not found
 */
router.delete('/:id', async (req, res, next) => {
    try {
        await documentManager.delete({ id: req.params.id });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router; 