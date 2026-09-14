const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const ALLOWED_ORIGINS = new Set([
  'https://vignesh-v2000.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]);

export default async function handler(request, response) {
  const origin = request.headers.origin;

  if (ALLOWED_ORIGINS.has(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
  }
  response.setHeader('Vary', 'Origin');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(204).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GROQ_API_KEY) {
    return response.status(500).json({ error: 'Server API key is not configured' });
  }

  const messages = request.body?.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 12) {
    return response.status(400).json({ error: 'Invalid message history' });
  }

  try {
    const groqResponse = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages,
        temperature: 0.6
      })
    });

    const data = await groqResponse.json();
    return response.status(groqResponse.status).json(data);
  } catch (error) {
    console.error('Groq request failed:', error);
    return response.status(502).json({ error: 'The chat service is unavailable' });
  }
}