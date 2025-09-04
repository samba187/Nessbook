// Vercel Serverless Function pour rediriger vers votre backend Heroku
export default async function handler(req, res) {
  // Configurez ici l'URL de votre backend Heroku
  const HEROKU_API_URL = process.env.HEROKU_API_URL || 'https://votre-app-heroku.herokuapp.com';
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Rediriger la requête vers Heroku
    const response = await fetch(`${HEROKU_API_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    
    // Retourner la réponse de Heroku
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Error proxying to Heroku:', error);
    res.status(500).json({ 
      error: 'Backend unavailable', 
      message: 'Unable to connect to Heroku backend' 
    });
  }
}
