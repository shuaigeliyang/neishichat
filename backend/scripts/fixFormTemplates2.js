const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'education_system',
    charset: 'utf8mb4'
  });

  try {
    // 先删除所有现有数据
    await pool.query('DELETE FROM form_templates');
    console.log('✅ 已清空表单模板表');

    // 直接使用SQL插入，确保使用UTF8编码
    const templates = [
      [1, '学科竞赛参赛申请表', '申请表', '用于各类学科竞赛的参赛申请', '/forms/学科竞赛参赛申请表.docx', '全体学生', 1],
      [2, '转专业申请表', '申请表', '用于学生转专业的正式申请', '/forms/转专业申请表.docx', '全体学生', 2],
      [3, '奖学金申请表', '申请表', '用于各类奖学金的申请', '/forms/奖学金申请表.docx', '全体学生', 3],
      [4, '休学申请表', '申请表', '用于学生申请休学', '/forms/休学申请表.docx', '全体学生', 4],
      [5, '复学申请表', '申请表', '用于学生申请复学', '/forms/复学申请表.docx', '全体学生', 5],
      [6, '成绩证明申请表', '证明表', '用于申请开具成绩证明', '/forms/成绩证明申请表.docx', '全体学生', 6],
      [7, '在读证明申请表', '证明表', '用于申请开具在读证明', '/forms/在读证明申请表.docx', '全体学生', 7],
      [8, '毕业证明申请表', '证明表', '用于申请开具毕业证明', '/forms/毕业证明申请表.docx', '全体学生', 8],
      [9, '请假申请表', '申请表', '用于学生申请请假（病假、事假等）', '/forms/请假申请表.docx', '全体学生', 9],
      [10, '缓考申请表', '申请表', '用于学生申请缓期考试', '/forms/缓考申请表.docx', '全体学生', 10],
      [11, '重修申请表', '申请表', '用于学生申请课程重修', '/forms/重修申请表.docx', '全体学生', 11],
      [12, '辅修申请表', '申请表', '用于学生申请辅修专业', '/forms/辅修申请表.docx', '全体学生', 12],
      [13, '交换生申请表', '申请表', '用于学生申请交换项目', '/forms/交换生申请表.docx', '全体学生', 13],
      [14, '学位证明申请表', '证明表', '用于申请开具学位证明', '/forms/学位证明申请表.docx', '全体学生', 14],
      [15, '预毕业证明申请表', '证明表', '用于申请开具预毕业证明', '/forms/预毕业证明申请表.docx', '全体学生', 15],
      [16, '离校手续单', '其他', '用于办理离校手续', '/forms/离校手续单.docx', '全体学生', 16],
      [17, '调宿申请表', '申请表', '用于申请调换宿舍或调宿', '/forms/调宿申请表.docx', '全体学生', 17],
      [18, '贫困生认定申请表', '申请表', '用于申请贫困生认定', '/forms/贫困生认定申请表.docx', '全体学生', 18],
      [19, '助学金申请表', '申请表', '用于申请国家助学金', '/forms/助学金申请表.docx', '全体学生', 19],
      [20, '助学贷款申请表', '申请表', '用于申请国家助学贷款', '/forms/助学贷款申请表.docx', '全体学生', 20],
      [21, '优秀学生申请表', '申请表', '用于申请优秀学生称号', '/forms/优秀学生申请表.docx', '全体学生', 21],
      [22, '优秀毕业生申请表', '申请表', '用于申请优秀毕业生称号', '/forms/优秀毕业生申请表.docx', '全体学生', 22]
    ];

    for (const t of templates) {
      const sql = `INSERT INTO form_templates (template_id, template_name, category, description, file_path, target_audience, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      await pool.query(sql, t);
      console.log(`✅ 插入模板 ${t[0]}: ${Buffer.from(t[1], 'utf8').toString()}`);
    }

    // 验证结果
    const [rows] = await pool.query('SELECT template_id, template_name, category FROM form_templates ORDER BY template_id');
    console.log('\n📋 当前表单模板列表:');
    rows.forEach(row => {
      console.log(`  ${row.template_id}. ${Buffer.from(row.template_name, 'latin1').toString('utf8')} (${Buffer.from(row.category, 'latin1').toString('utf8')})`);
    });

    console.log('\n✅ 修复完成！');
  } catch (err) {
    console.error('❌ 错误:', err.message);
  } finally {
    await pool.end();
  }
})();
