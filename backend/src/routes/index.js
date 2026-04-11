/**
 * 统一索引 API 路由
 * 设计师：哈雷酱 (￣▽￣)／
 * 功能：提供统一索引管理的REST API
 */

const express = require('express');
const UnifiedIndexManager = require('../../services/unifiedIndexManager');

const router = express.Router();

// 初始化服务（中间件）
router.use(async (req, res, next) => {
    if (!req.indexManager) {
        const apiKey = process.env.ZHIPU_API_KEY;
        req.indexManager = new UnifiedIndexManager(apiKey, {
            embeddingMode: process.env.EMBEDDING_MODE || 'api'
        });
        await req.indexManager.initialize();
    }
    next();
});

/**
 * GET /api/index/status
 * 获取统一索引状态
 */
router.get('/status', async (req, res) => {
    try {
        const stats = req.indexManager.getStatistics();

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/index/rebuild
 * 重建统一索引
 */
router.post('/rebuild', async (req, res) => {
    try {
        // TODO: 实现重建逻辑
        res.json({
            success: true,
            message: '统一索引重建功能开发中...'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
