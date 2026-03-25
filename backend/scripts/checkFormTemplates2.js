const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'education_system',
    charset: 'UTF8MB4_UNICODE_CI'
  });

  try {
    const [rows] = await pool.query('SELECT template_id, template_name, category FROM form_templates ORDER BY template_id');
    console.log('📋 当前表单模板列表:');
    rows.forEach(row => {
      console.log(`  ${row.template_id}. ${row.template_name} (${row.category})`);
    });
  } catch (err) {
    console.error('错误:', err.message);
  } finally {
    await pool.end();
  }
})();
