# Supabase Edge Functions

## Deploy da função create-payment

Para fazer o deploy da Edge Function que cria as preferências de pagamento no Mercado Pago:

1. Instale o Supabase CLI:
```bash
npm install -g supabase
```

2. Faça login no Supabase:
```bash
supabase login
```

3. Link com seu projeto:
```bash
supabase link --project-ref seu-project-ref
```

4. Configure o token do Mercado Pago como secret:
```bash
supabase secrets set MERCADO_PAGO_ACCESS_TOKEN=TEST-871494466911326-081800-a42ce7ea15d8c26c062451b6b1bde2a5-2336152427
```

5. Faça o deploy da função:
```bash
supabase functions deploy create-payment
```

## Testando localmente

Para testar a função localmente:

```bash
supabase functions serve create-payment --env-file .env.local
```
