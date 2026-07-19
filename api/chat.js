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

  // Cấu hình payload chính xác theo định dạng API mới của bạn
  const postData = JSON.stringify({
    messages: [
      {
        role: 'user',
        content: prompt // Nhận câu hỏi động từ tham số ?prompt=
      }
    ],
    system_prompt: '',
    temperature: 0.9,
    top_k: 5,
    top_p: 0.9,
    max_tokens: 256,
    web_access: false
  });

  // Cấu hình Host và Endpoint mới theo đúng cấu trúc XHR của bạn
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

  // Khởi tạo request kết nối trực tiếp đến RapidAPI
  const apiRequest = https.request(options, (apiResponse) => {
    let responseData = '';

    // Nhận dữ liệu đổ về theo từng cụm dữ liệu (chunk)
    apiResponse.on('data', (chunk) => {
      responseData += chunk;
    });

    // Khi đã nhận xong toàn bộ dữ liệu phản hồi
    apiResponse.on('end', () => {
      try {
        const jsonResponse = JSON.parse(responseData);
        // Trả về kết quả JSON trực tiếp cho trình duyệt kèm HTTP Status gốc
        res.status(apiResponse.statusCode).json(jsonResponse);
      } catch (e) {
        // Tránh lỗi sập Serverless (Crash) nếu API trả về chuỗi text lỗi không phải JSON
        res.status(500).json({ 
          error: 'Invalid JSON response from upstream API', 
          raw: responseData 
        });
      }
    });
  });

  // Xử lý kịch bản lỗi kết nối vật lý (ví dụ: RapidAPI bị sập, timeout mạng)
  apiRequest.on('error', (error) => {
    res.status(500).json({ error: 'Connection to API failed', message: error.message });
  });

  // Đẩy dữ liệu lên endpoint và đóng luồng gửi dữ liệu
  apiRequest.write(postData);
  apiRequest.end();
}
