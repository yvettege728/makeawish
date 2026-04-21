// Vercel Serverless Function - Fixed version
// API keys passed as environment variables from Vercel Dashboard

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get from request body
    const { action, query = '', body, supabaseUrl, supabaseKey } = req.body || {};

    if (!action || !supabaseUrl || !supabaseKey) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (action === 'get') {
      const url = supabaseUrl + '/rest/v1/wishes' + (query ? '?' + query : '?order=created_at.desc');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': 'Bearer ' + supabaseKey,
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

      const response = await fetch(supabaseUrl + '/rest/v1/wishes', {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': 'Bearer ' + supabaseKey,
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
    console.error('Handler error:', error.message);
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
