const fs = require('fs');

const data = JSON.parse(fs.readFileSync('../document_chunks.json', 'utf-8'));
const chunks = data.filter(c => c.page_num === 144);

console.log('第144页的文档块数量:', chunks.length);
if (chunks.length > 0) {
  chunks.forEach((c, i) => {
    console.log(`\n块${i + 1}:`);
    console.log(c.text.substring(0, 200));
  });
}
