import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const MERCADO_PAGO_TOKEN = 'APP_USR-871494466911326-081800-12d82f678168df47aab6f86eec4e4759-2336152427';

app.post('/api/create-preference', async (req, res) => {
  try {
    console.log('Recebendo requisição:', req.body);

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADO_PAGO_TOKEN}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    console.log('Resposta do Mercado Pago:', data);

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/mercadopago-preference', async (req, res) => {
  try {
    console.log('Recebendo requisição de preferência:', req.body);

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADO_PAGO_TOKEN}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    console.log('Resposta do Mercado Pago:', data);

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/mercadopago-status', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'ID do pedido não fornecido' });
    }

    console.log('Verificando status do pagamento para external_reference:', id);

    const response = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_TOKEN}`
      }
    });

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const payment = data.results[0];
      res.json({
        status: payment.status,
        id: payment.id
      });
    } else {
      res.json({ status: 'pending' });
    }
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/payment-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Verificando status do pagamento para external_reference:', id);

    const response = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_TOKEN}`
      }
    });

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const payment = data.results[0]; // Pega o pagamento mais recente
      res.json({
        status: payment.status,
        id: payment.id
      });
    } else {
      res.json({ status: 'pending' });
    }
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor proxy rodando em http://localhost:${PORT}`);
});
