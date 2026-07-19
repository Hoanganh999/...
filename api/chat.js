export default async function handler(req, res) {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: "Missing prompt"
    });
  }

  try {
    const response = await fetch(
      "https://deepseek-r1-zero-ai-model-with-emergent-reasoning-ability.p.rapidapi.com/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-host":
            "deepseek-r1-zero-ai-model-with-emergent-reasoning-ability.p.rapidapi.com",
          "x-rapidapi-key": "3a71ea9552msh5136feed2dfc371p15e354jsnac009ba1a9bb"
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2048,
          reasoning_effort: "low"
        })
      }
    );

    const data = await response.json();

    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
