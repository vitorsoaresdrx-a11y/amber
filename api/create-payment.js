const CLIENT_ID = 'bab59bda-5a11-40d7-a3a0-8d62aeadbd7c';
const CLIENT_SECRET = 'repaOnu2ffG5xAOkQNb3CP0ryz63c84siE/GR/4bmkvGUVj1tMOLPpYwqnKJtMWZaH45Ye1EydJ5MtlKJ4qgfKFA1q5BRzzmD/FHpsQ0lXxEh6PyvUPnpCoY9UAxXixVVDJZIdJFfWiig1lyjkpeya51D0X2u/7cSxAQobERl7w';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount } = req.body;

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
      })
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return res.status(500).json({ error: 'Falha na autenticação', details: err });
    }

    const { access_token } = await tokenRes.json();

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

    if (!paymentRes.ok) {
      const err = await paymentRes.text();
      return res.status(500).json({ error: 'Erro ao criar pagamento', details: err });
    }

    const paymentData = await paymentRes.json();
    return res.status(200).json(paymentData);

  } catch (error) {
    return res.status(500).json({ error: 'Erro interno', details: error.message });
  }
};
