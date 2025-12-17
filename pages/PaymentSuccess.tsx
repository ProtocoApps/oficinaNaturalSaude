import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [pedido, setPedido] = useState<any>(null);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const paymentId = searchParams.get('payment_id');
      const externalReference = searchParams.get('external_reference');
      
      if (!externalReference) {
        navigate('/');
        return;
      }

      try {
        // Atualizar status do pedido para aprovado
        const { data, error } = await supabase
          .from('pedidos')
          .update({ 
            status: 'aprovado',
            payment_id: paymentId,
            pago_em: new Date().toISOString()
          })
          .eq('id', externalReference)
          .select()
          .single();

        if (error) throw error;
        setPedido(data);
      } catch (error) {
        console.error('Erro ao atualizar pedido:', error);
      } finally {
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [searchParams, navigate]);

  const enviarWhatsApp = () => {
    if (!pedido) return;
    
    // Formatar itens para a mensagem
    const itensTexto = pedido.itens.map((item: any) => 
      `• ${item.nome} (${item.quantidade}x) - R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}`
    ).join('\n'); // Usar \n para quebra de linha que será codificada depois

    // Construir mensagem
    const mensagem = [
      `✅ *PEDIDO PAGO #${pedido.id.slice(0, 6).toUpperCase()}*`,
      '',
      `👤 *Cliente:* ${pedido.cliente_nome}`,
      `📱 *WhatsApp:* ${pedido.cliente_telefone}`,
      `📦 *Entrega:* ${pedido.tipo_entrega === 'retirada' ? 'Retirada no local' : pedido.tipo_entrega.toUpperCase()}`,
      `💰 *Total Pago:* R$ ${pedido.total.toFixed(2).replace('.', ',')}`,
      '',
      '🛍️ *Itens:*',
      itensTexto
    ].join('\n');

    // Codificar a mensagem corretamente para URL
    const mensagemCodificada = encodeURIComponent(mensagem);

    window.open(`https://wa.me/5547992853033?text=${mensagemCodificada}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative mb-6 mx-auto w-20 h-20">
            <div className="absolute inset-0 border-4 border-neon/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-neon border-t-transparent rounded-full animate-spin"></div>
            <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-neon text-3xl animate-pulse">
              payments
            </span>
          </div>
          <p className="text-gray-600 font-medium text-lg">Confirmando seu pagamento...</p>
          <p className="text-gray-400 text-sm mt-2">Isso pode levar alguns segundos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 text-center transform transition-all animate-fade-in-up">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <span className="material-symbols-outlined text-6xl text-green-500 animate-bounce-short">check_circle</span>
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Pagamento Aprovado!</h1>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            Seu pedido <span className="font-bold text-gray-900">#{pedido?.id.slice(0, 6).toUpperCase()}</span> foi confirmado com sucesso e já estamos preparando tudo.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={enviarWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg shadow-green-200 group"
            >
              <span className="material-symbols-outlined text-2xl group-hover:animate-wiggle">chat</span>
              <span className="text-lg">Receber Comprovante</span>
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full bg-white border-2 border-gray-100 hover:border-neon hover:text-neon text-gray-600 font-bold py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">storefront</span>
              Voltar para a Loja
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-sm text-gray-400">
              Dúvidas? Entre em contato conosco pelo WhatsApp
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
