/**
 * 向量化服务
 * 设计师：哈雷酱大小姐 (￣▽￣)ﾉ
 * 功能：将文本转换为向量，用于语义搜索
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class EmbeddingService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://open.bigmodel.cn/api/paas/v4/embeddings';
        this.model = 'embedding-2';  // 使用智谱AI的embedding模型
        this.cache = new Map();  // 缓存已计算的向量
    }

    /**
     * 为单个文本生成向量
     */
    async getEmbedding(text) {
        // 检查缓存
        const cacheKey = this.hashText(text);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await axios.post(
                this.apiUrl,
                {
                    model: this.model,
                    input: text
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            const embedding = response.data.data[0].embedding;

            // 缓存结果
            this.cache.set(cacheKey, embedding);

            return embedding;
        } catch (error) {
            console.error('✗ 向量化失败：', error.message);
            throw error;
        }
    }

    /**
     * 批量生成向量
     */
    async getBatchEmbeddings(texts, batchSize = 10) {
        const embeddings = [];

        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            console.log(`  - 处理批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`);

            const batchPromises = batch.map(text => this.getEmbedding(text));
            const batchResults = await Promise.all(batchPromises);
            embeddings.push(...batchResults);

            // 避免请求过快
            await this.sleep(1000);
        }

        return embeddings;
    }

    /**
     * 为文档块生成向量
     */
    async embedChunks(chunks) {
        console.log(`✓ 开始为${chunks.length}个文档块生成向量...`);

        // 使用full_context（包含上下文）进行向量化，效果更好
        const texts = chunks.map(chunk => chunk.full_context || chunk.text);

        const embeddings = await this.getBatchEmbeddings(texts);

        // 将向量添加到文档块
        const chunksWithEmbeddings = chunks.map((chunk, index) => ({
            ...chunk,
            embedding: embeddings[index]
        }));

        console.log('✓ 向量化完成！');
        return chunksWithEmbeddings;
    }

    /**
     * 计算余弦相似度
     */
    cosineSimilarity(vec1, vec2) {
        if (vec1.length !== vec2.length) {
            throw new Error('向量长度不一致');
        }

        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;

        for (let i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i];
            norm1 += vec1[i] * vec1[i];
            norm2 += vec2[i] * vec2[i];
        }

        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    /**
     * 找到最相似的文档块
     * ✨ 修改：添加minScore参数，允许外部传入阈值，默认从0.5降低到0.3
     */
    async findMostSimilar(questionEmbedding, chunks, topK = 5, minScore = 0.3) {
        const similarities = chunks.map(chunk => {
            const embedding = chunk.embedding;
            if (!embedding) {
                return { chunk, score: 0 };
            }

            const score = this.cosineSimilarity(questionEmbedding, embedding);
            return { chunk, score };
        });

        // 排序并取Top-K
        const topKResults = similarities
            .sort((a, b) => b.score - a.score)
            .slice(0, topK)
            .filter(item => item.score >= minScore);  // ✨ 修改：使用传入的minScore参数，而不是硬编码的0.5

        return topKResults;
    }

    /**
     * 文本哈希（用于缓存）
     */
    hashText(text) {
        // 简单的哈希函数
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    /**
     * 延时函数
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 保存向量缓存
     */
    async saveCache(filePath) {
        try {
            const cacheData = Array.from(this.cache.entries());
            await fs.writeFile(filePath, JSON.stringify(cacheData), 'utf-8');
            console.log(`✓ 向量缓存已保存到：${filePath}`);
        } catch (error) {
            console.error('✗ 保存缓存失败：', error.message);
        }
    }

    /**
     * 加载向量缓存
     */
    async loadCache(filePath) {
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            const cacheData = JSON.parse(data);
            this.cache = new Map(cacheData);
            console.log(`✓ 向量缓存已加载，共${this.cache.size}条`);
        } catch (error) {
            console.log('✗ 未找到缓存文件，将创建新缓存');
        }
    }

    /**
     * 获取缓存统计
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024  // MB
        };
    }
}

// 导出
module.exports = EmbeddingService;

// 如果直接运行此文件
if (require.main === module) {
    (async () => {
        const apiKey = process.env.ZHIPU_API_KEY || 'your-api-key-here';
        const embeddingService = new EmbeddingService(apiKey);

        try {
            // 测试向量化
            const testText = "重修管理办法";
            console.log('✓ 测试文本：', testText);

            const embedding = await embeddingService.getEmbedding(testText);
            console.log('✓ 向量维度：', embedding.length);

            // 显示缓存统计
            const stats = embeddingService.getCacheStats();
            console.log('✓ 缓存统计：', stats);

        } catch (error) {
            console.error('测试失败：', error);
            process.exit(1);
        }
    })();
}
