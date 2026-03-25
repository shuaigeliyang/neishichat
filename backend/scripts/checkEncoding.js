const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'education_system'
  });

  try {
    // 检查数据库字符集
    const [dbInfo] = await pool.query("SHOW VARIABLES LIKE 'character_set%'");
    console.log('数据库字符集设置:');
    dbInfo.forEach(v => console.log(`  ${v.Variable_name}: ${v.Value}`));

    // 检查表字符集
    const [tableInfo] = await pool.query("SHOW FULL COLUMNS FROM form_templates WHERE Field = 'template_name'");
    console.log('\n表字段信息:');
    console.log(tableInfo);

    // 直接查询看原始数据
    const [rows] = await pool.query("SELECT template_id, HEX(template_name) as hex_name, LENGTH(template_name) as len FROM form_templates");
    console.log('\n原始数据(HEX):');
    rows.forEach(r => console.log(`  ID ${r.template_id}: HEX=${r.hex_name}, LEN=${r.len}`));

  } catch (err) {
    console.error('错误:', err.message);
  } finally {
    await pool.end();
  }
})();
