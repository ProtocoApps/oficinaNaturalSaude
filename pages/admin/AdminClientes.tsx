import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

type Cliente = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  total_pedidos: number;
  created_at: string;
  tipo: 'cadastrado' | 'comprador';
};

const AdminClientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      // 1. Buscar todos os perfis cadastrados
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*');

      if (profileError) throw profileError;

      // 2. Buscar dados de pedidos para complementar
      const { data: pedidos, error: pedidoError } = await supabase
        .from('pedidos')
        .select('cliente_email, cliente_nome, cliente_telefone, cidade');

      const clientesMap = new Map<string, Cliente>();

      // Adicionar perfis cadastrados
      if (profiles) {
        profiles.forEach((profile) => {
          clientesMap.set(profile.email, {
            id: profile.id,
            nome: 'Usuário Cadastrado', // Nome padrão até comprar
            email: profile.email,
            telefone: '-',
            cidade: '-',
            total_pedidos: 0,
            created_at: profile.created_at,
            tipo: 'cadastrado'
          });
        });
      }

      // Atualizar com dados de compras reais
      if (pedidos) {
        pedidos.forEach((pedido) => {
          const email = pedido.cliente_email;
          if (email) {
            const existing = clientesMap.get(email);
            if (existing) {
              // Atualiza usuário existente com dados reais
              clientesMap.set(email, {
                ...existing,
                nome: pedido.cliente_nome || existing.nome,
                telefone: pedido.cliente_telefone || existing.telefone,
                cidade: pedido.cidade || existing.cidade,
                total_pedidos: existing.total_pedidos + 1,
                tipo: 'comprador'
              });
            } else {
              // Cliente que comprou mas não tem cadastro (se isso for possível no futuro)
              clientesMap.set(email, {
                id: `guest-${Math.random()}`,
                nome: pedido.cliente_nome,
                email: email,
                telefone: pedido.cliente_telefone,
                cidade: pedido.cidade,
                total_pedidos: 1,
                created_at: new Date().toISOString(),
                tipo: 'comprador'
              });
            }
          }
        });
      }

      setClientes(Array.from(clientesMap.values()));
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClientes = clientes.filter((c) =>
    c.nome?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-gray-900 text-3xl font-bold leading-tight">Gerenciamento de Clientes</h1>
          <p className="text-gray-500 text-base mt-1">Visualize os clientes que já compraram na sua loja.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-neon/50 focus:border-neon"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedidos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente desde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-gray-500">Carregando...</td>
                </tr>
              ) : filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-gray-500">Nenhum cliente encontrado.</td>
                </tr>
              ) : (
                filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neon/20 rounded-full flex items-center justify-center">
                          <span className="text-neon font-bold">
                            {cliente.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{cliente.nome}</p>
                          <p className="text-sm text-gray-500">{cliente.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        cliente.tipo === 'comprador' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {cliente.tipo === 'comprador' ? 'Cliente Comprador' : 'Apenas Cadastro'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{cliente.telefone}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{cliente.cidade}</td>
                    <td className="px-6 py-4">
                      <span className="bg-neon/20 text-gray-900 text-sm font-medium px-2.5 py-0.5 rounded-full">
                        {cliente.total_pedidos}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(cliente.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminClientes;
