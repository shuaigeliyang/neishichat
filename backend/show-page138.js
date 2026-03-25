const fs = require('fs');

const data = JSON.parse(fs.readFileSync('../student_handbook_full.json', 'utf-8'));
const page138 = data.pages.find(p => p.page_num === 138);

console.log('第138页内容:');
console.log(page138.text);
