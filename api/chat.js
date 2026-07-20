import https from 'https';

export default function handler(req, res) {
  // 1. CẤU HÌNH HEADERS CORS (Cho phép gọi API từ mọi domain/trình duyệt)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Xử lý request kiểm tra (Preflight Request) tự động từ trình duyệt
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Chấp nhận cấu trúc GET từ người dùng để chạy domain.com/chat?prompt=...
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed. Use GET.' });
  }

  const { prompt } = req.query;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing "prompt" parameter.' });
  }

  // Cấu hình dữ liệu POST khớp hoàn toàn với cấu trúc XHR của bạn
  const postData = JSON.stringify({
    messages: [
      {
        role: 'user',
        content: prompt // Nhận câu hỏi động từ URL
      }
    ],
    temperature: 0.7,
    max_tokens: 2048,
    stream: false,
    reasoning_effort: 'low'
  });

  // Cấu hình thông tin Host và Endpoint của Gemma API mới
  const options = {
    hostname: 'gemma-4-26b-by-google.p.rapidapi.com',
    port: 443,
    path: '/chat/completions',
    method: 'POST',
    headers: {
      'x-rapidapi-key': '3a71ea9552msh5136feed2dfc371p15e354jsnac009ba1a9bb',
      'x-rapidapi-host': 'gemma-4-26b-by-google.p.rapidapi.com',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  // Tạo request gửi đến RapidAPI
  const apiRequest = https.request(options, (apiResponse) => {
    let responseData = '';

    // Gom dữ liệu trả về theo từng chunk
    apiResponse.on('data', (chunk) => {
      responseData += chunk;
    });

    // Khi nhận xong toàn bộ dữ liệu phản hồi (tương đương readyState === DONE)
    apiResponse.on('end', () => {
      // CHỐNG CRASH 1: Kiểm tra xem phản hồi có rỗng hay không
      if (!responseData.trim()) {
        return res.status(apiResponse.statusCode || 500).json({
          error: 'Upstream API returned an empty response.',
          statusCode: apiResponse.statusCode
        });
      }

      try {
        // Thử parse dữ liệu sang JSON nếu API phản hồi đúng chuẩn
        const jsonResponse = JSON.parse(responseData);
        return res.status(200).json(jsonResponse);
      } catch (e) {
        // CHỐNG CRASH 2: Nếu API trả về chữ thuần hoặc HTML báo lỗi (Ví dụ: Lỗi 504 Timeout từ RapidAPI), 
        // trả thẳng chuỗi đó về client dưới dạng object an toàn thay vì làm sập hàm.
        return res.status(200).json({
          success: true,
          type: 'text_or_html_response',
          result: responseData
        });
      }
    });
  });

  // Xử lý kịch bản lỗi đường truyền, lỗi kết nối đến server RapidAPI
  apiRequest.on('error', (error) => {
    return res.status(500).json({ 
      error: 'Connection to RapidAPI failed', 
      message: error.message 
    });
  });

  // Ghi dữ liệu body và kết thúc luồng gửi request POST
  apiRequest.write(postData);
  apiRequest.end();
}
