import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

type Stats = {
  vendasMes: number;
  totalPedidos: number;
  totalClientes: number;
  totalProdutos: number;
};

type Pedido = {
  id: string;
  cliente_nome: string;
  created_at: string;
  total: number;
  status: string;
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    vendasMes: 0,
    totalPedidos: 0,
    totalClientes: 0,
    totalProdutos: 0,
  });
  const [pedidosRecentes, setPedidosRecentes] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar total de produtos
        const { count: produtosCount } = await supabase
          .from('produtos')
          .select('*', { count: 'exact', head: true });

        // Carregar total de clientes (perfis)
        const { count: clientesCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Carregar pedidos
        const { data: pedidos, count: pedidosCount } = await supabase
          .from('pedidos')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(5);

        // Calcular vendas do mês
        const vendasMes = pedidos?.reduce((sum, p) => sum + (p.total || 0), 0) || 0;

        setStats({
          vendasMes,
          totalPedidos: pedidosCount || 0,
          totalClientes: clientesCount || 0,
          totalProdutos: produtosCount || 0,
        });

        setPedidosRecentes(pedidos || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const normalized = normalizeStatus(status);
    const styles: Record<string, string> = {
      aprovado: 'bg-green-100 text-green-800',
      pendente: 'bg-yellow-100 text-yellow-800',
      enviado: 'bg-blue-100 text-blue-800',
      cancelado: 'bg-red-100 text-red-800',
    };
    return styles[normalized] || 'bg-gray-100 text-gray-800';
  };

  const normalizeStatus = (status: string) => {
    const map: Record<string, string> = {
      'aguardando_pagamento': 'pendente',
      'pago': 'aprovado',
    };
    return map[status?.toLowerCase()] || status?.toLowerCase() || 'pendente';
  };

  return (
    <div>
      <h1 className="text-gray-900 text-3xl font-bold leading-tight mb-6">Visão Geral</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-gray-200">
          <p className="text-gray-600 text-base font-medium">Vendas do Mês</p>
          <p className="text-gray-900 text-3xl font-bold">
            R$ {stats.vendasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-green-600 text-sm font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-base">arrow_upward</span>
            <span>+12.5%</span>
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-gray-200">
          <p className="text-gray-600 text-base font-medium">Total de Pedidos</p>
          <p className="text-gray-900 text-3xl font-bold">{stats.totalPedidos}</p>
          <p className="text-green-600 text-sm font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-base">arrow_upward</span>
            <span>+5.0%</span>
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-gray-200">
          <p className="text-gray-600 text-base font-medium">Clientes</p>
          <p className="text-gray-900 text-3xl font-bold">{stats.totalClientes}</p>
          <p className="text-gray-500 text-sm font-medium">Total cadastrado</p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-gray-200">
          <p className="text-gray-600 text-base font-medium">Produtos</p>
          <p className="text-gray-900 text-3xl font-bold">{stats.totalProdutos}</p>
          <p className="text-gray-500 text-sm font-medium">No catálogo</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white overflow-hidden">
        <h3 className="text-gray-800 text-lg font-bold p-6 border-b border-gray-100">
          Últimos Pedidos
        </h3>
        
        {loading ? (
          <div className="p-6 text-gray-500">Carregando...</div>
        ) : pedidosRecentes.length === 0 ? (
          <div className="p-6 text-gray-500">Nenhum pedido encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">ID do Pedido</th>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Valor</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {pedidosRecentes.map((pedido) => (
                  <tr key={pedido.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">#{pedido.id.slice(0, 4)}</td>
                    <td className="px-6 py-4">{pedido.cliente_nome || 'Cliente'}</td>
                    <td className="px-6 py-4">{formatDate(pedido.created_at)}</td>
                    <td className="px-6 py-4">R$ {pedido.total?.toFixed(2).replace('.', ',')}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusBadge(pedido.status)}`}>
                        {normalizeStatus(pedido.status).charAt(0).toUpperCase() + normalizeStatus(pedido.status).slice(1)}
                      </span>
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

export default Dashboard;
