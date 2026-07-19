export default async function handler(req, res) {
  // Chỉ chấp nhận GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.query;
  if (!prompt) {
    return res.status(400).json({ error: 'Parameter "prompt" is required' });
  }

  const url = 'https://deepseek-r1-zero-ai-model-with-emergent-reasoning-ability.p.rapidapi.com/chat/completions';
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': 'deepseek-r1-zero-ai-model-with-emergent-reasoning-ability.p.rapidapi.com',
      'x-rapidapi-key': '3a71ea9552msh5136feed2dfc371p15e354jsnac009ba1a9bb' 
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1024, // Giảm bớt số token để phản hồi nhanh hơn, tránh timeout 10s của Vercel
      stream: false,
      reasoning_effort: 'low'
    })
  };

  try {
    const apiResponse = await fetch(url, options);
    
    // Kiểm tra nếu API từ RapidAPI trả về lỗi HTTP (ví dụ 401, 429, 500)
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return res.status(apiResponse.status).json({ 
        error: `RapidAPI returned status ${apiResponse.status}`, 
        details: errorText 
      });
    }

    const data = await apiResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    // Trả về JSON lỗi tường minh thay vì để hàm tự sập (crashed)
    return res.status(500).json({ 
      error: 'Serverless Function Execution Error', 
      message: error.message 
    });
  }
}
