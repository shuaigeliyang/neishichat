/**
 * 文档处理服务（修复版）
 * 设计师：哈雷酱大小姐 (￣▽￣)ﾉ
 * 功能：处理学生手册，分块、向量化、存储
 *
 * 修复内容：
 * 1. 确保所有页面都被处理
 * 2. 保留完整的段落内容
 * 3. 智能识别文档结构
 */

const fs = require('fs').promises;
const path = require('path');

class DocumentProcessor {
    constructor() {
        this.handbookData = null;
        this.chunks = [];
    }

    /**
     * 加载学生手册数据
     */
    async loadHandbook() {
        try {
            const jsonPath = path.join(__dirname, '../../student_handbook_full.json');
            const data = await fs.readFile(jsonPath, 'utf-8');
            this.handbookData = JSON.parse(data);
            console.log(`✓ 加载学生手册成功，共${this.handbookData.total_pages}页`);
            return this.handbookData;
        } catch (error) {
            console.error('✗ 加载学生手册失败：', error.message);
            throw error;
        }
    }

    /**
     * 智能分块 - 重新设计
     */
    chunkDocument() {
        if (!this.handbookData) {
            throw new Error('请先加载学生手册数据');
        }

        console.log('✓ 开始文档分块...');
        this.chunks = [];

        let chunkId = 0;
        let currentChapter = null;
        let currentSection = null;

        // 遍历每一页
        for (const page of this.handbookData.pages) {
            const lines = page.text.split('\n');
            let currentParagraph = [];  // 当前段落的内容

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                // 跳过空行
                if (!line) {
                    // 如果段落有内容，保存它
                    if (currentParagraph.length > 0) {
                        this.createChunkFromParagraph(currentParagraph, page.page_num, currentChapter, currentSection, ++chunkId);
                        currentParagraph = [];
                    }
                    continue;
                }

                // 检查是否是章节标题（以一、二、三、或 第X章 开头）
                if (this.isChapterTitle(line)) {
                    // 先保存之前的段落
                    if (currentParagraph.length > 0) {
                        this.createChunkFromParagraph(currentParagraph, page.page_num, currentChapter, currentSection, ++chunkId);
                        currentParagraph = [];
                    }

                    currentChapter = line;
                    currentSection = null;

                    // 章节标题也作为一个独立的文档块
                    this.chunks.push({
                        id: ++chunkId,
                        text: line,
                        page_num: page.page_num,
                        chapter_title: line,
                        section_title: '',
                        chunk_type: 'chapter_title'
                    });
                    continue;
                }

                // 检查是否是小节标题（包含"办法"、"规定"、"管理"等）
                if (this.isSectionTitle(line)) {
                    // 先保存之前的段落
                    if (currentParagraph.length > 0) {
                        this.createChunkFromParagraph(currentParagraph, page.page_num, currentChapter, currentSection, ++chunkId);
                        currentParagraph = [];
                    }

                    currentSection = line;

                    // 小节标题也作为一个独立的文档块
                    this.chunks.push({
                        id: ++chunkId,
                        text: line,
                        page_num: page.page_num,
                        chapter_title: currentChapter || '未分类',
                        section_title: line,
                        chunk_type: 'section_title'
                    });
                    continue;
                }

                // 将行添加到当前段落
                currentParagraph.push(line);
            }

            // 页面结束时，保存最后一个段落
            if (currentParagraph.length > 0) {
                this.createChunkFromParagraph(currentParagraph, page.page_num, currentChapter, currentSection, ++chunkId);
            }
        }

