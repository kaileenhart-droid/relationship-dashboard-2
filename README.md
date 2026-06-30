# Relationship dashboard

## Deploy to Vercel

1. Push this folder to a GitHub repo (or upload it the way you did last time).
2. In Vercel, import the repo as a new project. It will auto-detect Next.js, no build settings needed.
3. Before deploying (or right after, then redeploy), add your Anthropic API key:
   - In the Vercel project, go to Settings → Environment Variables.
   - Add a variable named `ANTHROPIC_API_KEY` with your actual key as the value.
   - Apply it to Production (and Preview if you want).
4. Deploy. Visit the live URL.

## How refresh works

Clicking "Refresh" in the News tab calls a serverless function (`/api/refresh-news`) that
runs on Vercel's servers. That function calls the Anthropic API with web search enabled,
asks for the last two weeks of funding/M&A/exec-move news, and returns structured results
to the page. Your API key never reaches the browser — it stays server-side in the
environment variable.

Each search costs a small amount against your Anthropic API usage (web search is billed
per search call, plus normal token costs). This is pay-per-use, not a subscription.

## Data storage

Relationships and raises still save to your browser's local storage, same as before —
they're not tied to the API key and don't require a refresh to persist. Only the News tab
data comes from a live search when you click refresh.
