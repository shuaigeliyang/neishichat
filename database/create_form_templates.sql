-- ============================================
-- 表单模板表创建脚本
-- 设计者：哈雷酱大小姐 (￣▽￣)ﾉ
-- 创建时间：2026-03-25
-- 功能：存储学生手册各类表单模板
-- ============================================

USE education_system;

-- 创建表单模板表
CREATE TABLE IF NOT EXISTS form_templates (
    template_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '模板ID',
    template_name VARCHAR(200) NOT NULL COMMENT '模板名称',
    category VARCHAR(50) NOT NULL COMMENT '分类（申请表/证明表/其他）',
    description TEXT COMMENT '模板说明',
    file_path VARCHAR(255) NOT NULL COMMENT '文件路径',
    file_type VARCHAR(20) DEFAULT 'docx' COMMENT '文件类型',
    file_size BIGINT COMMENT '文件大小（字节）',
    download_count INT DEFAULT 0 COMMENT '下载次数',
    target_audience ENUM('全体学生', '全体教师', '管理员', '全体用户') DEFAULT '全体学生' COMMENT '适用对象',
    status TINYINT DEFAULT 1 COMMENT '状态：1-可用，0-不可用',
    sort_order INT DEFAULT 0 COMMENT '排序序号',
    created_by INT COMMENT '创建人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_category (category),
    INDEX idx_target_audience (target_audience),
    INDEX idx_status (status),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='表单模板表';

-- 插入初始数据
INSERT INTO form_templates (template_name, category, description, file_path, target_audience, sort_order) VALUES
('学科竞赛参赛申请表', '申请表', '用于各类学科竞赛的参赛申请', '/forms/学科竞赛参赛申请表.docx', '全体学生', 1),
('转专业申请表', '申请表', '用于学生转专业的正式申请', '/forms/转专业申请表.docx', '全体学生', 2),
('奖学金申请表', '申请表', '用于各类奖学金的申请', '/forms/奖学金申请表.docx', '全体学生', 3),
('休学申请表', '申请表', '用于学生申请休学', '/forms/休学申请表.docx', '全体学生', 4),
('复学申请表', '申请表', '用于学生申请复学', '/forms/复学申请表.docx', '全体学生', 5),
('成绩证明申请表', '证明表', '用于申请开具成绩证明', '/forms/成绩证明申请表.docx', '全体学生', 6),
('在读证明申请表', '证明表', '用于申请开具在读证明', '/forms/在读证明申请表.docx', '全体学生', 7),
('毕业证明申请表', '证明表', '用于申请开具毕业证明', '/forms/毕业证明申请表.docx', '全体学生', 8);

-- 验证插入结果
SELECT
    template_id,
    template_name,
    category,
    target_audience,
    sort_order
FROM form_templates
ORDER BY sort_order;
