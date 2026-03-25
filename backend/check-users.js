const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'education_system'
  });

  const [users] = await conn.query('SELECT username, email, role FROM users LIMIT 5');
  console.log('✅ 数据库中的用户：');
  console.log('========================================');
  users.forEach((u, i) => {
    console.log(`${i+1}. 用户名: ${u.username}`);
    console.log(`   邮箱: ${u.email}`);
    console.log(`   角色: ${u.role}`);
    console.log('----------------------------------------');
  });

  await conn.end();
})();
