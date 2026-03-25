/**
 * 测试检索
 */

const RAGService = require('./services/ragService');
require('dotenv').config();

async function testRetrieval() {
  console.log('✓ 开始测试检索...\n');

  const ragService = new RAGService(process.env.ZHIPU_API_KEY);

  try {
    // 1. 初始化
    console.log('1️⃣ 初始化RAG服务...');
    await ragService.initialize();
    console.log('✅ 初始化成功\n');

    // 2. 测试多个问题
    const questions = [
      '重修需要什么条件？',
      '课程重修管理办法',
      '重修',
      '学生手册 重修',
      '内江师范学院 重修'
    ];

    for (const question of questions) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`问题：${question}`);
      console.log('='.repeat(80));

      const result = await ragService.answer(question, {
        topK: 5,
        minScore: 0.1  // 非常低的阈值
      });

      console.log(`\n找到文档块：${result.sources.length}`);
      result.sources.forEach((source, index) => {
        console.log(`  ${index + 1}. [${source.chapter}] 相似度：${source.score.toFixed(3)}`);
        console.log(`      片段：${source.snippet.substring(0, 100)}...`);
      });
    }

  } catch (error) {
    console.error('\n❌ 测试失败：');
    console.error('错误信息：', error.message);
    console.error('错误堆栈：', error.stack);
  }
}

testRetrieval().then(() => {
  console.log('\n✓ 测试完成');
  process.exit(0);
}).catch(error => {
  console.error('\n✗ 测试异常：', error);
  process.exit(1);
});
