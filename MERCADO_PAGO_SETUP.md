# Configuração do Mercado Pago

## ✅ Implementação Concluída

O sistema agora redireciona automaticamente para o link de pagamento do Mercado Pago quando você clicar em "Realizar Pagamento".

## Como Funciona

1. **Cliente preenche os dados** no checkout (nome, WhatsApp, endereço)
2. **Cliente clica em "Realizar Pagamento"**
3. **Sistema salva o pedido** no Supabase com status "aguardando_pagamento"
4. **Sistema cria preferência de pagamento** via Edge Function do Supabase
5. **Cliente é redirecionado** automaticamente para a página de pagamento do Mercado Pago
6. **Após o pagamento**, o cliente é redirecionado de volta para:
   - `/payment/success` - Pagamento aprovado
   - `/payment/failure` - Pagamento recusado
   - `/payment/pending` - Pagamento pendente

## Token Configurado

Seu token de teste do Mercado Pago já está configurado:
```
TEST-871494466911326-081800-a42ce7ea15d8c26c062451b6b1bde2a5-2336152427
```

## Deploy da Edge Function

Para que o sistema funcione em produção, você precisa fazer o deploy da Edge Function:

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Fazer login
supabase login

# 3. Link com seu projeto
supabase link --project-ref seu-project-ref

# 4. Configurar o token como secret
supabase secrets set MERCADO_PAGO_ACCESS_TOKEN=TEST-871494466911326-081800-a42ce7ea15d8c26c062451b6b1bde2a5-2336152427

# 5. Deploy da função
supabase functions deploy create-payment
```

## Teste Local

Para testar localmente antes do deploy:

```bash
supabase functions serve create-payment
```

## Dados de Teste do Mercado Pago

Para testar pagamentos em modo sandbox:

- **Cartão**: 5031 4332 1540 6351
- **CVV**: 123
- **Vencimento**: 11/25
- **Titular**: APRO (para aprovar) ou OTHE (para recusar)

## Arquivos Modificados

- `pages/Checkout.tsx` - Implementado redirecionamento para Mercado Pago
- `supabase/functions/create-payment/index.ts` - Edge Function para criar preferências de pagamento
