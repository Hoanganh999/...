import https from 'https';

export default function handler(req, res) {
  // 1. CẤU HÌNH HEADERS CORS (Thêm phần này vào đầu hàm)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Cho phép TẤT CẢ các website khác gọi tới. Nếu muốn giới hạn, thay '*' bằng 'https://ten-mien-cua-ban.com'
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Xử lý request kiểm tra (Preflight Request) từ trình duyệt
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Chỉ chấp nhận phương thức GET từ client
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed. Use GET.' });
  }

  const { prompt } = req.query;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing "prompt" parameter.' });
  }

  const postData = JSON.stringify({
    messages: [{ role: 'user', content: prompt }],
    system_prompt: '',
    temperature: 0.9,
    top_k: 5,
    top_p: 0.9,
    max_tokens: 256,
    web_access: false
  });

  const options = {
    hostname: 'chatgpt-42.p.rapidapi.com',
    port: 443,
    path: '/conversationgpt4-2',
    method: 'POST',
    headers: {
      'x-rapidapi-key': '3a71ea9552msh5136feed2dfc371p15e354jsnac009ba1a9bb',
      'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const apiRequest = https.request(options, (apiResponse) => {
    let responseData = '';
    apiResponse.on('data', (chunk) => { responseData += chunk; });
    apiResponse.on('end', () => {
      try {
        const jsonResponse = JSON.parse(responseData);
        res.status(apiResponse.statusCode).json(jsonResponse);
      } catch (e) {
        res.status(500).json({ error: 'Invalid JSON response from upstream API', raw: responseData });
      }
    });
  });

  apiRequest.on('error', (error) => {
    res.status(500).json({ error: 'Connection to API failed', message: error.message });
  });

  apiRequest.write(postData);
  apiRequest.end();
}
