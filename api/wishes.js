// Vercel Serverless Function
// Use environment variables for API keys

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bwsbxmzreztslmxouzrg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, query = '', body } = req.body || {};

    if (!action) {
      return res.status(400).json({ error: 'Missing action parameter' });
    }

    if (action === 'get') {
      const url = SUPABASE_URL + '/rest/v1/wishes' + (query ? '?' + query : '?order=created_at.desc');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Content-Type': 'application/json'
        }
      });

      const text = await response.text();
      
      if (!response.ok) {
        console.error('Supabase GET error:', response.status, text);
        return res.status(response.status).json({ error: 'Supabase error: ' + response.statusText });
      }

      try {
        const data = JSON.parse(text);
        return res.status(200).json(data);
      } catch (e) {
        return res.status(200).json(text);
      }
    }

    if (action === 'post') {
      if (!body) {
        return res.status(400).json({ error: 'Missing body parameter' });
      }

      const response = await fetch(SUPABASE_URL + '/rest/v1/wishes', {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(body)
      });

      const text = await response.text();

      if (!response.ok) {
        console.error('Supabase POST error:', response.status, text);
        return res.status(response.status).json({ error: 'Save failed: ' + response.statusText });
      }

      return res.status(201).json({ success: true });
    }

    return res.status(400).json({ error: 'Unknown action: ' + action });
  } catch (error) {
    console.error('Handler error:', error.message, error.stack);
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
