// Vercel Serverless Function pour login
export default async function handler(req, res) {
  const HEROKU_API_URL = process.env.HEROKU_API_URL || 'https://votre-app-heroku.herokuapp.com';
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(`${HEROKU_API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Error proxying to Heroku:', error);
    res.status(500).json({ 
      error: 'Backend unavailable', 
      message: 'Unable to connect to Heroku backend' 
    });
  }
}
