/**
 * 重新建立RAG索引
 */

const RAGService = require('./services/ragService');
require('dotenv').config();

async function rebuildIndex() {
  console.log('✓ 开始重建RAG索引...\n');

  const ragService = new RAGService(process.env.ZHIPU_API_KEY);

  try {
    // 初始化（会自动重建索引）
    await ragService.initialize();

    const stats = ragService.getStats();
    console.log('\n✓ 索引重建完成！');
    console.log(`  - 文档块总数：${stats.totalChunks}`);
    console.log(`  - 已建立索引：${stats.indexed}`);

    // 测试问答
    console.log('\n✓ 测试问答...');
    const result = await ragService.answer('重修需要什么条件？', {
      topK: 5,
      minScore: 0.2  // 降低阈值
    });

    console.log('\n回答：');
    console.log(result.answer);
    console.log('\n来源：');
    result.sources.forEach((source, index) => {
      console.log(`${index + 1}. ${source.chapter}（第${source.page}页）`);
    });

    console.log(`\n置信度：${(result.confidence * 100).toFixed(0)}%`);
    console.log(`耗时：${result.elapsed}ms`);

  } catch (error) {
    console.error('\n✗ 重建失败：', error.message);
    process.exit(1);
  }
}

rebuildIndex().then(() => {
  console.log('\n✓ 完成');
  process.exit(0);
}).catch(error => {
  console.error('\n✗ 失败：', error);
  process.exit(1);
});
