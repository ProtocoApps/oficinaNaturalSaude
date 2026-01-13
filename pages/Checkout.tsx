import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { CartItem } from '../App';
import { calcularFreteCarrinho, opcoesFrete, formatarPeso } from '../utils/freteCalculator';

const WHATSAPP_ADMIN = '5547992853033';

type CheckoutProps = {
  items: CartItem[];
};

type ShippingOption = {
  coProduto: string;
  valor: number | null;
  prazoDias: number | null;
};

const Checkout: React.FC<CheckoutProps> = ({ items }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  
  // Dados do cliente
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');

  // Dados de endereço
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState(() => {
    // Recuperar CEP salvo do carrinho
    const savedCep = localStorage.getItem('checkout_cep');
    return savedCep || '';
  });
  const [tipoEntrega, setTipoEntrega] = useState(() => {
    // Recuperar tipo de frete salvo do carrinho
    const savedFrete = localStorage.getItem('checkout_frete_tipo');
    return savedFrete || 'sedex';
  });
  const [loadingCep, setLoadingCep] = useState(false);

  const [shippingQuotes, setShippingQuotes] = useState<{ pac?: ShippingOption; sedex?: ShippingOption } | null>(null);
  const [loadingFrete, setLoadingFrete] = useState(false);
  const [freteError, setFreteError] = useState('');

  // Cálculos
  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const selectedQuote =
    tipoEntrega === 'pac'
      ? shippingQuotes?.pac
      : tipoEntrega === 'sedex'
        ? shippingQuotes?.sedex
        : null;

  const frete =
    tipoEntrega === 'retirada'
      ? 0
      : typeof selectedQuote?.valor === 'number'
        ? selectedQuote.valor
        : 15;
  const total = subtotal + frete;

  // Buscar CEP
  const buscarCep = async () => {
    if (cep.replace(/\D/g, '').length !== 8) return;
    
    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setEndereco(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.localidade || '');
        setEstado(data.uf || '');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setLoadingCep(false);
    }
  };

  useEffect(() => {
    if (cep.replace(/\D/g, '').length === 8) {
      buscarCep();
    }
  }, [cep]);

  const parseWeightToGrams = (val?: string | null) => {
    if (!val) return null;
    const s = String(val).trim().toLowerCase().replace(',', '.');
    const n = parseFloat(s.replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(n) || n <= 0) return null;
    if (s.includes('kg')) return Math.round(n * 1000);
    if (s.includes('ml')) return Math.round(n); // 1ml ≈ 1g
    if (s.includes('l') && !s.includes('ml')) return Math.round(n * 1000); // 1L ≈ 1000g
    if (s.includes('g')) return Math.round(n);
    return Math.round(n);
  };

  // Função para calcular frete baseado nos itens
  const calcularFreteDosItens = async () => {
    if (items.length === 0 || tipoEntrega === 'retirada') {
      setShippingQuotes(null);
      return;
    }

    console.log('CALCULANDO FRETE - Items:', items.length);
    
    // Calcular peso total
    let pesoTotalGramas = 0;
    
    for (const item of items) {
      // Extrair peso do nome do produto (ex: "Chá - 100g", "Shoyu - 500ml")
      // Suporta: g, kg, ml, l (litros)
      const match = item.name.match(/(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l)\b/i);
      let pesoItem = 100; // padrão
      
      if (match) {
        const valor = parseFloat(match[1].replace(',', '.'));
        const unidade = match[2].toLowerCase();
        if (unidade === 'kg') {
          pesoItem = valor * 1000;
        } else if (unidade === 'l') {
          pesoItem = valor * 1000; // 1 litro ≈ 1000g
        } else if (unidade === 'ml') {
          pesoItem = valor; // 1ml ≈ 1g
        } else {
          pesoItem = valor; // gramas
        }
      }
      
      console.log(`Item: ${item.name}, Peso: ${pesoItem}g, Qtd: ${item.qty}`);
      pesoTotalGramas += (pesoItem * item.qty);
    }
    
    console.log('PESO TOTAL:', pesoTotalGramas, 'gramas');
    
    // Calcular frete
    const opcoes = opcoesFrete(pesoTotalGramas);
    
    setShippingQuotes({
      pac: {
        coProduto: 'pac',
        valor: opcoes.pac.preco,
        prazoDias: opcoes.pac.prazo,
      },
      sedex: {
        coProduto: 'sedex',
        valor: opcoes.sedex.preco,
        prazoDias: opcoes.sedex.prazo,
      },
    });
    
    console.log('FRETE CALCULADO:', opcoes);
  };

  useEffect(() => {
    calcularFreteDosItens();
  }, [items, tipoEntrega]);

  // Listener para eventos de atualização do carrinho
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log('Evento de atualização do carrinho recebido!');
      calcularFreteDosItens();
    };

    const checkoutElement = document.querySelector('[data-checkout-refresh]');
    if (checkoutElement) {
      checkoutElement.addEventListener('cartUpdated', handleCartUpdate);
    }

    return () => {
      if (checkoutElement) {
        checkoutElement.removeEventListener('cartUpdated', handleCartUpdate);
      }
    };
  }, []);

  // Validação
  const canContinue = customerName.trim() !== '' && 
                      customerWhatsapp.trim() !== '' &&
                      (tipoEntrega === 'retirada' || 
                       (cep.trim() !== '' && endereco.trim() !== '' && numero.trim() !== '' && 
                        bairro.trim() !== '' && cidade.trim() !== '' && estado.trim() !== ''));


  // Estados para Mercado Pago
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [paymentCheckInterval, setPaymentCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Limpar intervalo ao desmontar
  useEffect(() => {
    return () => {
      if (paymentCheckInterval) clearInterval(paymentCheckInterval);
    };
  }, [paymentCheckInterval]);

  // Criar preferência de pagamento no Mercado Pago
  const createPreference = async (pedidoId: string) => {
    try {
      console.log('Iniciando criação de preferência para pedido:', pedidoId);
      
      const itemsPayload = items.map(item => ({
        title: item.name,
        quantity: item.qty,
        unit_price: item.price,
        currency_id: 'BRL'
      }));

      // Adicionar frete como item se houver
      if (frete > 0) {
        itemsPayload.push({
          title: tipoEntrega === 'pac' ? 'Frete PAC' : 'Frete SEDEX',
          quantity: 1,
          unit_price: frete,
          currency_id: 'BRL'
        });
      }

      const preferenceData = {
        items: itemsPayload,
        external_reference: String(pedidoId),
        back_urls: {
          success: `${window.location.origin}/payment/success`,
          failure: `${window.location.origin}/payment/failure`,
          pending: `${window.location.origin}/payment/pending`
        }
      };

      console.log('Dados da preferência:', preferenceData);

      // Usar Vercel Function para criar preferência
      const response = await fetch('/api/mercadopago-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferenceData)
      });

      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro da API Mercado Pago (texto):', errorText);
        try {
          const errorData = JSON.parse(errorText);
          console.error('Erro da API Mercado Pago (JSON):', errorData);
          throw new Error(`Erro ${response.status}: ${errorData.message || errorText}`);
        } catch {
          throw new Error(`Erro ${response.status}: ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('Resposta da API Mercado Pago:', data);
      
      // Iniciar monitoramento do pagamento
      startPaymentMonitoring(pedidoId);
      
      // Abrir checkout em nova aba
      if (data.init_point) {
        window.open(data.init_point, '_blank');
      } else if (data.sandbox_init_point) {
        window.open(data.sandbox_init_point, '_blank');
      } else {
        console.error('Resposta sem link de pagamento:', data);
        throw new Error('Link de pagamento não encontrado na resposta');
      }
      
      return data.id;
    } catch (error: any) {
      console.error('Erro ao criar preferência:', error);
      throw error;
    }
  };

  const [waitingPayment, setWaitingPayment] = useState(false);

  // Monitorar status do pagamento
  const startPaymentMonitoring = (pedidoId: string) => {
    setWaitingPayment(true);
    setLoading(false); // Parar loading inicial
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/mercadopago-status?id=${pedidoId}`);
        const data = await response.json();
        
        console.log('Status do pagamento:', data.status);
        
        if (data.status === 'approved') {
          clearInterval(interval);
          navigate(`/payment/success?external_reference=${pedidoId}&payment_id=${data.id}`);
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 5000); // Verificar a cada 5 segundos

    setPaymentCheckInterval(interval);
  };

  // Finalizar pedido e criar preferência do Mercado Pago
  const handleFinalizarPedido = async () => {
    if (!canContinue) {
      setShowErrors(true);
      return;
    }

    setLoading(true);
    
    try {
      // Salvar pedido no Supabase
      const pedido = {
        cliente_nome: customerName,
        cliente_telefone: customerWhatsapp,
        endereco: tipoEntrega === 'retirada' ? 'Retirada no local' : endereco,
        numero: tipoEntrega === 'retirada' ? '' : numero,
        complemento: tipoEntrega === 'retirada' ? '' : complemento,
        bairro: tipoEntrega === 'retirada' ? '' : bairro,
        cidade: tipoEntrega === 'retirada' ? 'Joinville' : cidade,
        estado: tipoEntrega === 'retirada' ? 'SC' : estado,
        cep: tipoEntrega === 'retirada' ? '89207-407' : cep,
        tipo_entrega: tipoEntrega,
        frete,
        subtotal,
        total,
        status: 'pendente',
        itens: items.map(item => ({
          id: item.id,
          nome: item.name,
          preco: item.price,
          quantidade: item.qty,
        })),
      };

      const { data, error } = await supabase
        .from('pedidos')
        .insert(pedido)
        .select()
        .single();

      if (error) throw error;

      // Criar preferência e redirecionar para o Mercado Pago
      await createPreference(data.id);
      
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      const errorMessage = error?.message || 'Erro desconhecido';
      alert(`Erro ao processar pedido: ${errorMessage}`);
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light min-h-screen pb-20" data-checkout-refresh>
      <div className="container mx-auto px-4 lg:px-8 py-10 max-w-[1200px]">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">Finalizar Pedido</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-12">
          {/* Formulário */}
          <div className="space-y-8">
            {/* Dados do Cliente */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Seus Dados</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      showErrors && !customerName.trim() ? 'border-red-500' : 'border-gray-300'
                    } focus:border-neon focus:ring-2 focus:ring-neon/20 transition-colors`}
                    placeholder="Digite seu nome completo"
                  />
                  {showErrors && !customerName.trim() && (
                    <p className="text-red-500 text-sm mt-1">Campo obrigatório</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp *</label>
                  <input
                    type="tel"
                    value={customerWhatsapp}
                    onChange={(e) => setCustomerWhatsapp(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      showErrors && !customerWhatsapp.trim() ? 'border-red-500' : 'border-gray-300'
                    } focus:border-neon focus:ring-2 focus:ring-neon/20 transition-colors`}
                    placeholder="(00) 00000-0000"
                  />
                  {showErrors && !customerWhatsapp.trim() && (
                    <p className="text-red-500 text-sm mt-1">Campo obrigatório</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tipo de Entrega */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Tipo de Entrega</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setTipoEntrega('pac')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    tipoEntrega === 'pac'
                      ? 'border-neon bg-neon/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <span className="material-symbols-outlined text-4xl mb-2 text-neon">local_shipping</span>
                    <h3 className="font-bold text-lg">PAC</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {shippingQuotes?.pac?.prazoDias ? `Entrega em até ${shippingQuotes.pac.prazoDias} dias úteis` : 'Entrega econômica'}
                    </p>
                    <p className="text-neon font-bold mt-2">
                      {loadingFrete ? 'Calculando...' : typeof shippingQuotes?.pac?.valor === 'number' ? `R$ ${shippingQuotes.pac.valor.toFixed(2).replace('.', ',')}` : 'R$ 15,00'}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoEntrega('sedex')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    tipoEntrega === 'sedex'
                      ? 'border-neon bg-neon/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <span className="material-symbols-outlined text-4xl mb-2 text-neon">local_shipping</span>
                    <h3 className="font-bold text-lg">SEDEX</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {shippingQuotes?.sedex?.prazoDias ? `Entrega em até ${shippingQuotes.sedex.prazoDias} dias úteis` : 'Entrega expressa'}
                    </p>
                    <p className="text-neon font-bold mt-2">
                      {loadingFrete ? 'Calculando...' : typeof shippingQuotes?.sedex?.valor === 'number' ? `R$ ${shippingQuotes.sedex.valor.toFixed(2).replace('.', ',')}` : 'R$ 15,00'}
                    </p>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setTipoEntrega('retirada')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    tipoEntrega === 'retirada'
                      ? 'border-neon bg-neon/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <span className="material-symbols-outlined text-4xl mb-2 text-neon">store</span>
                    <h3 className="font-bold text-lg">Retirada</h3>
                    <p className="text-sm text-gray-600 mt-1">Retirar no local</p>
                    <p className="text-neon font-bold mt-2">Grátis</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Botão Atualizar Frete */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Atualizar Cálculo de Frete</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Clique para recalcular o frete com base nos produtos atuais
                  </p>
                </div>
                <button
                  type="button"
                  onClick={calcularFreteDosItens}
                  className="px-6 py-3 bg-neon text-white rounded-lg hover:bg-neon/90 transition-colors font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">refresh</span>
                  Atualizar Frete
                </button>
              </div>
            </div>

            {/* Endereço de Entrega */}
            {(tipoEntrega === 'sedex' || tipoEntrega === 'pac') && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Endereço de Entrega</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">CEP *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          showErrors && !cep.trim() ? 'border-red-500' : 'border-gray-300'
                        } focus:border-neon focus:ring-2 focus:ring-neon/20 transition-colors`}
                        placeholder="00000-000"
                        maxLength={9}
                      />
                      {loadingCep && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin h-6 w-6 border-2 border-neon border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>
                    {showErrors && !cep.trim() && (
                      <p className="text-red-500 text-sm mt-1">Campo obrigatório</p>
                    )}
                    {!!freteError && (
                      <p className="text-red-500 text-sm mt-1">{freteError}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr,120px] gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Endereço *</label>
                      <input
                        type="text"
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          showErrors && !endereco.trim() ? 'border-red-500' : 'border-gray-300'
                        } focus:border-neon focus:ring-2 focus:ring-neon/20 transition-colors`}
                        placeholder="Rua, Avenida..."
                      />
                      {showErrors && !endereco.trim() && (
                        <p className="text-red-500 text-sm mt-1">Campo obrigatório</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Número *</label>
                      <input
                        type="text"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          showErrors && !numero.trim() ? 'border-red-500' : 'border-gray-300'
                        } focus:border-neon focus:ring-2 focus:ring-neon/20 transition-colors`}
                        placeholder="123"
                      />
                      {showErrors && !numero.trim() && (
                        <p className="text-red-500 text-sm mt-1">Obrigatório</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Complemento</label>
                    <input
                      type="text"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-neon focus:ring-2 focus:ring-neon/20 transition-colors"
                      placeholder="Apto, Bloco... (opcional)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Bairro *</label>
                      <input
                        type="text"
                        value={bairro}
                        onChange={(e) => setBairro(e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          showErrors && !bairro.trim() ? 'border-red-500' : 'border-gray-300'
                        } focus:border-neon focus:ring-2 focus:ring-neon/20 transition-colors`}
                        placeholder="Bairro"
                      />
                      {showErrors && !bairro.trim() && (
                        <p className="text-red-500 text-sm mt-1">Obrigatório</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade *</label>
                      <input
                        type="text"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          showErrors && !cidade.trim() ? 'border-red-500' : 'border-gray-300'
                        } focus:border-neon focus:ring-2 focus:ring-neon/20 transition-colors`}
                        placeholder="Cidade"
                      />
                      {showErrors && !cidade.trim() && (
                        <p className="text-red-500 text-sm mt-1">Obrigatório</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Estado *</label>
                      <input
                        type="text"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          showErrors && !estado.trim() ? 'border-red-500' : 'border-gray-300'
                        } focus:border-neon focus:ring-2 focus:ring-neon/20 transition-colors`}
                        placeholder="UF"
                        maxLength={2}
                      />
                      {showErrors && !estado.trim() && (
                        <p className="text-red-500 text-sm mt-1">Obrigatório</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resumo do Pedido */}
          <aside className="h-fit sticky top-24">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Resumo do Pedido</h3>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Qtd: {item.qty}</p>
                    </div>
                    <p className="font-bold text-gray-900">
                      R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                {/* Peso Total */}
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Peso Total</span>
                  <span>{formatarPeso(
                    items.reduce((total, item) => {
                      // Tenta extrair do nome primeiro (para variações)
                      // Suporta: g, kg, ml, l (litros)
                      const match = item.name.match(/(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l)\b/i);
                      if (match) {
                        const valor = parseFloat(match[1].replace(',', '.'));
                        const unidade = match[2].toLowerCase();
                        let pesoItem = valor;
                        if (unidade === 'kg') pesoItem = valor * 1000;
                        else if (unidade === 'l') pesoItem = valor * 1000; // 1L ≈ 1000g
                        else if (unidade === 'ml') pesoItem = valor; // 1ml ≈ 1g
                        // else gramas, já está correto
                        return total + (pesoItem * item.qty);
                      }
                      // Se não encontrar, usa 100g padrão
                      return total + (100 * item.qty);
                    }, 0)
                  )}</span>
                </div>
                
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Frete</span>
                  <span>{frete === 0 ? 'Grátis' : `R$ ${frete.toFixed(2).replace('.', ',')}`}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-neon">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <button
                onClick={handleFinalizarPedido}
                disabled={loading || waitingPayment}
                className={`w-full mt-8 font-bold py-4 rounded-xl transition-all transform shadow-lg ${
                  waitingPayment 
                    ? 'bg-green-100 text-green-700 border-2 border-green-500 cursor-default'
                    : 'bg-neon hover:bg-neon/90 text-white hover:scale-105 shadow-neon/20'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                    Redirecionando...
                  </span>
                ) : waitingPayment ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-green-700 border-t-transparent rounded-full"></div>
                    Aguardando Pagamento...
                  </span>
                ) : (
                  'Realizar Pagamento'
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                <span className="material-symbols-outlined text-lg">lock</span>
                <span>Pagamento 100% seguro via Mercado Pago</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;