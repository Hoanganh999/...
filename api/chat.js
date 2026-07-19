import https from 'https';

export default function handler(req, res) {
  // 1. CẤU HÌNH HEADERS CORS (Cho phép mọi website gọi tới API này)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Xử lý request kiểm tra (Preflight Request) tự động từ trình duyệt
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Chỉ chấp nhận phương thức GET từ client (khi dùng domain.com/chat?prompt=...)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed. Use GET.' });
  }

  const { prompt } = req.query;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing "prompt" parameter.' });
  }

  // Mã hóa ký tự đặc biệt (khoảng trắng, dấu chấm hỏi...) trong câu hỏi của người dùng để tránh lỗi URL
  const encodedQuestion = encodeURIComponent(prompt);

  // Cấu hình Host và Endpoint mới theo đúng cấu trúc XHR của bạn
  const options = {
    hostname: 'chat-gpt-43.p.rapidapi.com',
    port: 443,
    path: `/problem.json?question=${encodedQuestion}`, // Nối chuỗi câu hỏi vào URL query
    method: 'GET',
    headers: {
      'x-rapidapi-key': '3a71ea9552msh5136feed2dfc371p15e354jsnac009ba1a9bb',
      'x-rapidapi-host': 'chat-gpt-43.p.rapidapi.com',
      'Content-Type': 'application/json'
    }
  };

  // Khởi tạo request kết nối trực tiếp đến RapidAPI bằng phương thức GET
  const apiRequest = https.request(options, (apiResponse) => {
    let responseData = '';

    // Nhận dữ liệu đổ về theo từng cụm dữ liệu (chunk)
    apiResponse.on('data', (chunk) => {
      responseData += chunk;
    });

    // Khi đã nhận xong toàn bộ dữ liệu phản hồi (readyState === DONE)
    apiResponse.on('end', () => {
      try {
        const jsonResponse = JSON.parse(responseData);
        // Trả dữ liệu JSON về trực tiếp cho trình duyệt của bạn kèm mã HTTP status gốc
        res.status(apiResponse.statusCode).json(jsonResponse);
      } catch (e) {
        // Phòng trường hợp API lỗi trả về chuỗi HTML hoặc Text thông thường thay vì JSON để tránh sập (crash) server
        res.status(500).json({ 
          error: 'Invalid JSON response from upstream API', 
          raw: responseData 
        });
      }
    });
  });

  // Xử lý kịch bản lỗi kết nối vật lý (ví dụ: mất mạng, RapidAPI sập, sai key)
  apiRequest.on('error', (error) => {
    res.status(500).json({ error: 'Connection to API failed', message: error.message });
  });

  // Kết thúc luồng gửi request (vì là GET nên không cần ghi dữ liệu vào body)
  apiRequest.end();
}
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
