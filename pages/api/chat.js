// pages/api/chat.js
// Runs server-side on Vercel. Your API key stays secret here, never sent to the browser.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on the server' });
  }

  const { messages, dashboardData } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const contextSummary = buildContextSummary(dashboardData);

  const systemPrompt = `You are a helpful assistant embedded in Kaileen's relationship dashboard, a tool she uses for executive search business development at Daversa Partners.

You can answer general questions, you have access to her current dashboard data below, and you can also search the web for current information (news, funding, company info, people). Use web search when she asks about anything current or that isn't in the dashboard data.

Be direct and concise, matching a sharp executive recruiter's tone: crisp, no fluff, no generic filler. When you cite something from a web search, mention the source briefly.

CURRENT DASHBOARD DATA:
${contextSummary}`;

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
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Anthropic API error: ${errText}` });
    }

    const data = await response.json();
    const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('\n');

    return res.status(200).json({ reply: text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function buildContextSummary(d) {
  if (!d) return 'No dashboard data available.';
  const people = (d.people || []).map(p =>
    `- ${p.name} (${p.type}, ${p.firm || 'no firm listed'}): status ${p.status}, last met ${p.lastMet || 'never logged'}${p.note ? `, note: ${p.note}` : ''}`
  ).join('\n');
  const raises = (d.raises || []).map(r =>
    `- ${r.company}: ${r.round}${r.investors ? `, investors: ${r.investors}` : ''}${r.founders ? `, founders: ${r.founders}` : ''}`
  ).join('\n');
  const news = (d.news || []).map(n => `- [${n.category}] ${n.headline} (${n.date})`).join('\n');

  return `RELATIONSHIPS:\n${people || 'none logged'}\n\nRECENT RAISES:\n${raises || 'none logged'}\n\nNEWS:\n${news || 'none logged'}`;
}
