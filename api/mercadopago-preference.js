export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  // Lidar com preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas aceitar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};

    const MERCADO_PAGO_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!MERCADO_PAGO_TOKEN) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
      return res.status(500).json({ 
        error: 'MERCADO_PAGO_ACCESS_TOKEN não configurado' 
      });
    }

    console.log('Criando preferência:', JSON.stringify(body, null, 2));

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADO_PAGO_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('Resposta do Mercado Pago:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Erro ao criar preferência:', err);
    return res.status(500).json({ 
      error: 'Erro interno', 
      details: String(err?.message || err) 
    });
  }
}

