exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};

    const cepDestino = String(body.cepDestino || '').replace(/\D/g, '');
    const pesoGramas = Number(body.pesoGramas || 0);

    const comprimento = String(body.comprimento ?? '20');
    const largura = String(body.largura ?? '20');
    const altura = String(body.altura ?? '20');

    if (cepDestino.length !== 8) {
      return {
        statusCode: 400,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: 'cepDestino inválido' }),
      };
    }

    if (!Number.isFinite(pesoGramas) || pesoGramas <= 0) {
      return {
        statusCode: 400,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: 'pesoGramas inválido' }),
      };
    }

    const ambiente = (process.env.CORREIOS_AMBIENTE || 'producao').toLowerCase();

    const tokenBaseUrl = ambiente === 'homologacao'
      ? 'https://apihom.correios.com.br/token/v1'
      : 'https://api.correios.com.br/token/v1';

    const precoBaseUrl = ambiente === 'homologacao'
      ? 'https://apihom.correios.com.br/preco/v1'
      : 'https://api.correios.com.br/preco/v1';

    const prazoBaseUrl = ambiente === 'homologacao'
      ? 'https://apihom.correios.com.br/prazo/v1'
      : 'https://api.correios.com.br/prazo/v1';

    const username = process.env.CORREIOS_USERNAME;
    const accessCode = process.env.CORREIOS_ACCESS_CODE;
    const cartaoPostagem = process.env.CORREIOS_CARTAO_POSTAGEM;
    const cepOrigem = String(process.env.CORREIOS_CEP_ORIGEM || '').replace(/\D/g, '');

    const contrato = process.env.CORREIOS_CONTRATO || undefined;
    const dr = process.env.CORREIOS_DR ? Number(process.env.CORREIOS_DR) : undefined;

    if (!username || !accessCode || !cartaoPostagem || cepOrigem.length !== 8) {
      return {
        statusCode: 500,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          error: 'Configuração Correios ausente. Verifique CORREIOS_USERNAME, CORREIOS_ACCESS_CODE, CORREIOS_CARTAO_POSTAGEM e CORREIOS_CEP_ORIGEM.'
        }),
      };
    }

    const basic = Buffer.from(`${username}:${accessCode}`).toString('base64');

    const tokenResp = await fetch(`${tokenBaseUrl}/autentica/cartaopostagem`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Basic ${basic}`,
      },
      body: JSON.stringify({
        numero: String(cartaoPostagem),
        ...(contrato ? { contrato: String(contrato) } : {}),
        ...(Number.isFinite(dr) ? { dr } : {}),
      }),
    });

    if (!tokenResp.ok) {
      const text = await tokenResp.text();
      return {
        statusCode: 502,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: 'Falha ao autenticar na API Token dos Correios', details: text }),
      };
    }

    const tokenData = await tokenResp.json();

    const token = tokenData?.token || tokenData?.access_token || tokenData?.jwt || tokenData?.Token;
    if (!token) {
      return {
        statusCode: 502,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: 'Token não encontrado na resposta dos Correios', details: tokenData }),
      };
    }

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = String(today.getFullYear());

    const dtEvento = `${dd}/${mm}/${yyyy}`;

    const dataPostagemDate = new Date(today);
    dataPostagemDate.setDate(dataPostagemDate.getDate() + 1);
    const dataPostagem = dataPostagemDate.toISOString().slice(0, 10);

    const produtos = [
      { codigo: '03220', nome: 'sedex' },
      { codigo: '03298', nome: 'pac' },
    ];

    const precoBody = {
      idLote: '1',
      parametrosProduto: produtos.map((p, idx) => ({
        coProduto: p.codigo,
        nuRequisicao: String(idx + 1).padStart(4, '0'),
        ...(Number.isFinite(dr) ? { nuDR: dr } : {}),
        ...(contrato ? { nuContrato: String(contrato) } : {}),
        cepOrigem,
        cepDestino,
        psObjeto: String(Math.max(300, Math.round(pesoGramas))),
        nuUnidade: '',
        tpObjeto: '2',
        comprimento,
        largura,
        altura,
      })),
    };

    const precoResp = await fetch(`${precoBaseUrl}/nacional`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(precoBody),
    });

    if (!precoResp.ok) {
      const text = await precoResp.text();
      return {
        statusCode: 502,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: 'Falha ao consultar preço nos Correios', details: text }),
      };
    }

    const precoData = await precoResp.json();

    const prazoBody = {
      idLote: '1',
      parametrosPrazo: produtos.map((p, idx) => ({
        coProduto: p.codigo,
        nuRequisicao: String(idx + 1).padStart(3, '0'),
        dtEvento,
        cepOrigem,
        cepDestino,
        dataPostagem,
      })),
    };

    const prazoResp = await fetch(`${prazoBaseUrl}/nacional`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(prazoBody),
    });

    if (!prazoResp.ok) {
      const text = await prazoResp.text();
      return {
        statusCode: 502,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: 'Falha ao consultar prazo nos Correios', details: text }),
      };
    }

    const prazoData = await prazoResp.json();

    const normalizeNumber = (val) => {
      if (val == null) return null;
      if (typeof val === 'number') return val;
      const s = String(val).replace(/[^0-9,.-]/g, '').replace('.', '').replace(',', '.');
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    };

    const pickPrice = (obj) => {
      const keys = ['pcFinal', 'pcProduto', 'pcServico', 'pcTotal', 'vlFinal', 'valor'];
      for (const k of keys) {
        if (obj && obj[k] != null) {
          const n = normalizeNumber(obj[k]);
          if (n != null) return n;
        }
      }
      return null;
    };

    const pickPrazo = (obj) => {
      const keys = ['prazoEntrega', 'prazo', 'nuPrazo', 'prazoDias'];
      for (const k of keys) {
        if (obj && obj[k] != null) {
          const n = Number(String(obj[k]).replace(/\D/g, ''));
          if (Number.isFinite(n) && n > 0) return n;
        }
      }
      return null;
    };

    const precoList = Array.isArray(precoData?.parametrosProduto)
      ? precoData.parametrosProduto
      : (Array.isArray(precoData) ? precoData : []);

    const prazoList = Array.isArray(prazoData?.parametrosPrazo)
      ? prazoData.parametrosPrazo
      : (Array.isArray(prazoData) ? prazoData : []);

    const byCode = (list) => {
      const m = new Map();
      for (const item of list) {
        const code = item?.coProduto || item?.codigo || item?.coServico;
        if (code) m.set(String(code), item);
      }
      return m;
    };

    const precoMap = byCode(precoList);
    const prazoMap = byCode(prazoList);

    const resp = {};
    for (const p of produtos) {
      const precoItem = precoMap.get(p.codigo);
      const prazoItem = prazoMap.get(p.codigo);
      resp[p.nome] = {
        coProduto: p.codigo,
        valor: pickPrice(precoItem),
        prazoDias: pickPrazo(prazoItem),
        raw: {
          preco: precoItem || null,
          prazo: prazoItem || null,
        },
      };
    }

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        cepOrigem,
        cepDestino,
        pesoGramas: Math.max(300, Math.round(pesoGramas)),
        pac: resp.pac,
        sedex: resp.sedex,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Erro interno', details: String(err?.message || err) }),
    };
  }
};
