// Tabela de preços dos Correios baseada nas imagens fornecidas
// Valores aproximados para PAC e SEDEX por faixa de peso

type TipoFrete = 'pac' | 'sedex';

interface FaixaPeso {
  min: number;
  max: number;
  precoPac: number;
  precoSedex: number;
}

// Tabela de preços por faixa de peso (em gramas)
const TABELA_FRETE: FaixaPeso[] = [
  { min: 0, max: 300, precoPac: 19.99, precoSedex: 24.99 },    // Até 300g
  { min: 301, max: 400, precoPac: 20.49, precoSedex: 26.49 },  // 301-400g
  { min: 401, max: 500, precoPac: 21.99, precoSedex: 28.99 },  // 401-500g
  { min: 501, max: 600, precoPac: 23.49, precoSedex: 30.49 },  // 501-600g
  { min: 601, max: 700, precoPac: 24.99, precoSedex: 32.99 },  // 601-700g
  { min: 701, max: 800, precoPac: 26.49, precoSedex: 34.99 },  // 701-800g
  { min: 801, max: 900, precoPac: 27.99, precoSedex: 36.99 },  // 801-900g
  { min: 901, max: 1000, precoPac: 29.49, precoSedex: 38.99 }, // 901-1000g
  { min: 1001, max: 1100, precoPac: 30.99, precoSedex: 40.99 }, // 1001-1100g
  { min: 1101, max: 1200, precoPac: 32.49, precoSedex: 42.99 }, // 1101-1200g
  { min: 1201, max: 1300, precoPac: 33.99, precoSedex: 44.99 }, // 1201-1300g
  { min: 1301, max: 1400, precoPac: 35.49, precoSedex: 46.99 }, // 1301-1400g
  { min: 1401, max: 1500, precoPac: 36.99, precoSedex: 48.99 }, // 1401-1500g
];

// Função para extrair peso em gramas do nome do produto
export function extrairPeso(nomeProduto: string): number {
  // Procura por padrões como "100g", "500g", "1kg" etc
  const match = nomeProduto.match(/(\d+)\s*(g|kg)/i);
  if (!match) return 0;
  
  const valor = parseInt(match[1]);
  const unidade = match[2].toLowerCase();
  
  return unidade === 'kg' ? valor * 1000 : valor;
}

// Função para calcular o frete com base no peso total
export function calcularFrete(pesoTotalGramas: number, tipo: TipoFrete): number {
  // Encontra a faixa de peso adequada
  const faixa = TABELA_FRETE.find(f => pesoTotalGramas >= f.min && pesoTotalGramas <= f.max);
  
  if (!faixa) {
    // Se o peso for maior que 1500g, calcula proporcionalmente
    const ultimaFaixa = TABELA_FRETE[TABELA_FRETE.length - 1];
    const precoBase = tipo === 'pac' ? ultimaFaixa.precoPac : ultimaFaixa.precoSedex;
    const pesoExcedente = pesoTotalGramas - ultimaFaixa.max;
    const precoAdicional = (pesoExcedente / 100) * 2; // R$2 por 100g excedente
    return precoBase + precoAdicional;
  }
  
  return tipo === 'pac' ? faixa.precoPac : faixa.precoSedex;
}

// Função para calcular o peso total dos itens do carrinho
export function calcularPesoTotal(items: Array<{name: string, qty: number}>): number {
  return items.reduce((total, item) => {
    const pesoItem = extrairPeso(item.name);
    return total + (pesoItem * item.qty);
  }, 0);
}

// Função principal para calcular o frete do carrinho
export function calcularFreteCarrinho(
  items: Array<{name: string, qty: number}>, 
  tipo: TipoFrete
): number {
  const pesoTotal = calcularPesoTotal(items);
  return calcularFrete(pesoTotal, tipo);
}

// Função para formatar o peso de forma legível
export function formatarPeso(pesoGramas: number): string {
  if (pesoGramas >= 1000) {
    return `${(pesoGramas / 1000).toFixed(1)}kg`;
  }
  return `${pesoGramas}g`;
}

// Função para obter todas as opções de frete
export function opcoesFrete(pesoTotalGramas: number) {
  return {
    pac: {
      preco: calcularFrete(pesoTotalGramas, 'pac'),
      prazo: 5, // dias úteis aproximados
      nome: 'PAC'
    },
    sedex: {
      preco: calcularFrete(pesoTotalGramas, 'sedex'),
      prazo: 2, // dias úteis aproximados
      nome: 'SEDEX'
    }
  };
}
