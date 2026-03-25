const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'education_system'
  });

  console.log('✅ Teachers表中的数据：');
  console.log('========================================');
  const [teachers] = await conn.query('SELECT * FROM teachers LIMIT 3');
  teachers.forEach((t, i) => {
    console.log(`\n教师 ${i+1}:`);
    console.log(`  工号: ${t.teacher_code}`);
    console.log(`  姓名: ${t.name}`);
    console.log(`  邮箱: ${t.email}`);
    console.log(`  密码: 123456 (默认)`);
  });

  await conn.end();
})();
