/**
 * 统一RAG问答服务 - 使用统一索引管理器
 *
 * @author 哈雷酱 (￣▽￣)／
 */

import axios from 'axios';
import unifiedIndexManager from './unifiedIndexManager.js';
import eventBus from './eventBus.js';

class UnifiedRAGService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.ZHIPUAI_CHAT_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
        this.ZHIPUAI_EMBEDDING_URL = 'https://open.bigmodel.cn/api/paas/v4/embeddings';
        this.model = 'glm-4-flash';
        this.initialized = false;
    }

    /**
     * 初始化
     */
    async initialize() {
        if (this.initialized) return;

        console.log('✓ 初始化统一RAG服务...');
        await unifiedIndexManager.initialize();

        // 订阅事件 - 当有新文档索引时，RAG自动感知
        const EventTypes = eventBus.constructor.EventTypes;
        eventBus.on(EventTypes.DOCUMENT_INDEXED, (event) => {
            console.log('📢 [RAG] 检测到新文档索引:', event.data.documentId);
        });

        eventBus.on(EventTypes.DOCUMENT_DELETED, (event) => {
            console.log('📢 [RAG] 检测到文档删除:', event.data.documentId);
        });

        this.initialized = true;
        console.log('✓ 统一RAG服务初始化完成');
    }

    /**
     * 问答
     */
    async ask(question, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        const { topK = 5, minScore = 0.3 } = options;

        console.log(`\n========== 问题：${question} ==========`);

        // 1. 生成问题向量
        const questionEmbedding = await this.generateEmbedding(question);

        // 2. 检索相关chunks
        const results = await unifiedIndexManager.retrieve(questionEmbedding, { topK, minScore });

        console.log(`检索到 ${results.length} 个相关chunks`);

        if (results.length === 0) {
            return {
                answer: '抱歉，我在已索引的文档中没有找到与您问题相关的内容。',
                sources: []
            };
        }

        // 3. 构建上下文
        const context = results.map((r, i) =>
            `[文档${i + 1}] ${r.chunk.documentName} (相关度: ${(r.score * 100).toFixed(1)}%)\n${r.chunk.text || r.chunk.full_context}`
        ).join('\n\n');

        // 4. 调用LLM生成回答
        const answer = await this.generateAnswer(question, context, results);

        return {
            answer,
            sources: results.map(r => ({
                documentId: r.chunk.documentId,
                documentName: r.chunk.documentName,
                page: r.chunk.page || r.chunk.metadata?.page,
                score: r.score,
                snippet: (r.chunk.text || r.chunk.full_context || '').substring(0, 200)
            }))
        };
    }

    /**
     * 生成Embedding
     */
    async generateEmbedding(text) {
        try {
            const response = await axios.post(
                this.ZHIPUAI_EMBEDDING_URL,
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
            console.error('Embedding生成失败:', error.message);
            throw error;
        }
    }

    /**
     * 生成回答
     */
    async generateAnswer(question, context, retrievedChunks) {
        const systemPrompt = `你是教育系统的智能助手，负责根据提供的文档内容回答用户问题。

规则：
1. 只根据提供的文档内容回答，不要编造信息
2. 如果文档内容不足以回答问题，说明"文档中没有相关信息"
3. 回答要清晰、有条理
4. 适当引用文档来源

提供的文档内容：
${context}`;

        try {
            const response = await axios.post(
                this.ZHIPUAI_CHAT_URL,
                {
                    model: this.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: question }
                    ],
                    temperature: 0.7
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 60000
                }
            );

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('LLM调用失败:', error.message);
            throw error;
        }
    }

    /**
     * 获取统计信息
     */
    getStatistics() {
        return unifiedIndexManager.getStatistics();
    }

    /**
     * 获取已索引的文档列表
     */
    getIndexedDocuments() {
        return unifiedIndexManager.index?.documents || [];
    }
}

export default UnifiedRAGService;
