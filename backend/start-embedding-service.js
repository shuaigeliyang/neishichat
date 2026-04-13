/**
 * 本地Embedding服务启动脚本
 * @author 哈雷酱 (￣▽￣)ﾉ
 * @description 启动本地Embedding服务，端口5001
 */

const LocalEmbeddingService = require('./local-embedding-server.js');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.LOCAL_EMBEDDING_PORT || 5001;

// 启用CORS
app.use(cors());

// 创建Embedding服务实例
const embeddingService = new LocalEmbeddingService();

// API路由
app.post('/embeddings', async (req, res) => {
  try {
    const { texts } = req.body;

    if (!Array.isArray(texts)) {
      return res.status(400).json({
        success: false,
        message: 'texts must be an array'
      });
    }

    const embeddings = await embeddingService.getEmbeddings(texts);

    res.json({
      success: true,
      embeddings: embeddings,
      model: embeddingService.modelName,
      dimension: embeddings[0]?.length || 384
    });
  } catch (error) {
    console.error('Embedding生成失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  const stats = embeddingService.getCacheStats();
  res.json({
    success: true,
    service: 'local-embedding-service',
    status: 'running',
    port: PORT,
    model: embeddingService.modelName,
    cache: stats
  });
});

// 启动服务
(async () => {
  console.log('========================================');
  console.log('  本地Embedding服务');
  console.log('  设计师：哈雷酱 (￣▽￣)ﾉ');
  console.log('========================================\n');

  try {
    // 初始化模型
    await embeddingService.initialize();

    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log('\n========================================');
      console.log('✅ Embedding服务启动成功！');
      console.log('========================================');
      console.log(`  服务地址：http://localhost:${PORT}`);
      console.log(`  健康检查：http://localhost:${PORT}/health`);
      console.log(`  模型：${embeddingService.modelName}`);
      console.log('========================================\n');
    });

    // 定期保存缓存
    setInterval(() => {
      embeddingService.saveCacheToFile();
    }, 5 * 60 * 1000); // 每5分钟

    // 优雅退出
    process.on('SIGINT', async () => {
      console.log('\n正在关闭服务...');
      await embeddingService.saveCacheToFile();
      process.exit(0);
    });

  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
})();
