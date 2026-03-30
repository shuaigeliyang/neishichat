/**
 * 修复重复成绩数据的SQL脚本
 * @author 哈雷酱大小姐 (￣▽￣)ﾉ
 *
 * 使用说明：
 * 1. 备份数据库（重要！）
 *    mysqldump -uroot -proot education_system > backup_before_fix.sql
 *
 * 2. 执行本脚本
 *    mysql -uroot -proot education_system < fix_duplicate_grades.sql
 *
 * 3. 验证结果
 *    SELECT * FROM grades_check;
 */

-- ============================================
-- 第一步：检测重复数据
-- ============================================

-- 创建临时表存储重复的记录
CREATE TEMPORARY TABLE IF NOT EXISTS grades_duplicate AS
SELECT
    student_id,
    offering_id,
    COUNT(*) as count
FROM grades
GROUP BY student_id, offering_id
HAVING COUNT(*) > 1;

-- 显示重复数据统计
SELECT
    '检测到重复数据' as message,
    COUNT(*) as duplicate_count,
    (SELECT COUNT(*) FROM grades) as total_records
FROM grades_duplicate;

-- 显示具体的重复记录
SELECT
    g.grade_id,
    g.student_id,
    g.offering_id,
    c.course_name,
    c.course_code,
    g.total_score,
    g.created_at
FROM grades g
LEFT JOIN course_offerings co ON g.offering_id = co.offering_id
LEFT JOIN courses c ON co.course_id = c.course_id
WHERE g.offering_id IN (
    SELECT offering_id
    FROM grades_duplicate
)
ORDER BY g.offering_id, g.grade_id;

-- ============================================
-- 第二步：删除重复数据，保留最早的一条
-- ============================================

-- 创建备份表
CREATE TABLE IF NOT EXISTS grades_backup AS
SELECT * FROM grades;

-- 删除重复数据，保留每个student_id+offering_id组合中grade_id最小的那条
DELETE g1 FROM grades g1
INNER JOIN grades g2
WHERE g1.grade_id > g2.grade_id
AND g1.student_id = g2.student_id
AND g1.offering_id = g2.offering_id;

-- ============================================
-- 第三步：验证修复结果
-- ============================================

-- 检查是否还有重复数据
CREATE TEMPORARY TABLE IF NOT EXISTS grades_check AS
SELECT
    student_id,
    offering_id,
    COUNT(*) as count
FROM grades
GROUP BY student_id, offering_id
HAVING COUNT(*) > 1;

-- 显示修复结果
SELECT
    CASE
        WHEN (SELECT COUNT(*) FROM grades_check) = 0
        THEN '✅ 修复成功！没有重复数据了'
        ELSE '❌ 仍然存在重复数据'
    END as fix_result;

-- 显示最终统计
SELECT
    (SELECT COUNT(*) FROM grades_backup) as original_count,
    (SELECT COUNT(*) FROM grades) as current_count,
    (SELECT COUNT(*) FROM grades_backup) - (SELECT COUNT(*) FROM grades) as deleted_count;

-- 清理临时表
DROP TEMPORARY TABLE IF NOT EXISTS grades_duplicate;
DROP TEMPORARY TABLE IF NOT EXISTS grades_check;

-- ============================================
-- 可选：添加唯一索引防止未来重复
-- ============================================

-- 检查是否已存在唯一索引
SELECT
    COUNT(*) as index_exists
FROM information_schema.statistics
WHERE table_schema = 'education_system'
AND table_name = 'grades'
AND index_name = 'uk_student_offering';

-- 如果不存在，创建唯一索引
-- 注意：如果数据有重复，这个操作会失败
-- 需要先执行上面的删除重复数据步骤
ALTER TABLE grades
ADD UNIQUE KEY uk_student_offering (student_id, offering_id);

SELECT '✅ 已添加唯一索引，防止未来出现重复数据' as message;
