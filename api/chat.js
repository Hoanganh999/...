export default async function handler(req, res) {
  // Chỉ cho phép phương thức GET thông qua URL query (?prompt=)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed. Use GET.' });
  }

  // Lấy giá trị prompt từ URL query string
  const { prompt } = req.query;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing "prompt" parameter in URL.' });
  }

  const url = 'https://deepseek-r1-zero-ai-model-with-emergent-reasoning-ability.p.rapidapi.com/chat/completions';
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': 'deepseek-r1-zero-ai-model-with-emergent-reasoning-ability.p.rapidapi.com',
      // Bảo mật: Nên đưa API key này vào Environment Variables trên Vercel thay vì để lộ trong code
      'x-rapidapi-key': '3a71ea9552msh5136feed2dfc371p15e354jsnac009ba1a9bb' 
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: prompt // Truyền câu hỏi của người dùng vào đây
        }
      ],
      temperature: 0.7,
      max_tokens: 2048,
      stream: false,
      reasoning_effort: 'low'
    })
  };

  try {
    const apiResponse = await fetch(url, options);
    const data = await apiResponse.json();
    
    // Trả về kết quả trực tiếp cho client
    return res.status(apiResponse.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
