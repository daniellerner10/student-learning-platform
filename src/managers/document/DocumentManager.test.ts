import { DocumentManager } from './DocumentManager';
import { DocumentRepository } from '../../repositories/DocumentRepository';
import { AppError } from '../../middleware/errorHandler';
import { Document } from '../../entities/Document';
import { CreateDocumentRequest, UpdateDocumentRequest } from '../../viewModels/document/requests';
import { FindOneOptions } from 'typeorm';

// Mock the data-source
jest.mock('../../data-source');

// Mock the DocumentRepository
jest.mock('../../repositories/DocumentRepository');

describe('DocumentManager', () => {
    let documentManager: DocumentManager;
    let mockDocumentRepository: jest.Mocked<DocumentRepository>;
    let inMemoryDocuments: Document[];

    beforeEach(() => {
        jest.clearAllMocks();
        inMemoryDocuments = [];
        mockDocumentRepository = {
            create: jest.fn().mockImplementation((data) => ({ ...data, id: Math.random().toString() }))
        } as unknown as jest.Mocked<DocumentRepository>;
        documentManager = new DocumentManager();

        mockDocumentRepository.findOne = jest.fn((options: FindOneOptions<Document>) => {
            const where = options.where as { id?: string };
            return Promise.resolve(inMemoryDocuments.find(d => d.id === where.id) || null);
        });

        mockDocumentRepository.save = jest.fn((entity: any) => {
            const document = Array.isArray(entity) ? entity[0] : entity as Document;
            const existingIndex = inMemoryDocuments.findIndex(d => d.id === document.id);
            if (existingIndex >= 0) {
                inMemoryDocuments[existingIndex] = document;
            } else {
                inMemoryDocuments.push(document);
            }
            return Promise.resolve(document);
        });

        mockDocumentRepository.remove = jest.fn((entity: any) => {
            const document = Array.isArray(entity) ? entity[0] : entity as Document;
            inMemoryDocuments = inMemoryDocuments.filter(d => d.id !== document.id);
            return Promise.resolve(document);
        });

        mockDocumentRepository.find = jest.fn(() => Promise.resolve(inMemoryDocuments));
    });

    describe('create', () => {
        it('should create a new document successfully', async () => {
            const createRequest: CreateDocumentRequest = {
                title: 'Test Document',
                description: 'Test Description',
                fileUrl: 'https://example.com/test.pdf',
                fileType: 'pdf',
                fileSize: 1024,
                tags: ['test', 'document'],
                visibility: 'private',
                ownerId: '1'
            };

            const result = await documentManager.create(createRequest);

            expect(mockDocumentRepository.create).toHaveBeenCalled();
            expect(mockDocumentRepository.save).toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({
                title: createRequest.title,
                description: createRequest.description,
                fileUrl: createRequest.fileUrl,
                fileType: createRequest.fileType,
                fileSize: createRequest.fileSize,
                tags: createRequest.tags,
                visibility: createRequest.visibility
            }));
        });
    });

    describe('update', () => {
        it('should update an existing document successfully', async () => {
            const existingDocument: Document = {
                id: '1',
                title: 'Original Title',
                description: 'Original Description',
                fileUrl: 'https://example.com/test.pdf',
                fileType: 'pdf',
                fileSize: 1024,
                tags: ['test'],
                visibility: 'private',
                owner: { id: '1' } as any,
                downloadCount: 0,
                viewCount: 0,
                isFileSizeValid: () => true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            inMemoryDocuments.push(existingDocument);

            const updateRequest: UpdateDocumentRequest = {
                id: '1',
                title: 'Updated Title',
                description: 'Updated Description',
                tags: ['test', 'updated']
            };

            const result = await documentManager.update(updateRequest);

            expect(mockDocumentRepository.findOne).toHaveBeenCalledWith({ where: { id: updateRequest.id } });
            expect(mockDocumentRepository.save).toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({
                id: updateRequest.id,
                title: updateRequest.title,
                description: updateRequest.description,
                tags: updateRequest.tags
            }));
        });

        it('should throw an error if document not found', async () => {
            const updateRequest: UpdateDocumentRequest = {
                id: '999',
                title: 'Updated Title'
            };

            await expect(documentManager.update(updateRequest)).rejects.toThrow(AppError);
            expect(mockDocumentRepository.findOne).toHaveBeenCalledWith({ where: { id: updateRequest.id } });
            expect(mockDocumentRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should delete an existing document successfully', async () => {
            const existingDocument: Document = {
                id: '1',
                title: 'Test Document',
                description: 'Test Description',
                fileUrl: 'https://example.com/test.pdf',
                fileType: 'pdf',
                fileSize: 1024,
                tags: ['test'],
                visibility: 'private',
                owner: { id: '1' } as any,
                downloadCount: 0,
                viewCount: 0,
                isFileSizeValid: () => true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            inMemoryDocuments.push(existingDocument);

            await documentManager.delete({ id: '1' });

            expect(mockDocumentRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(mockDocumentRepository.remove).toHaveBeenCalledWith(existingDocument);
            expect(inMemoryDocuments).not.toContainEqual(existingDocument);
        });

        it('should throw an error if document not found', async () => {
            await expect(documentManager.delete({ id: '999' })).rejects.toThrow(AppError);
            expect(mockDocumentRepository.findOne).toHaveBeenCalledWith({ where: { id: '999' } });
            expect(mockDocumentRepository.remove).not.toHaveBeenCalled();
        });
    });

    describe('list', () => {
        it('should return a list of documents', async () => {
            const mockDocuments: Document[] = [
                {
                    id: '1',
                    title: 'Document 1',
                    description: 'Description 1',
                    fileUrl: 'https://example.com/1.pdf',
                    fileType: 'pdf',
                    fileSize: 1024,
                    tags: ['test1'],
                    visibility: 'private',
                    owner: { id: '1' } as any,
                    downloadCount: 0,
                    viewCount: 0,
                    isFileSizeValid: () => true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: '2',
                    title: 'Document 2',
                    description: 'Description 2',
                    fileUrl: 'https://example.com/2.pdf',
                    fileType: 'pdf',
                    fileSize: 2048,
                    tags: ['test2'],
                    visibility: 'private',
                    owner: { id: '1' } as any,
                    downloadCount: 0,
                    viewCount: 0,
                    isFileSizeValid: () => true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            inMemoryDocuments.push(...mockDocuments);

            const result = await documentManager.list();

            expect(mockDocumentRepository.find).toHaveBeenCalled();
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(expect.objectContaining({
                id: mockDocuments[0].id,
                title: mockDocuments[0].title,
                description: mockDocuments[0].description,
                fileUrl: mockDocuments[0].fileUrl,
                fileType: mockDocuments[0].fileType,
                fileSize: mockDocuments[0].fileSize,
                tags: mockDocuments[0].tags,
                visibility: mockDocuments[0].visibility
            }));
            expect(result[1]).toEqual(expect.objectContaining({
                id: mockDocuments[1].id,
                title: mockDocuments[1].title,
                description: mockDocuments[1].description,
                fileUrl: mockDocuments[1].fileUrl,
                fileType: mockDocuments[1].fileType,
                fileSize: mockDocuments[1].fileSize,
                tags: mockDocuments[1].tags,
                visibility: mockDocuments[1].visibility
            }));
        });
    });
});
