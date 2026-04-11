/**
 * 创建标准化文档库目录结构
 *
 * 目录结构：
 * E:\外包\教育系统智能体\
 * ├── 文档库/
 * │   ├── registry.json               ← 文档注册表
 * │   ├── documents/                  ← 文档存储
 * │   │   └── doc_TEMPLATE/          ← 模板目录
 * │   │       ├── meta.json
 * │   │       ├── source/
 * │   │       ├── extracted/
 * │   │       │   ├── pages/
 * │   │       │   └── images/
 * │   │       └── chunks/
 * │   └── indexes/                   ← 统一检索索引
 * │       └── .gitkeep
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DirectoryStructureCreator {
    constructor(rootPath) {
        this.rootPath = rootPath;
        this.baseDir = path.join(rootPath, '文档库');
    }

    /**
     * 初始化目录结构
     */
    async initialize() {
        console.log('='.repeat(60));
        console.log('📁 开始创建标准化文档库目录结构');
        console.log('='.repeat(60));
        console.log();

        const dirs = [
            // 根目录
            this.baseDir,
            path.join(this.baseDir, 'documents'),
            path.join(this.baseDir, 'indexes'),

            // 文档模板目录结构
            path.join(this.baseDir, 'documents', 'doc_TEMPLATE'),
            path.join(this.baseDir, 'documents', 'doc_TEMPLATE', 'source'),
            path.join(this.baseDir, 'documents', 'doc_TEMPLATE', 'extracted'),
            path.join(this.baseDir, 'documents', 'doc_TEMPLATE', 'extracted', 'pages'),
            path.join(this.baseDir, 'documents', 'doc_TEMPLATE', 'extracted', 'images'),
            path.join(this.baseDir, 'documents', 'doc_TEMPLATE', 'chunks'),
        ];

        console.log('📂 创建目录结构...');
        for (const dir of dirs) {
            await fs.mkdir(dir, { recursive: true });
            console.log(`   ✓ ${path.relative(this.rootPath, dir)}`);
        }
        console.log();

        // 创建注册表
        await this.createRegistry();

        // 创建文档模板元数据
        await this.createTemplateMeta();

        // 创建.gitkeep文件
        await this.createGitkeep();

        console.log();
        console.log('='.repeat(60));
        console.log('✅ 目录结构创建完成！');
        console.log('='.repeat(60));
        console.log();
        console.log('📍 文档库路径:', this.baseDir);
        console.log('📋 注册表:', path.join(this.baseDir, 'registry.json'));
        console.log();
    }

    /**
     * 创建注册表
     */
    async createRegistry() {
        const registry = {
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

        const registryPath = path.join(this.baseDir, 'registry.json');

        // 检查是否已存在
        try {
            await fs.access(registryPath);
            console.log('⚠️  注册表已存在，跳过创建');
        } catch {
            await fs.writeFile(registryPath, JSON.stringify(registry, null, 2), 'utf-8');
            console.log('📄 创建注册表: registry.json');
        }
    }

    /**
     * 创建文档模板元数据
     */
    async createTemplateMeta() {
        const templateMeta = {
            documentId: 'doc_TEMPLATE',
            name: '文档模板',
            displayName: '文档模板',
            description: '新建文档时使用的模板结构',
            status: 'template',
            priority: 0,
            tags: [],
            sourceFiles: [],
            statistics: {
                totalPages: 0,
                totalChunks: 0,
                indexedChunks: 0,
                fileSize: 0
            },
            processingHistory: [],
            indexedAt: null,
            updatedAt: new Date().toISOString(),
            directory: 'documents/doc_TEMPLATE',
            isTemplate: true
        };

        const metaPath = path.join(this.baseDir, 'documents', 'doc_TEMPLATE', 'meta.json');

        try {
            await fs.access(metaPath);
        } catch {
            await fs.writeFile(metaPath, JSON.stringify(templateMeta, null, 2), 'utf-8');
            console.log('📄 创建模板元数据: meta.json');
        }
    }

    /**
     * 创建.gitkeep文件
     */
    async createGitkeep() {
        const gitkeepPath = path.join(this.baseDir, 'indexes', '.gitkeep');
        try {
            await fs.access(gitkeepPath);
        } catch {
            await fs.writeFile(gitkeepPath, '', 'utf-8');
        }
    }

    /**
     * 获取目录结构信息
     */
    async getStructure() {
        const structure = {
            baseDir: this.baseDir,
            exists: false,
            hasRegistry: false,
            documentCount: 0,
            totalChunks: 0
        };

        try {
            await fs.access(this.baseDir);
            structure.exists = true;

            // 检查注册表
            const registryPath = path.join(this.baseDir, 'registry.json');
            try {
                await fs.access(registryPath);
                structure.hasRegistry = true;

                const registryData = await fs.readFile(registryPath, 'utf-8');
                const registry = JSON.parse(registryData);
                structure.documentCount = registry.documents.length;
                structure.totalChunks = registry.documents.reduce(
                    (sum, doc) => sum + (doc.statistics?.totalChunks || 0),
                    0
                );
            } catch {
                // 注册表不存在
            }
        } catch {
            // 目录不存在
        }

        return structure;
    }
}

// 主函数
async function main() {
    const args = process.argv.slice(2);
    const rootPath = args[0] || path.resolve(__dirname, '../../..');

    console.log();
    console.log('🎯 文档库目录结构创建工具');
    console.log('📁 目标路径:', rootPath);
    console.log();

    const creator = new DirectoryStructureCreator(rootPath);

    // 检查现有结构
    const structure = await creator.getStructure();

    if (structure.exists) {
        console.log('📊 当前结构状态:');
        console.log(`   - 目录已存在: ${structure.exists ? '是' : '否'}`);
        console.log(`   - 注册表已创建: ${structure.hasRegistry ? '是' : '否'}`);
        console.log(`   - 文档数量: ${structure.documentCount}`);
        console.log(`   - 总分块数: ${structure.totalChunks}`);
        console.log();

        const readline = await import('readline');
        const rl = readline.default.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise(resolve => {
            rl.question('⚠️ 目录已存在，是否重新初始化？（这不会删除现有文档）[y/N]: ', resolve);
        });
        rl.close();

        if (answer.toLowerCase() !== 'y') {
            console.log('已取消');
            return;
        }
    }

    await creator.initialize();

    // 显示最终状态
    const finalStructure = await creator.getStructure();
    console.log('📊 最终结构状态:');
    console.log(`   - 文档数量: ${finalStructure.documentCount}`);
    console.log();
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('❌ 创建目录结构失败:', error.message);
        process.exit(1);
    });
}

export default DirectoryStructureCreator;
