import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { DocumentRepository } from '../../repositories/DocumentRepository';

const router = Router();
const documentRepository = new DocumentRepository();

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
    console.log('GET /api/documents - Request received');
    try {
        console.log('Attempting to fetch documents from repository');
        const documents = await documentRepository.find();
        console.log('Documents fetched:', documents);
        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
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
        const document = await documentRepository.findOne({ where: { id: req.params.id } });
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
    console.log('POST /api/documents - Request received');
    try {
        const { title, description, fileUrl, fileType, fileSize, tags, visibility } = req.body;
        console.log('Creating new document with data:', { title, fileUrl, fileType, fileSize });

        const newDocument = documentRepository.create({
            title,
            description,
            fileUrl,
            fileType,
            fileSize,
            tags: tags || [],
            visibility: visibility || 'private',
            downloadCount: 0,
            viewCount: 0
        });

        await documentRepository.save(newDocument);
        console.log('Document created successfully:', newDocument);

        res.status(201).json(newDocument);
    } catch (error) {
        console.error('Error creating document:', error);
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
 *           format: uuid
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
 *               visibility:
 *                 type: string
 *                 enum: [private, public]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Document updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *       404:
 *         description: Document not found
 */
router.put('/:id', async (req, res, next) => {
    console.log(`PUT /api/documents/${req.params.id} - Request received`);
    try {
        const { id } = req.params;
        const updateData = req.body;
        console.log('Updating document with data:', updateData);

        const document = await documentRepository.findOne({ where: { id } });
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        await documentRepository.update(id, updateData);
        const updatedDocument = await documentRepository.findOne({ where: { id } });
        console.log('Document updated successfully:', updatedDocument);

        res.json(updatedDocument);
    } catch (error) {
        console.error('Error updating document:', error);
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
 *           format: uuid
 *     responses:
 *       204:
 *         description: Document deleted successfully
 *       404:
 *         description: Document not found
 */
router.delete('/:id', async (req, res, next) => {
    console.log(`DELETE /api/documents/${req.params.id} - Request received`);
    try {
        const { id } = req.params;
        const document = await documentRepository.findOne({ where: { id } });
        
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        await documentRepository.remove(document);
        console.log('Document deleted successfully');

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting document:', error);
        next(error);
    }
});

export const documentRoutes = router; 