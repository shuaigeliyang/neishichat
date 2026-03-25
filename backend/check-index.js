/**
 * 检查索引文件
 */

const fs = require('fs').promises;

async function checkIndex() {
  try {
    const data = await fs.readFile('../retrieval_index.json', 'utf-8');
    const index = JSON.parse(data);

    console.log('✓ 索引文件加载成功\n');
    console.log(`总文档块：${index.chunks.length}`);
    console.log(`已建立索引：${index.indexed}`);
    console.log(`索引时间：${index.timestamp}\n`);

    // 检查第一个文档块
    const firstChunk = index.chunks[0];
    console.log('第一个文档块：');
    console.log(`  - ID: ${firstChunk.id}`);
    console.log(`  - 文本长度：${firstChunk.text.length}`);
    console.log(`  - 章节标题：${firstChunk.chapter_title}`);
    console.log(`  - 页码：${firstChunk.page_num}`);
    console.log(`  - 有embedding：${firstChunk.embedding ? '是' : '否'}`);

    if (firstChunk.embedding) {
      console.log(`  - embedding维度：${firstChunk.embedding.length}`);
      console.log(`  - embedding前5个值：[${firstChunk.embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}]`);
    }

    // 检查有多少文档块有embedding
    const chunksWithEmbedding = index.chunks.filter(c => c.embedding && c.embedding.length > 0);
    console.log(`\n有embedding的文档块：${chunksWithEmbedding.length}/${index.chunks.length}`);

  } catch (error) {
    console.error('❌ 检查失败：', error.message);
  }
}

checkIndex();
