const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'education_system'
  });

  // 查看students表结构
  console.log('✅ Students表结构：');
  console.log('========================================');
  const [columns] = await conn.query('DESCRIBE students');
  columns.forEach((c) => {
    console.log(`- ${c.Field} (${c.Type})`);
  });

  // 查询前3个学生
  console.log('\n✅ Students表中的数据：');
  console.log('========================================');
  const [students] = await conn.query('SELECT * FROM students LIMIT 3');
  students.forEach((s, i) => {
    console.log(`\n学生 ${i+1}:`);
    Object.keys(s).forEach(key => {
      console.log(`  ${key}: ${s[key]}`);
    });
  });

  await conn.end();
})();
