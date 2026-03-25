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
    // 修复表单模板名称
    const updates = [
      { id: 1, name: '学科竞赛参赛申请表', desc: '用于各类学科竞赛的参赛申请', path: '/forms/学科竞赛参赛申请表.docx' },
      { id: 2, name: '转专业申请表', desc: '用于学生转专业的正式申请', path: '/forms/转专业申请表.docx' },
      { id: 3, name: '奖学金申请表', desc: '用于各类奖学金的申请', path: '/forms/奖学金申请表.docx' },
      { id: 4, name: '休学申请表', desc: '用于学生申请休学', path: '/forms/休学申请表.docx' },
      { id: 5, name: '复学申请表', desc: '用于学生申请复学', path: '/forms/复学申请表.docx' },
      { id: 6, name: '成绩证明申请表', desc: '用于申请开具成绩证明', path: '/forms/成绩证明申请表.docx' },
      { id: 7, name: '在读证明申请表', desc: '用于申请开具在读证明', path: '/forms/在读证明申请表.docx' },
      { id: 8, name: '毕业证明申请表', desc: '用于申请开具毕业证明', path: '/forms/毕业证明申请表.docx' },
      { id: 9, name: '请假申请表', desc: '用于学生申请请假（病假、事假等）', path: '/forms/请假申请表.docx' },
      { id: 10, name: '缓考申请表', desc: '用于学生申请缓期考试', path: '/forms/缓考申请表.docx' },
      { id: 11, name: '重修申请表', desc: '用于学生申请课程重修', path: '/forms/重修申请表.docx' },
      { id: 12, name: '辅修申请表', desc: '用于学生申请辅修专业', path: '/forms/辅修申请表.docx' },
      { id: 13, name: '交换生申请表', desc: '用于学生申请交换项目', path: '/forms/交换生申请表.docx' },
      { id: 14, name: '学位证明申请表', desc: '用于申请开具学位证明', path: '/forms/学位证明申请表.docx' },
      { id: 15, name: '预毕业证明申请表', desc: '用于申请开具预毕业证明', path: '/forms/预毕业证明申请表.docx' },
      { id: 16, name: '离校手续单', desc: '用于办理离校手续', path: '/forms/离校手续单.docx' },
      { id: 17, name: '调宿申请表', desc: '用于申请调换宿舍或调宿', path: '/forms/调宿申请表.docx' },
      { id: 18, name: '贫困生认定申请表', desc: '用于申请贫困生认定', path: '/forms/贫困生认定申请表.docx' },
      { id: 19, name: '助学金申请表', desc: '用于申请国家助学金', path: '/forms/助学金申请表.docx' },
      { id: 20, name: '助学贷款申请表', desc: '用于申请国家助学贷款', path: '/forms/助学贷款申请表.docx' },
      { id: 21, name: '优秀学生申请表', desc: '用于申请优秀学生称号', path: '/forms/优秀学生申请表.docx' },
      { id: 22, name: '优秀毕业生申请表', desc: '用于申请优秀毕业生称号', path: '/forms/优秀毕业生申请表.docx' }
    ];

    for (const item of updates) {
      await pool.query(
        'UPDATE form_templates SET template_name = ?, description = ?, file_path = ? WHERE template_id = ?',
        [item.name, item.desc, item.path, item.id]
      );
      console.log(`✅ 更新模板 ${item.id}: ${item.name}`);
    }

    // 验证结果
    const [rows] = await pool.query('SELECT template_id, template_name, category FROM form_templates ORDER BY template_id');
    console.log('\n📋 当前表单模板列表:');
    rows.forEach(row => {
      console.log(`  ${row.template_id}. ${row.template_name} (${row.category})`);
    });

    console.log('\n✅ 修复完成！');
  } catch (err) {
    console.error('❌ 错误:', err.message);
  } finally {
    await pool.end();
  }
})();
