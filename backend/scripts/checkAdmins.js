/**
 * 检查管理员表
 */
require('dotenv').config();
const { query } = require('../src/config/database');

async function checkAdmins() {
  try {
    console.log('📋 检查是否有admins表...\n');

    // 尝试查询admins表
    try {
      const admins = await query('SELECT * FROM admins LIMIT 5');

      if (admins.length > 0) {
        console.log('✅ 找到admins表，现有管理员：\n');
        console.table(admins.map(a => ({
          id: a.admin_id,
          username: a.username,
          name: a.name,
          email: a.email
        })));
      } else {
        console.log('ℹ️  admins表为空，需要创建管理员账号');
      }

      console.log('\n管理员表结构：');
      const structure = await query('DESCRIBE admins');
      console.table(structure);

    } catch (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') {
        console.log('❌ admins表不存在\n');
        console.log('💡 提示：需要创建admins表或使用其他方式管理管理员');
      } else {
        throw err;
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    process.exit(1);
  }
}

checkAdmins();
