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
    const [tables] = await pool.query('SHOW TABLES');
    console.log('=== 数据库完整表结构 ===\n');
    
    for (const t of tables) {
      const tableName = Object.values(t)[0];
      console.log(`\n📌 ${tableName}:`);
      
      const [columns] = await pool.query(`DESCRIBE ${tableName}`);
      columns.forEach(col => {
        console.log(`   ${col.Field} (${col.Type})`);
      });
    }
  } catch (err) {
    console.error('错误:', err.message);
  } finally {
    await pool.end();
  }
})();
