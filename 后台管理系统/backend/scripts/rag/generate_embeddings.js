const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 智谱AI配置
const ZHIPUAI_API_KEY = process.env.ZHIPUAI_API_KEY || '';
const ZHIPUAI_EMBEDDING_URL = 'https://open.bigmodel.cn/api/paas/v4/embeddings';

/**
 * 生成单个文本的向量
 */
async function generateEmbedding(text) {
    try {
        const response = await axios.post(
            ZHIPUAI_EMBEDDING_URL,
            {
                model: 'embedding-3',
                input: text,
                encoding_format: 'float'
            },
            {
                headers: {
                    'Authorization': `Bearer ${ZHIPUAI_API_KEY}`,
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
 * 批量生成向量（带缓存）
 */
async function generateEmbeddingsBatch(chunks, cachePath = 'output/embedding_cache.json') {
    // 加载缓存
    let cache = {};
    if (fs.existsSync(cachePath)) {
        cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
        console.log(`✓ 已加载缓存，共 ${Object.keys(cache).length} 条记录`);
    }

    const chunksWithEmbeddings = [];
    let cacheHits = 0;

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const cacheKey = `chunk_${chunk.chunk_id}`;

        if (cache[cacheKey]) {
            // 使用缓存
            chunksWithEmbeddings.push({
                ...chunk,
                embedding: cache[cacheKey]
            });
            cacheHits++;
        } else {
            // 生成新向量
            console.log(`正在生成第 ${i + 1}/${chunks.length} 个向量...`);

            const embedding = await generateEmbedding(chunk.full_context);

            chunksWithEmbeddings.push({
                ...chunk,
                embedding: embedding
            });

            // 更新缓存
            cache[cacheKey] = embedding;

            // 每10个保存一次缓存
            if ((i + 1) % 10 === 0) {
                fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
            }
        }
    }

    // 保存最终缓存
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));

    console.log(`✓ 向量生成完成`);
    console.log(`✓ 缓存命中: ${cacheHits}/${chunks.length}`);

    return chunksWithEmbeddings;
}

/**
 * 创建检索索引
 */
async function createRetrievalIndex(chunksPath, outputPath) {
    // 加载分块
    const data = JSON.parse(fs.readFileSync(chunksPath, 'utf-8'));
    const chunks = data.chunks;

    console.log(`开始为 ${chunks.length} 个文档块生成向量...`);

    // 生成向量
    const chunksWithEmbeddings = await generateEmbeddingsBatch(chunks);

    // 创建索引
    const indexData = {
        metadata: {
            ...data.metadata,
            indexed: true,
            vector_dimension: 2048,
            timestamp: new Date().toISOString()
        },
        chunks: chunksWithEmbeddings
    };

    // 保存索引
    fs.writeFileSync(outputPath, JSON.stringify(indexData, null, 2));

    console.log(`✓ 索引创建完成: ${outputPath}`);
    console.log(`✓ 索引大小: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);

    return indexData;
}

// 主函数
async function main() {
    try {
        if (!ZHIPUAI_API_KEY) {
            console.error('❌ 错误: 请设置 ZHIPUAI_API_KEY 环境变量');
            process.exit(1);
        }

        const chunksPath = process.argv[2] || 'output/chunks.json';
        const outputPath = process.argv[3] || 'output/retrieval_index.json';

        await createRetrievalIndex(chunksPath, outputPath);

        console.log('\n✅ 向量化完成！');
    } catch (error) {
        console.error('❌ 错误:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { generateEmbedding, createRetrievalIndex };
