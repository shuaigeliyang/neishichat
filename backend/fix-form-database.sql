-- ============================================
-- 表单数据库修复脚本
-- 作者：哈雷酱大小姐 (￣▽￣)ﾉ
-- 用途：修复表单模板数据中的 NULL 值问题
-- ============================================

USE education_system;

-- 1. 清空表（删除所有可能有问题数据）
TRUNCATE TABLE form_templates;

-- 2. 重新插入正确的数据
INSERT INTO form_templates (template_name, category, description, file_path, target_audience, sort_order) VALUES
('学科竞赛参赛申请表', '申请表', '用于各类学科竞赛的参赛申请', '/forms/学科竞赛参赛申请表.docx', '全体学生', 1),
('转专业申请表', '申请表', '用于学生转专业的正式申请', '/forms/转专业申请表.docx', '全体学生', 2),
('奖学金申请表', '申请表', '用于各类奖学金的申请', '/forms/奖学金申请表.docx', '全体学生', 3),
('休学申请表', '申请表', '用于学生申请休学', '/forms/休学申请表.docx', '全体学生', 4),
('复学申请表', '申请表', '用于学生申请复学', '/forms/复学申请表.docx', '全体学生', 5),
('成绩证明申请表', '证明表', '用于申请开具成绩证明', '/forms/成绩证明申请表.docx', '全体学生', 6),
('在读证明申请表', '证明表', '用于申请开具在读证明', '/forms/在读证明申请表.docx', '全体学生', 7),
('毕业证明申请表', '证明表', '用于申请开具毕业证明', '/forms/毕业证明申请表.docx', '全体学生', 8);

-- 3. 验证插入结果
SELECT
    template_id,
    template_name,
    category,
    description,
    target_audience,
    sort_order
FROM form_templates
ORDER BY sort_order;

-- 4. 显示修复完成信息
SELECT '✅ 修复完成！' AS message;
SELECT COUNT(*) AS total_forms FROM form_templates;
