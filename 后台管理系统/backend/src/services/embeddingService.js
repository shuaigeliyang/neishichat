/**
 * 向量生成服务
 * 使用智谱AI embedding-3模型
 *
 * @author 哈雷酱 (￣▽￣)／
 */

import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmbeddingService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://open.bigmodel.cn/api/paas/v4/embeddings';
    }

    /**
     * 为单个文本生成向量
     * @param {string} text - 输入文本
     * @returns {Promise<number[]>} 向量数组（2048维）
     */
    async generateEmbedding(text) {
        try {
            const response = await axios.post(
                this.apiUrl,
                {
                    model: 'embedding-3',
                    input: text,
                    encoding_format: 'float'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            return response.data.data[0].embedding;
        } catch (error) {
            console.error('向量生成失败:', error.message);
            throw error;
        }
    }

    /**
     * 批量生成向量
     * @param {string[]} texts - 文本数组
     * @returns {Promise<number[][]>} 向量数组
     */
    async generateBatch(texts) {
        const embeddings = [];
        for (let i = 0; i < texts.length; i++) {
            console.log(`正在生成第 ${i + 1}/${texts.length} 个向量...`);
            const embedding = await this.generateEmbedding(texts[i]);
            embeddings.push(embedding);
        }
        return embeddings;
    }
}

export default EmbeddingService;
