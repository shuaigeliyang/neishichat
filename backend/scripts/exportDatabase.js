const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = 'e:\\外包\\教育系统智能体\\database\\education_system_full.sql';

(async () => {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'education_system'
  });

  let sql = `-- =====================================================
-- 教育系统数据库完整导入脚本
-- 生成时间: ${new Date().toISOString()}
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

`;

  try {
    // 1. 获取所有表
    const [tables] = await pool.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);

    // 2. 导出每个表的结构和数据
    for (const tableName of tableNames) {
      console.log(`正在导出表: ${tableName}`);

      // 获取表结构
      const [createTableRows] = await pool.query(`SHOW CREATE TABLE ${tableName}`);
      const createTableSQL = createTableRows[0]['Create Table'];
      
      sql += `-- -------------------------------------------------------------
-- 表结构: ${tableName}
-- -------------------------------------------------------------
DROP TABLE IF EXISTS ${tableName};
${createTableSQL};

`;

      // 获取表数据
      const [rows] = await pool.query(`SELECT * FROM ${tableName}`);
      
      if (rows.length > 0) {
        sql += `-- -------------------------------------------------------------
-- 表数据: ${tableName} (${rows.length} 条记录)
-- -------------------------------------------------------------
`;

        for (const row of rows) {
          const keys = Object.keys(row);
          const values = Object.values(row).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
            return val;
          });
          
          sql += `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        sql += '\n';
      }
    }

    sql += `SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 导入完成！
-- =====================================================
`;

    // 写入文件
    fs.writeFileSync(OUTPUT_FILE, sql, 'utf8');
    console.log(`\n✅ 导出成功！`);
    console.log(`📁 文件位置: ${OUTPUT_FILE}`);
    console.log(`📊 共导出 ${tableNames.length} 个表`);

  } catch (err) {
    console.error('❌ 导出失败:', err.message);
  } finally {
    await pool.end();
  }
})();
