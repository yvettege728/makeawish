const SUPABASE_URL = 'https://bwsbxmzreztslmxouzrg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3c2J4bXpyZXp0c2xteG91enJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI1OTkwMDAsImV4cCI6MTk5OTk5OTk5OX0.QaysKwZq6J_fmdtZWVIJZQ_QDkFv6pb';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action, query, body } = req.body || {};

    if (action === 'get') {
      const response = await fetch(
        SUPABASE_URL + '/rest/v1/wishes' + (query ? '?' + query : '?order=created_at.desc'),
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) throw new Error('Supabase error');
      return res.status(200).json(await response.json());
    }

    if (action === 'post') {
      const response = await fetch(SUPABASE_URL + '/rest/v1/wishes', {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error('Save failed');
      return res.status(201).json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
