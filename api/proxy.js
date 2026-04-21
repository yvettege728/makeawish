// Vercel Serverless Function - Make a Wish API Proxy
// This file proxies requests from the frontend to Supabase

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET and POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return res.status(500).json({
        error: 'Server configuration error: Missing Supabase credentials'
      });
    }

    // Build the query string from request parameters
    const queryString = req.url.includes('?')
      ? req.url.split('?')[1]
      : '';

    // Build the full URL to Supabase
    const fullUrl = `${supabaseUrl}/rest/v1/wishes${queryString ? '?' + queryString : ''}`;

    // Set up headers for Supabase
    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    };

    // Forward request to Supabase
    const fetchOptions = {
      method: req.method,
      headers
    };

    // Add body for POST requests
    if (req.method === 'POST' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    // Make the request to Supabase
    const response = await fetch(fullUrl, fetchOptions);
    const data = await response.json();

    // Return response with appropriate status code
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[Proxy Error]', error);
    res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}
