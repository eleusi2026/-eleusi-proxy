 // api/oracle.js
// Proxy Vercel per l'oracolo Eléusi
// Nasconde la chiave API Anthropic lato server

export default async function handler(req, res) {

  // ── CORS: autorizza solo il tuo dominio ──
  const allowed = [
    'https://www.eleonoraarduino.it',
    'https://eleonoraarduino.it',
    'https://eleusi.org',
    'https://www.eleusi.org',
    'http://localhost:3000', // sviluppo locale
  ];

  const origin = req.headers.origin;
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  try {
    const { model, max_tokens, system, messages } = req.body;

    // Validazione base
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Parametri non validi' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY, // impostata su Vercel dashboard
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-6',
        max_tokens: max_tokens || 1600,
        system,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic error:', data);
      return res.status(response.status).json({ error: 'Errore API', detail: data });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}
