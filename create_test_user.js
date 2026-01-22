import fetch from 'node-fetch';

const ACCESS_TOKEN = 'TEST-871494466911326-081800-a42ce7ea15d8c26c062451b6b1bde2a5-2336152427';

async function createTestUser() {
  try {
    console.log('Criando usuário de teste comprador...');
    const response = await fetch('https://api.mercadopago.com/users/test_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        site_id: 'MLB',
        description: 'Comprador de Teste'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\n✅ USUÁRIO DE TESTE CRIADO COM SUCESSO!');
    console.log('------------------------------------------------');
    console.log('Use estes dados para fazer login no checkout ou pagar:');
    console.log('📧 Email:', data.email);
    console.log('🔑 Senha:', data.password);
    console.log('------------------------------------------------');
    console.log('Tente realizar o pagamento usando este e-mail (copie e cole).');
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
  }
}

createTestUser();
