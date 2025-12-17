import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Pedido = {
  id: string;
  cliente_nome: string;
  cliente_email: string;
  cliente_telefone: string;
  endereco: string;
  cep: string;
  cidade: string;
  created_at: string;
  total: number;
  frete: number;
  tipo_entrega: string;
  status: string;
  itens: any[];
};

const AdminPedidos: React.FC = () => {
  const { searchTerm } = useOutletContext<{ searchTerm: string }>();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos');

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPedidos(data);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, novoStatus: string) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ status: novoStatus })
      .eq('id', id);

    if (!error) {
      loadPedidos();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const generatePDF = (pedido: Pedido) => {
    try {
      const doc = new jsPDF();

      // Cabeçalho
      doc.setFillColor(19, 34, 16); // #132210
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text('Oficina da Saúde Natural', 14, 25);
      
      doc.setFontSize(12);
      doc.text('Comprovante de Pedido', 210 - 14, 25, { align: 'right' });

      // Info do Pedido
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Pedido #${pedido.id.slice(0, 8)}`, 14, 50);
      doc.text(`Data: ${formatDate(pedido.created_at)}`, 14, 56);
      doc.text(`Status: ${pedido.status.toUpperCase()}`, 14, 62);

      // Cliente e Entrega
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 68, 196, 68);

      doc.setFontSize(12);
      doc.text('Dados do Cliente', 14, 78);
      doc.setFontSize(10);
      doc.text(`Nome: ${pedido.cliente_nome || '-'}`, 14, 85);
      doc.text(`Email: ${pedido.cliente_email || '-'}`, 14, 91);
      doc.text(`Telefone: ${pedido.cliente_telefone || '-'}`, 14, 97);

      doc.setFontSize(12);
      doc.text('Endereço de Entrega', 110, 78);
      doc.setFontSize(10);
      doc.text(pedido.endereco || '-', 110, 85);
      doc.text(`${pedido.cidade || '-'} - CEP: ${pedido.cep || '-'}`, 110, 91);
      doc.text(`Tipo de Entrega: ${pedido.tipo_entrega || '-'}`, 110, 97);

      // Tabela de Itens
      const tableColumn = ["Produto", "Qtd", "Preço Unit.", "Total"];
      const itens = Array.isArray(pedido.itens) ? pedido.itens : [];
      
      const tableRows = itens.map((item: any) => {
        if (!item) return ["Item inválido", "0", "R$ 0,00", "R$ 0,00"];
        
        const price = Number(item.price) || 0;
        const qty = Number(item.qty) || 0;
        
        return [
          item.name || 'Produto sem nome',
          qty.toString(),
          `R$ ${price.toFixed(2)}`,
          `R$ ${(price * qty).toFixed(2)}`
        ];
      });

      autoTable(doc, {
        startY: 110,
        head: [tableColumn],
        body: tableRows,
        headStyles: { fillColor: [19, 34, 16], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      // Totais
      // @ts-ignore
      const finalY = doc.lastAutoTable.finalY || 110;
      
      const total = Number(pedido.total) || 0;
      const frete = Number(pedido.frete) || 0;
      
      doc.setFontSize(10);
      doc.text(`Subtotal:`, 140, finalY + 15);
      doc.text(`R$ ${(total - frete).toFixed(2)}`, 196, finalY + 15, { align: 'right' });
      
      doc.text(`Frete:`, 140, finalY + 21);
      doc.text(`R$ ${frete.toFixed(2)}`, 196, finalY + 21, { align: 'right' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTAL:`, 140, finalY + 30);
      doc.text(`R$ ${total.toFixed(2)}`, 196, finalY + 30, { align: 'right' });

      // Rodapé
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Obrigado por comprar na Oficina da Saúde Natural!', 105, 280, { align: 'center' });

      doc.save(`pedido_${pedido.id.slice(0, 8)}.pdf`);
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      alert(`Não foi possível gerar o PDF: ${error.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = normalizeStatus(status);
    const styles: Record<string, string> = {
      pendente: 'bg-yellow-100 text-yellow-800',
      aprovado: 'bg-green-100 text-green-800',
      enviado: 'bg-blue-100 text-blue-800',
      entregue: 'bg-purple-100 text-purple-800',
      cancelado: 'bg-red-100 text-red-800',
    };
    return styles[normalizedStatus] || 'bg-gray-100 text-gray-800';
  };

  const normalizeStatus = (status: string) => {
    const map: Record<string, string> = {
      'aguardando_pagamento': 'pendente',
      'pago': 'aprovado',
    };
    return map[status?.toLowerCase()] || status?.toLowerCase() || 'pendente';
  };

  const filteredPedidos = pedidos.filter((p) => {
    const status = normalizeStatus(p.status);
    const matchesStatus = filtroStatus === 'todos' || status === filtroStatus;

    if (!matchesStatus) return false;

    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    // Busca por ID, Nome do Cliente, Email ou Nome de algum Produto nos itens
    return (
      p.id.toLowerCase().includes(term) ||
      p.cliente_nome?.toLowerCase().includes(term) ||
      p.cliente_email?.toLowerCase().includes(term) ||
      p.itens?.some((item: any) => item.name?.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-gray-900 text-3xl font-bold leading-tight">Gerenciamento de Pedidos</h1>
          <p className="text-gray-500 text-base mt-1">Acompanhe e gerencie os pedidos da sua loja.</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['todos', 'pendente', 'aprovado', 'enviado', 'entregue', 'cancelado'].map((status) => (
          <button
            key={status}
            onClick={() => setFiltroStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap ${
              filtroStatus === status
                ? 'bg-neon/30 text-gray-900'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-500">Carregando...</div>
        ) : filteredPedidos.length === 0 ? (
          <div className="p-6 text-gray-500">Nenhum pedido encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrega</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPedidos.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">#{pedido.id.slice(0, 6)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{pedido.cliente_nome}</p>
                        <p className="text-sm text-gray-500">{pedido.cliente_telefone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(pedido.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 capitalize">{pedido.tipo_entrega}</span>
                      <p className="text-xs text-gray-500">{pedido.cidade}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      R$ {(pedido.total || 0).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative inline-block">
                        <select
                          value={normalizeStatus(pedido.status)}
                          onChange={(e) => updateStatus(pedido.id, e.target.value)}
                          className={`text-xs font-medium pl-4 pr-8 py-1.5 rounded-full border-0 appearance-none cursor-pointer focus:ring-2 focus:ring-neon/50 transition-all hover:brightness-95 ${getStatusBadge(pedido.status)}`}
                        >
                          <option value="pendente">Pendente</option>
                          <option value="aprovado">Aprovado</option>
                          <option value="enviado">Enviado</option>
                          <option value="entregue">Entregue</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <span className="material-symbols-outlined text-[16px] opacity-60">expand_more</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => generatePDF(pedido)}
                        className="flex items-center gap-2 text-neon hover:text-[#132210] transition-colors text-sm font-medium ml-auto bg-neon/10 hover:bg-neon px-3 py-1.5 rounded-lg"
                        title="Baixar Comprovante PDF"
                      >
                        <span className="material-symbols-outlined text-lg">description</span>
                        Baixar PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPedidos;
