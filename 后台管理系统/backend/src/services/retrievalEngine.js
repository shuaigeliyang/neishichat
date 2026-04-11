/**
 * 检索引擎
 * 负责文档相似度检索和重排序
 */
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RetrievalEngine {
    constructor(index, apiKey) {
        this.index = index; // 向量索引
        this.apiKey = apiKey; // 智谱AI API密钥
        this.rerankUrl = 'https://open.bigmodel.cn/api/paas/v4/rerank';
    }

    /**
     * 计算余弦相似度
     * @param {number[]} vecA - 向量A
     * @param {number[]} vecB - 向量B
     * @returns {number} 相似度分数（0-1）
     */
    cosineSimilarity(vecA, vecB) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * 检索最相关的文档块
     * @param {number[]} queryEmbedding - 查询向量
     * @param {number} topK - 返回前K个结果
     * @returns {Array<{chunk: object, score: number}>} 检索结果
     */
    retrieveTopK(queryEmbedding, topK = 15) {
        const scores = this.index.chunks.map(chunk => ({
            chunk: chunk,
            score: this.cosineSimilarity(queryEmbedding, chunk.embedding)
        }));

        // 按相似度排序
        scores.sort((a, b) => b.score - a.score);

        // 返回Top K
        return scores.slice(0, topK);
    }

    /**
     * 重排序文档（使用智谱AI Rerank API）
     * @param {string} question - 用户问题
     * @param {Array} documents - 检索到的文档
     * @returns {Promise<Array>} 重排序后的文档
     */
    async rerankDocuments(question, documents) {
        try {
            const response = await axios.post(
                this.rerankUrl,
                {
                    model: 'rerank',
                    query: question,
                    documents: documents.map(d => d.chunk.full_context),
                    top_n: documents.length
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // 更新评分
            const reranked = documents.map((doc, index) => {
                const rerankResult = response.data.results.find(r => r.index === index);
                return {
                    ...doc,
                    score: rerankResult ? rerankResult.relevance_score : doc.score
                };
            });

            // 重新排序
            return reranked.sort((a, b) => b.score - a.score);

        } catch (error) {
            console.error('Rerank失败，使用原始排序:', error.message);
            return documents;
        }
    }

    /**
     * 按页码去重，保留最相关的
     * @param {Array} sources - 检索结果
     * @returns {Array} 去重后的结果
     */
    deduplicateByPage(sources) {
        const pageMap = new Map();

        sources.forEach(source => {
            const page = source.chunk.page_num;

            if (!pageMap.has(page) || source.score > pageMap.get(page).score) {
                pageMap.set(page, source);
            }
        });

        return Array.from(pageMap.values());
    }

    /**
     * 完整的检索流程
     * @param {string} question - 用户问题
     * @param {number[]} queryEmbedding - 问题向量
     * @param {Object} options - 配置选项
     * @returns {Promise<Array>} 最终检索结果
     */
    async retrieve(question, queryEmbedding, options = {}) {
        const {
            topK = 15,
            useRerank = true,
            deduplicate = true
        } = options;

        // 1. 初步检索
        let results = this.retrieveTopK(queryEmbedding, topK);

        // 2. 重排序
        if (useRerank) {
            results = await this.rerankDocuments(question, results);
        }

        // 3. 去重
        if (deduplicate) {
            results = this.deduplicateByPage(results);
        }

        return results;
    }
}

export default RetrievalEngine;
