import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { pedidoId, items, frete, backUrls } = await req.json()

    const itemsPayload = items.map((item: any) => ({
      title: item.name,
      quantity: item.qty,
      unit_price: item.price,
      currency_id: 'BRL'
    }))

    if (frete > 0) {
      itemsPayload.push({
        title: 'Frete SEDEX',
        quantity: 1,
        unit_price: frete,
        currency_id: 'BRL'
      })
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')}`
      },
      body: JSON.stringify({
        items: itemsPayload,
        external_reference: pedidoId,
        back_urls: backUrls,
        auto_return: 'approved'
      })
    })

    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
