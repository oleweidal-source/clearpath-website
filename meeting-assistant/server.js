const express = require('express');
const path = require('path');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/analyze', async (req, res) => {
  const { prompt, model = 'claude-haiku-4-5-20251001' } = req.body;
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API-nøkkel mangler' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Claude API-feil' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log('\n🎙  Møteassistent er klar!');
  console.log(`➡  Åpne http://localhost:${PORT} i Google Chrome\n`);
  console.log('Tips: Ha dette vinduet åpent ved siden av Google Meet');
  console.log('      Bruk høyttalere (ikke øretelefoner) for best transkripsjon\n');
});
