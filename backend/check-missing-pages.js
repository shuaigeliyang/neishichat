const fs = require('fs');

const data = JSON.parse(fs.readFileSync('../document_chunks.json', 'utf-8'));
const pages = [...new Set(data.map(c => c.page_num))].sort((a, b) => a - b);

console.log('document_chunks.json中的页码数:', pages.length);
console.log('页码范围:', pages[0], '-', pages[pages.length - 1]);

const missing = [];
for (let i = 1; i <= 200; i++) {
  if (!pages.includes(i)) missing.push(i);
}

console.log('1-200页中缺失的页码数:', missing.length);
console.log('缺失的页码（前20个）:', missing.slice(0, 20));
console.log('缺失的页码（20-40）:', missing.slice(20, 40));
console.log('缺失的页码（40-60）:', missing.slice(40, 60));
console.log('缺失的页码（60-80）:', missing.slice(60, 80));
console.log('缺失的页码（80-100）:', missing.slice(80, 100));
console.log('缺失的页码（100-120）:', missing.slice(100, 120));
console.log('缺失的页码（120-140）:', missing.slice(120, 140));
console.log('缺失的页码（140-144）:', missing.slice(140, 144));
