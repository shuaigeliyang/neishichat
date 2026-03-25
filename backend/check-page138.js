const fs = require('fs');

const data = JSON.parse(fs.readFileSync('../student_handbook_full.json', 'utf-8'));
console.log('student_handbook_full.json总页数:', data.total_pages);

const page138 = data.pages.find(p => p.page_num === 138);
console.log('第138页存在:', !!page138);

if (page138) {
  console.log('第138页文本长度:', page138.text.length);
  console.log('包含"重修":', page138.text.includes('重修'));
  console.log('包含"课程重修":', page138.text.includes('课程重修'));
}
