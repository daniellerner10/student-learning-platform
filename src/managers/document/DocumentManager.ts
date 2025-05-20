import { DocumentRepository } from '../../repositories/DocumentRepository';
import { ICreateManager, IUpdateManager, IDeleteManager, IListManager } from '../interfaces/IManager';
import { CreateDocumentRequest, UpdateDocumentRequest } from '../../viewModels/document/requests';
import { DocumentResponse } from '../../viewModels/document/responses';
import { AppError } from '../../middleware/errorHandler';
import { Document } from '../../entities/Document';
import logger from '../../utils/logger';
import { AppDataSource } from '../../data-source';

export class DocumentManager implements 
    ICreateManager<CreateDocumentRequest, DocumentResponse>,
    IUpdateManager<UpdateDocumentRequest, DocumentResponse>,
    IDeleteManager<{ id: string }>,
    IListManager<{}, DocumentResponse> {
    
    private documentRepository: DocumentRepository;

    constructor(documentRepository?: DocumentRepository) {
        this.documentRepository = documentRepository || new DocumentRepository(AppDataSource);
    }

    async create(request: CreateDocumentRequest): Promise<DocumentResponse> {
        logger.info('Creating new document with data:', request);
        // Remove id if present in request
        const { id, ...rest } = request as any;
        const document = this.documentRepository.create({
            ...rest,
            owner: { id: request.ownerId }
        });

        logger.debug('Saving new document to repository');
        const savedDocuments = await this.documentRepository.save(document);
        logger.info('Document created successfully:', savedDocuments);
        
        // If save returns an array, return the first document's response
        const savedDocument = Array.isArray(savedDocuments) ? savedDocuments[0] : savedDocuments;
        return this.mapToResponse(savedDocument);
    }

    async update(request: UpdateDocumentRequest): Promise<DocumentResponse> {
        logger.info('Updating document:', request.id);
        
        const document = await this.documentRepository.findOne({ where: { id: request.id } });
        if (!document) {
            logger.warn('Document not found:', request.id);
            throw new AppError(404, 'Document not found');
        }

        logger.debug('Saving updated document to repository');
        const updatedDocument = await this.documentRepository.save({
            ...document,
            ...request
        });
        logger.info('Document updated successfully:', updatedDocument);

        return this.mapToResponse(updatedDocument);
    }

    async delete(request: { id: string }): Promise<void> {
        logger.info('Deleting document:', request.id);
        
        const document = await this.documentRepository.findOne({ where: { id: request.id } });
        if (!document) {
            logger.warn('Document not found:', request.id);
            throw new AppError(404, 'Document not found');
        }

        logger.debug('Removing document from repository');
        await this.documentRepository.remove(document);
        logger.info('Document deleted successfully:', request.id);
    }

    async list(): Promise<DocumentResponse[]> {
        logger.info('Fetching all documents');
        
        const documents = await this.documentRepository.find();
        logger.debug('Found', documents.length, 'documents');
        
        return documents.map(document => this.mapToResponse(document));
    }

    async get(id: string): Promise<DocumentResponse> {
        logger.info('Fetching document:', id);
        
        const document = await this.documentRepository.findOne({ where: { id } });
        if (!document) {
            logger.warn('Document not found:', id);
            throw new AppError(404, 'Document not found');
        }

        return this.mapToResponse(document);
    }

    private mapToResponse(document: Document): DocumentResponse {
        return {
            id: document.id,
            title: document.title,
            description: document.description,
            fileUrl: document.fileUrl,
            fileType: document.fileType,
            fileSize: document.fileSize,
            tags: document.tags,
            visibility: document.visibility,
            downloadCount: document.downloadCount,
            viewCount: document.viewCount,
            ownerId: document.owner?.id || '',
            createdAt: document.createdAt,
            updatedAt: document.updatedAt
        };
    }
}