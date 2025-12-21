exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const externalReference = event.queryStringParameters?.id;

    if (!externalReference) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'ID do pedido não fornecido' }),
      };
    }

    const MERCADO_PAGO_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!MERCADO_PAGO_TOKEN) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'MERCADO_PAGO_ACCESS_TOKEN não configurado' }),
      };
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
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: payment.status,
          id: payment.id,
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: 'pending' }),
    };
  } catch (err) {
    console.error('Erro ao verificar status:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno', details: String(err?.message || err) }),
    };
  }
};