        console.log(`✓ 分块完成，共生成${this.chunks.length}个文档块`);
        return this.chunks;
    }

    /**
     * 从段落创建文档块
     */
    createChunkFromParagraph(paragraph, pageNum, chapter, section, id) {
        const text = paragraph.join(' ');

        // 跳过太短的段落
        if (text.length < 5) {
            return;
        }

        this.chunks.push({
            id: id,
            text: text,
            page_num: pageNum,
            chapter_title: chapter || '未分类',
            section_title: section || '',
            chunk_type: this.identifyChunkType(text)
        });
    }

    /**
     * 判断是否是章节标题
     */
    isChapterTitle(line) {
        // 匹配："一、"、"二、" 或 "第一章"、"第二章" 等
        return /^(一|二|三|四|五|六|七|八|九|十|十一|十二|十[三四五六七八九十]、|第[一二三四五六七八九十百零千]+章)/.test(line);
    }

    /**
     * 判断是否是小节标题
     */
    isSectionTitle(line) {
        // 匹配：包含"办法"、"规定"、"管理"等关键词的短文本
        const isShort = line.length < 100;
        const hasKeyword = /办法|规定|管理|细则|条例|试行|修订/.test(line);
        return isShort && hasKeyword;
    }

    /**
     * 识别文档块类型
     */
    identifyChunkType(text) {
        if (/第.*条/.test(text)) return 'article';
        if (/说明|释义|定义/.test(text)) return 'explanation';
        if (/办法|规定|条例|细则/.test(text)) return 'policy';
        return 'content';
    }

    /**
     * 合并小块为较大的块（暂时禁用，保持原始分块）
     */
    mergeSmallChunks(minLength = 500, maxLength = 1500) {
        console.log('✓ 跳过合并步骤，保持原始分块');
        // 不再合并，保持每个段落独立
        return this.chunks;
    }

    /**
     * 添加上下文窗口
     */
    addContextWindow(windowSize = 1) {
        console.log('✓ 添加上下文窗口...');

        const chunksWithContext = this.chunks.map((chunk, index) => {
            const beforeChunks = this.chunks.slice(Math.max(0, index - windowSize), index);
            const afterChunks = this.chunks.slice(index + 1, Math.min(this.chunks.length, index + windowSize + 1));

            // 只取相同页面的上下文
            const samePageBefore = beforeChunks.filter(c => c.page_num === chunk.page_num);
            const samePageAfter = afterChunks.filter(c => c.page_num === chunk.page_num);

            const beforeText = samePageBefore.map(c => c.text).join('\n');
            const afterText = samePageAfter.map(c => c.text).join('\n');

            return {
                ...chunk,
                context_before: beforeText,
                context_after: afterText,
                full_context: beforeText + '\n' + chunk.text + '\n' + afterText
            };
        });

        this.chunks = chunksWithContext;
        console.log('✓ 上下文窗口添加完成');
        return this.chunks;
    }

    /**
     * 保存为JSON文件
     */
    async saveChunks(outputPath) {
        try {
            const jsonPath = outputPath || path.join(__dirname, '../../document_chunks.json');
            await fs.writeFile(jsonPath, JSON.stringify(this.chunks, null, 2), 'utf-8');
            console.log(`✓ 文档块已保存到：${jsonPath}`);
            return jsonPath;
        } catch (error) {
            console.error('✗ 保存文档块失败：', error.message);
            throw error;
        }
    }

    /**
     * 获取统计信息
     */
    getStats() {
        if (!this.chunks || this.chunks.length === 0) {
            return null;
        }

        const totalLength = this.chunks.reduce((sum, chunk) => sum + chunk.text.length, 0);
        const avgLength = Math.round(totalLength / this.chunks.length);

        const typeCounts = {};
        this.chunks.forEach(chunk => {
            typeCounts[chunk.chunk_type] = (typeCounts[chunk.chunk_type] || 0) + 1;
        });

        const pageCounts = {};
        this.chunks.forEach(chunk => {
            pageCounts[chunk.page_num] = (pageCounts[chunk.page_num] || 0) + 1;
        });

        const uniquePages = Object.keys(pageCounts).map(Number).sort((a, b) => a - b);

        return {
            totalChunks: this.chunks.length,
            totalLength,
            avgLength,
            typeCounts,
            totalPages: uniquePages.length,
            pageRange: `${uniquePages[0]}-${uniquePages[uniquePages.length - 1]}`
        };
    }
}

// 导出
module.exports = DocumentProcessor;

// 如果直接运行此文件
if (require.main === module) {
    (async () => {
        const processor = new DocumentProcessor();

        try {
            // 1. 加载学生手册
            await processor.loadHandbook();

            // 2. 分块
            processor.chunkDocument();

            // 3. 合并小块
            processor.mergeSmallChunks();

            // 4. 添加上下文
            processor.addContextWindow();

            // 5. 保存
            await processor.saveChunks();

            // 6. 显示统计
            const stats = processor.getStats();
            console.log('\n✓ 统计信息：');
            console.log(`  - 总块数：${stats.totalChunks}`);
            console.log(`  - 总字数：${stats.totalLength}`);
            console.log(`  - 平均字数：${stats.avgLength}`);
            console.log(`  - 总页数：${stats.totalPages}`);
            console.log(`  - 页码范围：${stats.pageRange}`);
            console.log(`  - 类型分布：`, stats.typeCounts);

            // 7. 验证重要页面
            console.log('\n✓ 验证重要页面：');
            const importantPages = [138, 139, 144, 145];
            const pageCounts = {};
            processor.chunks.forEach(chunk => {
                pageCounts[chunk.page_num] = (pageCounts[chunk.page_num] || 0) + 1;
            });

            importantPages.forEach(pageNum => {
                const count = pageCounts[pageNum] || 0;
                console.log(`  - 第${pageNum}页：${count}个文档块 ${count > 0 ? '✅' : '❌'}`);
            });

        } catch (error) {
            console.error('处理失败：', error);
            process.exit(1);
        }
    })();
}
