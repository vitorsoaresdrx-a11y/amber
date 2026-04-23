module.exports = async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const CLIENT_ID = process.env.LIVEPIX_CLIENT_ID || 'bab59bda-5a11-40d7-a3a0-8d62aeadbd7c';
  const CLIENT_SECRET = process.env.LIVEPIX_CLIENT_SECRET || 'repaOnu2ffG5xAOkQNb3CP0ryz63c84siE/GR/4bmkvGUVj1tMOLPpYwqnKJtMWZaH45Ye1EydJ5MtlKJ4qgfKFA1q5BRzzmD/FHpsQ0lXxEh6PyvUPnpCoY9UAxXixVVDJZIdJFfWiig1lyjkpeya51D0X2u/7cSxAQobERl7w';

  try {
    const { amount } = req.body || {};

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    // 1. Get OAuth Token
    const tokenRes = await fetch('https://oauth.livepix.gg/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: 'payments:write'
      }).toString()
    });

    const tokenText = await tokenRes.text();
    console.log('Token response status:', tokenRes.status);
    console.log('Token response body:', tokenText);

    if (!tokenRes.ok) {
      return res.status(500).json({ error: 'Falha na autenticação', status: tokenRes.status, details: tokenText });
    }

    const tokenData = JSON.parse(tokenText);
    const access_token = tokenData.access_token;

    // 2. Create Payment
    const paymentRes = await fetch('https://api.livepix.gg/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'BRL'
      })
    });

    const paymentText = await paymentRes.text();
    console.log('Payment response status:', paymentRes.status);
    console.log('Payment response body:', paymentText);

    if (!paymentRes.ok) {
      return res.status(500).json({ error: 'Erro ao criar pagamento', status: paymentRes.status, details: paymentText });
    }

    const paymentData = JSON.parse(paymentText);
    return res.status(200).json(paymentData);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Erro interno', details: error.message });
  }
};
