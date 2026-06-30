// pages/api/refresh-raises.js
// Runs server-side on Vercel. Your API key stays secret here, never sent to the browser.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on the server' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: `Search the web for companies that closed funding rounds (Series A through growth-stage, $10M and up) in the last two weeks. Prioritize companies relevant to an executive search firm covering AI infrastructure, enterprise software, fintech, healthcare, and marketplace businesses.

For each company, find: the round and amount, the investors involved, and founder names if available.

Apply a strict freshness filter: only include rounds you can confirm closed or were announced in the last 14 days with a real source. Drop anything ambiguous or older.

Respond with ONLY a JSON array, no markdown formatting, no commentary, no code fences. Each item must have exactly these fields:
[
  {
    "company": "company name",
    "round": "round type and amount, e.g. Series B, $80M at $500M valuation",
    "investors": "investor names, comma separated",
    "founders": "founder names if known, otherwise empty string",
    "link": "source URL"
  }
]

Return 6-10 items if available. If fewer than 4 solid items exist, return however many you can confirm rather than padding with old or speculative rounds.`,
          },
        ],
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 8 }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Anthropic API error: ${errText}` });
    }

    const data = await response.json();

    const textBlocks = data.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    let cleaned = textBlocks.trim();
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '');

    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Could not find JSON array in response', raw: textBlocks });
    }

    const items = JSON.parse(jsonMatch[0]);

    return res.status(200).json({ items });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
