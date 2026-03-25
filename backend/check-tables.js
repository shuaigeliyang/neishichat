const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'education_system'
  });

  const [tables] = await conn.query('SHOW TABLES');
  console.log('✅ 数据库中的表：');
  console.log('========================================');
  tables.forEach((t, i) => {
    const tableName = Object.values(t)[0];
    console.log(`${i+1}. ${tableName}`);
  });

  // 检查students表
  try {
    const [students] = await conn.query('SELECT student_id, name, class FROM students LIMIT 3');
    console.log('\n✅ Students表中的示例数据：');
    console.log('========================================');
    students.forEach((s, i) => {
      console.log(`${i+1}. 学号: ${s.student_id} | 姓名: ${s.name} | 班级: ${s.class}`);
    });
  } catch (e) {
    console.log('Students表不存在或无数据');
  }

  await conn.end();
})();
