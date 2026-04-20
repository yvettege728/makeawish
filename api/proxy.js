export default async function handler(req, res) {
  const { method, body, query } = req;
  const supabaseUrl = 'https://bwsbxmzreztslmxouzrg.supabase.co';
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseKey) {
    return res.status(500).json({ error: 'Missing SUPABASE_ANON_KEY environment variable' });
  }

  try {
    const queryString = Object.keys(query || {})
      .map(key => `${key}=${encodeURIComponent(query[key])}`)
      .join('&');
    
    const fullUrl = `${supabaseUrl}/rest/v1/wishes${queryString ? '?' + queryString : ''}`;

    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    };

    const fetchOptions = {
      method: method || 'GET',
      headers,
    };

    if (method === 'POST' && body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(fullUrl, fetchOptions);
    const data = await response.json();

    res.status(response.status).json(data);
  } catch (error) {
    console.error('[Proxy Error]', error);
    res.status(500).json({ error: error.message });
  }
}
