export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  // Lidar com preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas aceitar GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const externalReference = req.query?.id;

    if (!externalReference) {
      return res.status(400).json({ 
        error: 'ID do pedido não fornecido' 
      });
    }

    const MERCADO_PAGO_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!MERCADO_PAGO_TOKEN) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
      return res.status(500).json({ 
        error: 'MERCADO_PAGO_ACCESS_TOKEN não configurado' 
      });
    }

    console.log('Verificando status do pagamento para:', externalReference);

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/search?external_reference=${externalReference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MERCADO_PAGO_TOKEN}`,
        },
      }
    );

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const payment = data.results[0];
      return res.status(200).json({
        status: payment.status,
        id: payment.id,
      });
    }

    return res.status(200).json({ status: 'pending' });
  } catch (err) {
    console.error('Erro ao verificar status:', err);
    return res.status(500).json({ 
      error: 'Erro interno', 
      details: String(err?.message || err) 
    });
  }
}

