import https from 'https';

export default function handler(req, res) {
  // Chỉ chấp nhận phương thức GET từ client (truy cập bằng URL ?prompt=)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed. Use GET.' });
  }

  const { prompt } = req.query;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing "prompt" parameter.' });
  }

  // Cấu hình payload y hệt dữ liệu bạn truyền vào xhr.send(data)
  const postData = JSON.stringify({
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2048,
    stream: false,
    reasoning_effort: 'low'
  });

  // Cấu hình endpoint và các Request Header
  const options = {
    hostname: 'deepseek-r1-zero-ai-model-with-emergent-reasoning-ability.p.rapidapi.com',
    port: 443,
    path: '/chat/completions',
    method: 'POST',
    headers: {
      'x-rapidapi-key': '3a71ea9552msh5136feed2dfc371p15e354jsnac009ba1a9bb',
      'x-rapidapi-host': 'deepseek-r1-zero-ai-model-with-emergent-reasoning-ability.p.rapidapi.com',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  // Khởi tạo request tương đương xhr.open() và các addEventListener
  const apiRequest = https.request(options, (apiResponse) => {
    let responseData = '';

    // Nhận dữ liệu theo từng block (tương tự như readystatechange)
    apiResponse.on('data', (chunk) => {
      responseData += chunk;
    });

    // Khi đã nhận toàn bộ dữ liệu (tương tự readyState === DONE)
    apiResponse.on('end', () => {
      try {
        const jsonResponse = JSON.parse(responseData);
        res.status(apiResponse.statusCode).json(jsonResponse);
      } catch (e) {
        // Tránh crash nếu dữ liệu trả về không phải JSON hợp lệ
        res.status(500).json({ error: 'Invalid JSON response from API', raw: responseData });
      }
    });
  });

  // Xử lý lỗi kết nối đường truyền mạng
  apiRequest.on('error', (error) => {
    res.status(500).json({ error: 'Connection failed', message: error.message });
  });

  // Gửi dữ liệu đi tương đương xhr.send(data)
  apiRequest.write(postData);
  apiRequest.end();
}
