/**
 * RAG服务调试脚本
 * 用途：测试RAG接口是否正常工作
 */

require('dotenv').config();
const RAGService = require('./services/ragService');

console.log('🔍 开始调试RAG服务...\n');

// 检查API key
console.log('1️⃣ 检查环境变量：');
console.log('   ZHIPU_API_KEY:', process.env.ZHIPU_API_KEY ? process.env.ZHIPU_API_KEY.substring(0, 20) + '...' : '未设置');
console.log('   EMBEDDING_MODE:', process.env.EMBEDDING_MODE);
console.log('   RERANK_MODE:', process.env.RERANK_MODE);
console.log();

// 创建RAG服务实例
const ragService = new RAGService(process.env.ZHIPU_API_KEY, {
    embeddingMode: process.env.EMBEDDING_MODE || 'api'
});

(async () => {
    try {
        console.log('2️⃣ 初始化RAG服务...');
        await ragService.initialize();
        console.log('   ✅ RAG服务初始化成功\n');

        // 测试简单问题
        console.log('3️⃣ 测试问题：挂科怎么办');
        const result1 = await ragService.answer('挂科怎么办', {
            topK: 5,
            minScore: 0.3
        });

        console.log('   ✅ 回答成功！');
        console.log('   来源数量:', result1.sources.length);
        console.log('   置信度:', (result1.confidence * 100).toFixed(1) + '%');
        console.log('   耗时:', result1.elapsed + 'ms');
        console.log();

        // 显示来源
        if (result1.sources.length > 0) {
            console.log('   📚 参考来源：');
            result1.sources.forEach((source, index) => {
                console.log(`      ${index + 1}. ${source.chapter}（第${source.page}页）- score: ${source.score?.toFixed(3) || 'N/A'}`);
            });
        }
        console.log();

        // 测试复杂问题
        console.log('4️⃣ 测试问题：挂科会影响毕业吗');
        const result2 = await ragService.answer('挂科会影响毕业吗', {
            topK: 8,
            minScore: 0.3
        });

        console.log('   ✅ 回答成功！');
        console.log('   来源数量:', result2.sources.length);
        console.log('   置信度:', (result2.confidence * 100).toFixed(1) + '%');
        console.log('   耗时:', result2.elapsed + 'ms');
        console.log();

        // 显示来源
        if (result2.sources.length > 0) {
            console.log('   📚 参考来源：');
            result2.sources.forEach((source, index) => {
                console.log(`      ${index + 1}. ${source.chapter}（第${source.page}页）- score: ${source.score?.toFixed(3) || 'N/A'}`);
            });
        }
        console.log();

        console.log('✅ 所有测试通过！RAG服务工作正常！\n');

    } catch (error) {
        console.error('❌ 测试失败：', error.message);
        console.error('   错误堆栈：', error.stack);
        process.exit(1);
    }
})();
