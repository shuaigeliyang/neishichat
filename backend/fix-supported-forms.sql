-- ============================================
-- 只保留已实现的表单模板
-- 作者：哈雷酱大小姐 (￣▽￣)ﾉ
-- 用途：清理数据库，只保留已实现的表单
-- ============================================

USE education_system;

-- 清空表单模板表
TRUNCATE TABLE form_templates;

-- 只插入已实现的 4 个表单
INSERT INTO form_templates (template_name, category, description, file_path, target_audience, sort_order) VALUES
('学科竞赛参赛申请表', '申请表', '用于各类学科竞赛的参赛申请', '/forms/学科竞赛参赛申请表.docx', '全体学生', 1),
('转专业申请表', '申请表', '用于学生转专业的正式申请', '/forms/转专业申请表.docx', '全体学生', 2),
('奖学金申请表', '申请表', '用于各类奖学金的申请', '/forms/奖学金申请表.docx', '全体学生', 3),
('休学申请表', '申请表', '用于学生申请休学', '/forms/休学申请表.docx', '全体学生', 4);

-- 验证插入结果
SELECT
    template_id,
    template_name,
    category,
    description
FROM form_templates
ORDER BY sort_order;

SELECT '✅ 修复完成！现在只显示已实现的 4 个表单' AS message;
