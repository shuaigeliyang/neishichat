-- ============================================
-- 初始化chat_history表
-- @author 哈雷酱大小姐 (￣▽￣)ﾉ
-- ============================================

-- 如果表存在则删除（谨慎使用！）
-- DROP TABLE IF EXISTS chat_history;

-- 创建chat_history表
CREATE TABLE IF NOT EXISTS chat_history (
    chat_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '对话ID',
    user_type ENUM('student', 'teacher', 'admin') NOT NULL COMMENT '用户类型',
    user_id INT NOT NULL COMMENT '用户ID',
    user_question TEXT NOT NULL COMMENT '用户问题',
    ai_answer TEXT COMMENT 'AI回答',
    intent VARCHAR(100) COMMENT '识别的意图',
    sql_query TEXT COMMENT '生成的SQL（如果有）',
    query_result TEXT COMMENT '查询结果摘要',
    satisfaction TINYINT COMMENT '满意度评分（1-5分）',
    session_id VARCHAR(100) COMMENT '会话ID（用于关联多轮对话）',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user (user_type, user_id),
    INDEX idx_session (session_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对话历史表';

-- 验证表是否创建成功
SELECT
    'chat_history表创建成功' as message,
    COUNT(*) as table_exists
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'chat_history';
