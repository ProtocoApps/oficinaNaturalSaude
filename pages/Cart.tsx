import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { CartItem } from '../App';

type FreteOption = {
  tipo: string;
  nome: string;
  valor: number;
  prazo: number;
};

type CartProps = {
  items: CartItem[];
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
};

const CEP_ORIGEM = '89207407'; // CEP da loja em Joinville

const Cart: React.FC<CartProps> = ({ items, removeFromCart, updateQuantity }) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const [cep, setCep] = useState('');
  const [freteOptions, setFreteOptions] = useState<FreteOption[]>([]);
  const [selectedFrete, setSelectedFrete] = useState<string>('retirada');
  const [loadingFrete, setLoadingFrete] = useState(false);
  const [cidadeDestino, setCidadeDestino] = useState('');

  // Peso médio por item (em kg) - pode ser ajustado depois
  const pesoTotal = items.reduce((sum, item) => sum + (0.3 * item.qty), 0); // 300g por item

  const calcularFrete = async () => {
    if (cep.replace(/\D/g, '').length !== 8) {
      alert('Digite um CEP válido com 8 dígitos');
      return;
    }

    setLoadingFrete(true);
    const cepLimpo = cep.replace(/\D/g, '');

    try {
      // Buscar cidade pelo CEP
      const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const viaCepData = await viaCepResponse.json();
      if (viaCepData.localidade) {
        setCidadeDestino(`${viaCepData.localidade}, ${viaCepData.uf}`);
      }

      // Calcular frete usando API pública (simulação baseada em distância)
      // Como a API oficial dos Correios requer contrato, vamos usar uma estimativa
      const pesoKg = Math.max(pesoTotal, 0.3); // mínimo 300g
      
      // Estimativa baseada em região
      const ufOrigem = 'SC';
      const ufDestino = viaCepData.uf || 'SC';
      
      let multiplicador = 1;
      if (ufDestino === ufOrigem) multiplicador = 1;
      else if (['PR', 'RS'].includes(ufDestino)) multiplicador = 1.2;
      else if (['SP', 'RJ', 'MG', 'ES'].includes(ufDestino)) multiplicador = 1.5;
      else multiplicador = 2;

      const baseSedex = 15 + (pesoKg * 8);
      const basePac = 12 + (pesoKg * 5);

      const sedexValor = Number((baseSedex * multiplicador).toFixed(2));
      const pacValor = Number((basePac * multiplicador).toFixed(2));

      // Prazo estimado
      const prazoSedex = ufDestino === ufOrigem ? 2 : (['PR', 'RS'].includes(ufDestino) ? 3 : 5);
      const prazoPac = ufDestino === ufOrigem ? 5 : (['PR', 'RS'].includes(ufDestino) ? 7 : 12);

      setFreteOptions([
        { tipo: 'retirada', nome: 'Retirada no local', valor: 0, prazo: 0 },
        { tipo: 'sedex', nome: 'SEDEX', valor: sedexValor, prazo: prazoSedex },
        { tipo: 'pac', nome: 'PAC', valor: pacValor, prazo: prazoPac },
      ]);
      setSelectedFrete('retirada');
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      // Fallback com valores padrão
      setFreteOptions([
        { tipo: 'retirada', nome: 'Retirada no local', valor: 0, prazo: 0 },
        { tipo: 'sedex', nome: 'SEDEX', valor: 25.00, prazo: 5 },
        { tipo: 'pac', nome: 'PAC', valor: 18.00, prazo: 10 },
      ]);
    } finally {
      setLoadingFrete(false);
    }
  };

  const freteValor = freteOptions.find(f => f.tipo === selectedFrete)?.valor || 0;
  const total = subtotal + freteValor;

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  return (
    <div className="bg-background-light min-h-screen pt-10 pb-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">
        <h1 className="text-3xl md:text-4xl font-black mb-8 text-gray-900">Carrinho de Compras</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-8 items-start">
          <div className="space-y-6">
            {items.length === 0 && (
              <p className="text-gray-500 text-sm">
                Seu carrinho está vazio.
              </p>
            )}
            {items.map((item) => (
               <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6">
                 <div className="w-full sm:w-28 h-28 bg-gray-100 rounded-lg bg-center bg-cover flex-shrink-0" style={{ backgroundImage: `url("${item.image}")` }}></div>
                 <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                      <p className="text-neon font-semibold mt-1">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                       <div className="flex items-center border border-gray-200 rounded-full h-9">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-9 h-full flex items-center justify-center hover:bg-neon/10 rounded-l-full text-neon hover:text-neon"
                          >
                            -
                          </button>
                          <input type="text" value={item.qty} readOnly className="w-10 text-center border-none bg-transparent p-0 text-sm font-medium text-gray-900" />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-9 h-full flex items-center justify-center hover:bg-neon/10 rounded-r-full text-neon hover:text-neon"
                          >
                            +
                          </button>
                       </div>
                       <button
                         type="button"
                         onClick={() => removeFromCart(item.id)}
                         className="text-gray-400 hover:text-red-500 transition-colors"
                       >
                          <span className="material-symbols-outlined">delete</span>
                       </button>
                    </div>
                 </div>
               </div>
            ))}
            
            <Link to="/products" className="inline-flex items-center gap-2 text-primary-dark font-bold hover:underline mt-4">
               <span className="material-symbols-outlined">arrow_back</span>
               Continuar Comprando
            </Link>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
             <h2 className="text-2xl font-bold mb-6 text-gray-900">Resumo do Pedido</h2>
             <div className="space-y-4 text-gray-600">
                <div className="flex justify-between">
                   <span>Subtotal ({items.reduce((sum, i) => sum + i.qty, 0)} itens)</span>
                   <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
             </div>

             {/* Cálculo de Frete */}
             <div className="border-t border-gray-100 my-6"></div>
             <div className="space-y-4">
                <h3 className="font-bold text-gray-900">Calcular Frete</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite seu CEP"
                    value={cep}
                    onChange={(e) => setCep(formatCep(e.target.value))}
                    maxLength={9}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-neon/50 focus:border-neon text-sm"
                  />
                  <button
                    onClick={calcularFrete}
                    disabled={loadingFrete}
                    className="px-4 py-3 bg-neon text-[#132210] font-bold rounded-lg hover:bg-neon/90 transition-colors text-sm disabled:opacity-50"
                  >
                    {loadingFrete ? '...' : 'Calcular'}
                  </button>
                </div>

                {cidadeDestino && (
                  <p className="text-sm text-gray-500">
                    Entrega para <span className="font-medium text-gray-700">{cidadeDestino}</span>
                  </p>
                )}

                {freteOptions.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {freteOptions.map((option) => (
                      <label
                        key={option.tipo}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedFrete === option.tipo
                            ? 'border-neon bg-neon/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="frete"
                            value={option.tipo}
                            checked={selectedFrete === option.tipo}
                            onChange={(e) => setSelectedFrete(e.target.value)}
                            className="text-neon focus:ring-neon"
                          />
                          <div>
                            <span className="font-medium text-gray-900">{option.nome}</span>
                            {option.prazo > 0 && (
                              <span className="text-xs text-gray-500 ml-2">
                                até {option.prazo} dias úteis
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`font-bold ${option.valor === 0 ? 'text-neon' : 'text-gray-900'}`}>
                          {option.valor === 0 ? 'Grátis' : `R$ ${option.valor.toFixed(2).replace('.', ',')}`}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
             </div>

             <div className="border-t border-gray-100 my-6"></div>
             <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                   <span>Subtotal</span>
                   <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                   <span>Frete</span>
                   <span>{freteValor === 0 ? 'Grátis' : `R$ ${freteValor.toFixed(2).replace('.', ',')}`}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                   <span className="text-lg font-bold text-gray-900">Total</span>
                   <span className="text-2xl font-black text-neon">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
             </div>
             <Link to="/checkout" className="block w-full py-4 bg-neon text-[#132210] text-center font-bold rounded-full hover:shadow-lg hover:shadow-neon/30 transition-all hover:-translate-y-1">
                Finalizar Compra
             </Link>
             <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 uppercase tracking-wide font-bold">
                 <span className="material-symbols-outlined text-base">lock</span>
                 Compra Segura
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;