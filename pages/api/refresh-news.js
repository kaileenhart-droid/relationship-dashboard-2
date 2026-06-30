// pages/api/refresh-news.js
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
            content: `Search the web for tech industry news from the last two weeks: funding rounds, M&A deals, and executive moves only. Prioritize items relevant to an executive search firm covering AI infrastructure, enterprise software, fintech, healthcare, and marketplace companies.

Apply a strict freshness filter: only include items you can confirm are from the last 14 days with a real source. Drop anything ambiguous.

Respond with ONLY a JSON array, no markdown formatting, no commentary, no code fences. Each item must have exactly these fields:
[
  {
    "date": "YYYY-MM-DD",
    "category": "Funding" | "M&A" | "Exec move",
    "headline": "short headline",
    "detail": "one or two sentence summary",
    "link": "source URL"
  }
]

Return 6-10 items if available. If fewer than 4 solid items exist, return however many you can confirm rather than padding with old or speculative news.`,
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
