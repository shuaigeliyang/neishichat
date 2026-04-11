import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 答案生成服务
 * 使用智谱AI GLM-4模型生成答案
 */

class QAGenerator {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    }

    /**
     * 生成答案
     * @param {string} question - 用户问题
     * @param {Array} sources - 检索到的文档片段
     * @returns {Promise<{answer: string, sources: Array, confidence: number}>} 生成的答案
     */
    async generateAnswer(question, sources) {
        // 构建上下文
        let context = '';
        sources.forEach((source, index) => {
            context += `文档片段${index + 1}（相关度：${(source.score * 100).toFixed(0)}%）：\n`;
            context += `[第${source.chunk.page_num}页] ${source.chunk.text}\n\n`;
        });

        try {
            // 调用AI生成答案
            const response = await axios.post(
                this.apiUrl,
                {
                    model: 'glm-4-flash',
                    messages: [
                        {
                            role: 'system',
                            content: `你是基于文档的专业问答助手。请根据提供的文档片段准确回答问题。如果文档中没有相关信息，请明确说明。`
                        },
                        {
                            role: 'user',
                            content: `问题：${question}\n\n参考文档：\n${context}\n\n请基于以上文档回答问题。`
                        }
                    ]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                answer: response.data.choices[0].message.content,
                sources: sources.map(s => ({
                    page: s.chunk.page_num,
                    score: s.score,
                    snippet: s.chunk.text.substring(0, 100) + '...'
                })),
                confidence: sources[0]?.score || 0
            };
        } catch (error) {
            console.error('答案生成失败:', error.message);
            throw error;
        }
    }
}

export default QAGenerator;
