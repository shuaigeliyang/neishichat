const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

async function testAPIKey() {
  console.log('测试智谱AI API Key...');
  console.log('API Key:', process.env.ZHIPU_API_KEY);
  
  try {
    const response = await axios.post(
      'https://open.bigmodel.cn/api/paas/v4/embeddings',
      {
        model: 'embedding-3',
        input: '测试文本'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.ZHIPU_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    console.log('✅ API Key 有效！');
    console.log('向量维度:', response.data.data[0].embedding.length);
    return true;
  } catch (error) {
    console.error('❌ API Key 测试失败');
    console.error('状态码:', error.response?.status);
    console.error('错误信息:', error.response?.data || error.message);
    return false;
  }
}

testAPIKey();
