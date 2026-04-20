export default async function handler(req, res) {
  const { method, body } = req;
  const supabaseUrl = 'https://bwsbxmzreztslmxouzrg.supabase.co';
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  try {
    const url = new URL(req.url, 'http://localhost');
    const query = url.searchParams.toString();
    const fullUrl = `${supabaseUrl}/rest/v1/wishes${query ? '?' + query : ''}`;
    
    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    };
    
    const response = await fetch(fullUrl, {
      method: method || 'GET',
      headers,
      body: method === 'POST' ? JSON.stringify(body) : undefined
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}
