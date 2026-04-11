/**
 * 文档注册表服务
 *
 * 管理文档元数据、状态追踪、CRUD操作
 *
 * @author 哈雷酱 (￣▽￣)／
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DocumentRegistry {
    constructor() {
        // 文档根目录 - 使用相对路径，便于迁移
        // 相对于后台管理系统backend/src/services目录
        // 需要往回4层：services -> src -> backend -> 教育系统根目录 -> 相关文档
        this.basePath = path.resolve(__dirname, '../../../../相关文档');
        this.registryPath = path.join(this.basePath, 'registry.json');
    }

    /**
     * 初始化注册表
     */
    async initialize() {
        // 确保目录存在
        await fs.mkdir(this.basePath, { recursive: true });

        try {
            await fs.access(this.registryPath);
        } catch {
            // 创建默认注册表
            await this.saveRegistry({
                version: '1.0',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                config: {
                    indexName: 'retrieval_index',
                    embeddingModel: 'embedding-3',
                    chunkStrategy: 'intelligent',
                    chunkSize: 1000,
                    chunkOverlap: 200
                },
                documents: []
            });
            console.log('✓ 文档注册表已初始化');
        }
    }

    /**
     * 获取注册表
     */
    async getRegistry() {
        try {
            const data = await fs.readFile(this.registryPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            // 如果文件不存在，返回默认注册表
            return {
                version: '1.0',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                config: {
                    indexName: 'retrieval_index',
                    embeddingModel: 'embedding-3',
                    chunkStrategy: 'intelligent',
                    chunkSize: 1000,
                    chunkOverlap: 200
                },
                documents: []
            };
        }
    }

    /**
     * 保存注册表
     */
    async saveRegistry(registry) {
        registry.updatedAt = new Date().toISOString();
        await fs.writeFile(this.registryPath, JSON.stringify(registry, null, 2), 'utf-8');
        return registry;
    }

    /**
     * 生成文档ID
     */
    generateDocumentId() {
        const timestamp = Date.now();
        const shortId = uuidv4().substring(0, 8);
        return `doc_${timestamp}_${shortId}`;
    }

    /**
     * 注册新文档
     */
    async registerDocument(documentInfo) {
        const registry = await this.getRegistry();

        const documentId = this.generateDocumentId();
        const safeName = this.sanitizeFileName(documentInfo.name || documentInfo.displayName || '未命名文档');

        // 生成文档目录名（使用UUID避免中文问题）
        const directory = `doc_${documentId}`;

        const document = {
            documentId,
            name: safeName,
            displayName: documentInfo.displayName || safeName,
            description: documentInfo.description || '',
            status: 'pending',
            priority: documentInfo.priority || registry.documents.length + 1,
            tags: documentInfo.tags || [],
            sourceFiles: documentInfo.sourceFiles || [],
            directory,  // 添加目录属性
            statistics: {
                totalPages: 0,
                totalChunks: 0,
                indexedChunks: 0,
                fileSize: documentInfo.sourceFiles?.[0]?.fileSize || 0
            },
            processingHistory: [],
            indexedAt: null,
            updatedAt: new Date().toISOString()
        };

        registry.documents.push(document);
        await this.saveRegistry(registry);

        // 创建文档目录结构
        await this.createDocumentStructure(document);

        console.log(`✓ 文档已注册: ${document.displayName} (${documentId})`);
        console.log(`✓ 目录: ${document.directory}`);
        return document;
    }

    /**
     * 清理文件名中的非法字符
     */
    sanitizeFileName(name) {
        // 移除或替换非法字符
        return name
            .replace(/[<>:"/\\|?*]/g, '_')
            .replace(/\s+/g, '_')
            .substring(0, 100); // 限制长度
    }

    /**
     * 创建文档目录结构
     */
    async createDocumentStructure(document) {
        const docDir = path.join(this.basePath, document.directory);

        const dirs = [
            'source',
            'extracted/pages',
            'extracted/images',
            'chunks'
        ];

        for (const dir of dirs) {
            await fs.mkdir(path.join(docDir, dir), { recursive: true });
        }

        // 保存元数据到文档目录
        await fs.writeFile(
            path.join(docDir, 'meta.json'),
            JSON.stringify(document, null, 2),
            'utf-8'
        );

        console.log(`✓ 文档目录已创建: ${document.directory}`);
    }

    /**
     * 获取文档信息
     */
    async getDocument(documentId) {
        const registry = await this.getRegistry();
        return registry.documents.find(d => d.documentId === documentId);
    }

    /**
     * 获取所有文档
     * 自动扫描相关文档目录下的所有文件，并检查处理状态
     */
    async getAllDocuments() {
        const registry = await this.getRegistry();

        try {
            // 确保目录存在
            await fs.mkdir(this.basePath, { recursive: true });

            // 扫描目录下的所有文件
            const files = await fs.readdir(this.basePath);

            // 过滤出文档文件（.docx, .doc, .pdf, .txt, .md）
            const docExtensions = ['.docx', '.doc', '.pdf', '.txt', '.md'];
            const docFiles = [];

            for (const file of files) {
                const ext = path.extname(file).toLowerCase();
                if (docExtensions.includes(ext)) {
                    const filePath = path.join(this.basePath, file);
                    const stats = await fs.stat(filePath);

                    if (stats.isFile()) {
                        docFiles.push({
                            name: path.basename(file, ext),  // 文件名（不含扩展名）作为文档名称
                            fileName: file,  // 实际文件名
                            fileType: ext,
                            fileSize: stats.size,
                            updatedAt: stats.mtime.toISOString()
                        });
                    }
                }
            }

            // 构建文档列表
            const documents = [];
            const registeredFiles = new Set(registry.documents.map(d => d.sourceFiles?.[0]?.fileName).filter(Boolean));

            // 1. 添加已注册的文档（并检查实际处理状态）
            for (const doc of registry.documents) {
                if (!doc.isTemplate) {
                    // 检查实际的处理状态
                    const actualStatus = await this.checkProcessedStatus(doc.name, doc.directory);
                    if (actualStatus.status === 'indexed' && doc.status !== 'indexed') {
                        // 更新为已索引状态
                        doc.status = 'indexed';
                        doc.statistics = { ...doc.statistics, ...actualStatus.statistics };
                        doc.indexedAt = actualStatus.indexedAt;
                        console.log(`✓ 检测到已处理文档: ${doc.name}`);
                    }
                    documents.push(doc);
                }
            }

            // 2. 自动添加未注册的文档文件
            for (const file of docFiles) {
                if (!registeredFiles.has(file.fileName)) {
                    // 检查是否已处理（检查文档目录）
                    const processedStatus = await this.checkProcessedStatus(file.name);

                    const documentId = this.generateDocumentId();
                    const newDoc = {
                        documentId,
                        name: file.name,
                        displayName: file.name,
                        description: '自动扫描发现的文档',
                        status: processedStatus.status,
                        priority: documents.length + 1,
                        tags: [],
                        sourceFiles: [{
                            fileName: file.fileName,
                            fileType: file.fileType,
                            fileSize: file.fileSize,
                            uploadedAt: file.updatedAt,
                            autoDetected: true
                        }],
                        statistics: {
                            ...processedStatus.statistics,
                            fileSize: file.fileSize  // 确保文件大小被记录
                        },
                        processingHistory: [],
                        indexedAt: processedStatus.indexedAt,
                        updatedAt: file.updatedAt,
                        autoDetected: true
                    };
                    documents.push(newDoc);
                    console.log(`✓ 自动发现文档: ${file.name} (${file.fileName}) - 状态: ${processedStatus.status}`);
                }
            }

            // 如果注册表为空且目录中有文件，同步更新注册表
            if (registry.documents.length === 0 && documents.length > 0) {
                registry.documents = documents;
                await this.saveRegistry(registry);
                console.log(`✓ 已同步 ${documents.length} 个文档到注册表`);
            }

            return documents;

        } catch (error) {
            console.error('扫描文档目录失败:', error);
            return registry.documents.filter(d => !d.isTemplate);
        }
    }

    /**
     * 检查文档处理状态
     * 检查文档目录下的extracted和chunks目录
     */
    async checkProcessedStatus(docName, docDirectory = null) {
        // 优先使用文档目录检查，否则使用文档名称查找
        let extractPath = null;

        if (docDirectory) {
            // 直接使用文档目录
            extractPath = path.join(this.basePath, docDirectory);
        } else {
            // 尝试查找匹配的文档目录
            try {
                const entries = await fs.readdir(this.basePath);
                for (const entry of entries) {
                    if (entry.startsWith('doc_') || entry === docName) {
                        const metaPath = path.join(this.basePath, entry, 'meta.json');
                        try {
                            const metaData = JSON.parse(await fs.readFile(metaPath, 'utf-8'));
                            if (metaData.name === docName || metaData.displayName === docName) {
                                extractPath = path.join(this.basePath, entry);
                                break;
                            }
                        } catch {}
                    }
                }
            } catch {}
        }

        if (!extractPath) {
            return {
                status: 'pending',
                statistics: { totalPages: 0, totalChunks: 0, indexedChunks: 0, fileSize: 0 },
                indexedAt: null
            };
        }

        try {
            // 检查必要文件
            const contentPath = path.join(extractPath, 'extracted', 'content.json');
            const chunksPath = path.join(extractPath, 'chunks', 'chunks.json');

            const hasContent = await fs.access(contentPath).then(() => true).catch(() => false);
            const hasChunks = await fs.access(chunksPath).then(() => true).catch(() => false);

            if (hasContent && hasChunks) {
                // 读取统计数据
                let stats = { totalPages: 0, totalChunks: 0, indexedChunks: 0, fileSize: 0 };
                let indexedAt = null;

                try {
                    const contentData = JSON.parse(await fs.readFile(contentPath, 'utf-8'));
                    stats.totalPages = contentData.total_pages || contentData.pages?.length || 0;
                } catch (e) {}

                try {
                    const chunksData = JSON.parse(await fs.readFile(chunksPath, 'utf-8'));
                    const chunks = chunksData.chunks || [];
                    stats.totalChunks = chunks.length;
                    stats.indexedChunks = chunks.length;
                } catch (e) {}

                try {
                    const metaData = await fs.readFile(path.join(extractPath, 'meta.json'), 'utf-8');
                    const meta = JSON.parse(metaData);
                    indexedAt = meta.indexedAt;
                } catch (e) {
                    indexedAt = new Date().toISOString();
                }

                return {
                    status: 'indexed',
                    statistics: stats,
                    indexedAt
                };
            } else {
                return {
                    status: 'pending',
                    statistics: { totalPages: 0, totalChunks: 0, indexedChunks: 0, fileSize: 0 },
                    indexedAt: null
                };
            }
        } catch {
            return {
                status: 'pending',
                statistics: { totalPages: 0, totalChunks: 0, indexedChunks: 0, fileSize: 0 },
                indexedAt: null
            };
        }
    }

    /**
     * 更新文档状态
     */
    async updateDocumentStatus(documentId, status, details = {}) {
        const registry = await this.getRegistry();
        const document = registry.documents.find(d => d.documentId === documentId);

        if (!document) {
            throw new Error(`文档不存在: ${documentId}`);
        }

        document.status = status;
        document.updatedAt = new Date().toISOString();

        // 更新统计信息
        if (details.statistics) {
            document.statistics = { ...document.statistics, ...details.statistics };
        }

        // 添加处理历史
        if (details.step) {
            document.processingHistory.push({
                step: details.step,
                status: details.status || status,
                timestamp: new Date().toISOString(),
                details: details.details || ''
            });
        }

        // 如果是indexed状态，记录索引时间
        if (status === 'indexed' && !document.indexedAt) {
            document.indexedAt = new Date().toISOString();
        }

        await this.saveRegistry(registry);

        console.log(`✓ 文档状态已更新: ${documentId} -> ${status}`);
        return document;
    }

    /**
     * 删除文档
     */
    async deleteDocument(documentId) {
        const registry = await this.getRegistry();
        const index = registry.documents.findIndex(d => d.documentId === documentId);

        if (index === -1) {
            throw new Error(`文档不存在: ${documentId}`);
        }

        const document = registry.documents[index];
        registry.documents.splice(index, 1);

        await this.saveRegistry(registry);

        console.log(`✓ 文档已从注册表删除: ${documentId}`);
        return document;
    }

    /**
     * 获取所有已索引的文档
     */
    async getIndexedDocuments() {
        const registry = await this.getRegistry();
        return registry.documents.filter(d => d.status === 'indexed' && !d.isTemplate);
    }

    /**
     * 获取待处理的文档
     */
    async getPendingDocuments() {
        const registry = await this.getRegistry();
        return registry.documents.filter(d => d.status === 'pending' && !d.isTemplate);
    }

    /**
     * 获取处理中的文档
     */
    async getProcessingDocuments() {
        const registry = await this.getRegistry();
        const processingStatuses = ['extracting', 'extracted', 'chunking', 'chunked', 'indexing'];
        return registry.documents.filter(d => processingStatuses.includes(d.status) && !d.isTemplate);
    }

    /**
     * 获取文档统计信息
     * 使用getAllDocuments()获取最新状态（包含checkProcessedStatus检测结果）
     */
    async getStatistics() {
        const documents = await this.getAllDocuments();

        // 累加文件大小：优先使用statistics.fileSize，否则使用sourceFiles中的大小
        const totalSize = documents.reduce((sum, d) => {
            const statSize = d.statistics?.fileSize || 0;
            if (statSize > 0) return sum + statSize;
            // fallback: 从sourceFiles获取实际文件大小
            return sum + (d.sourceFiles?.reduce((s, f) => s + (f.fileSize || 0), 0) || 0);
        }, 0);

        return {
            total: documents.length,
            indexed: documents.filter(d => d.status === 'indexed').length,
            pending: documents.filter(d => d.status === 'pending').length,
            processing: documents.filter(d =>
                ['extracting', 'extracted', 'chunking', 'chunked', 'indexing'].includes(d.status)
            ).length,
            error: documents.filter(d => d.status === 'error').length,
            totalChunks: documents.reduce((sum, d) => sum + (d.statistics?.totalChunks || 0), 0),
            totalSize
        };
    }

    /**
     * 更新注册表配置
     */
    async updateConfig(config) {
        const registry = await this.getRegistry();
        registry.config = { ...registry.config, ...config };
        await this.saveRegistry(registry);
        return registry.config;
    }

    /**
     * 获取文档源文件路径
     * 直接从相关文档目录读取
     */
    getDocumentSourcePath(document) {
        if (!document.sourceFiles || document.sourceFiles.length === 0) {
            return null;
        }
        // 直接从相关文档目录读取，不需要source子目录
        return path.join(this.basePath, document.sourceFiles[0].fileName);
    }

    /**
     * 获取文档提取结果路径
     */
    getDocumentExtractedPath(document) {
        return path.join(this.basePath, document.directory, 'extracted', 'content.json');
    }

    /**
     * 获取文档分块结果路径
     */
    getDocumentChunksPath(document) {
        return path.join(this.basePath, document.directory, 'chunks', 'chunks.json');
    }

    /**
     * 获取统一检索索引路径
     */
    getIndexPath() {
        return path.join(this.basePath, 'indexes', 'retrieval_index.json');
    }
}

export default DocumentRegistry;
