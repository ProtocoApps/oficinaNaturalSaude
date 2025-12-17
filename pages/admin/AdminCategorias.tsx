import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

type Categoria = {
  id: number;
  nome: string;
  produtos?: number;
};

const AdminCategorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [nomeCategoria, setNomeCategoria] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCategorias = async () => {
    try {
      setLoading(true);
      // Buscar categorias
      const { data: cats, error: catError } = await supabase
        .from('categorias')
        .select('*')
        .order('id');

      if (catError) throw catError;

      // Buscar produtos para contar (simplificado)
      const { data: prods, error: prodError } = await supabase
        .from('produtos')
        .select('categoria');
      
      if (prodError) console.error('Erro ao contar produtos:', prodError);

      const categoriasComContagem = (cats || []).map((cat) => {
        const count = (prods || []).filter(p => p.categoria === cat.nome).length;
        return { ...cat, produtos: count };
      });

      setCategorias(categoriasComContagem);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      // Fallback visual se a tabela não existir ainda
      setCategorias([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategorias();
  }, []);

  const handleOpenModal = (categoria?: Categoria) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setNomeCategoria(categoria.nome);
    } else {
      setEditingCategoria(null);
      setNomeCategoria('');
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!nomeCategoria.trim()) {
      alert('Digite o nome da categoria');
      return;
    }

    setSaving(true);
    try {
      if (editingCategoria) {
        // Atualizar
        const { error } = await supabase
          .from('categorias')
          .update({ nome: nomeCategoria })
          .eq('id', editingCategoria.id);

        if (error) throw error;
      } else {
        // Criar
        const { error } = await supabase
          .from('categorias')
          .insert({ nome: nomeCategoria });

        if (error) throw error;
      }
      
      setShowModal(false);
      loadCategorias();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert(`Erro ao salvar categoria: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadCategorias();
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir categoria');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-gray-900 text-3xl font-bold leading-tight">Gerenciamento de Categorias</h1>
          <p className="text-gray-500 text-base mt-1">Organize seus produtos em categorias.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-neon text-[#132210] font-bold rounded-lg hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Nova Categoria
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin h-8 w-8 border-2 border-neon border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-500">Carregando categorias...</p>
        </div>
      ) : categorias.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">Nenhuma categoria encontrada.</p>
          <p className="text-sm text-gray-400">Crie a tabela 'categorias' no Supabase se ainda não existir.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categorias.map((categoria) => (
            <div
              key={categoria.id}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neon/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-neon">category</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{categoria.nome}</h3>
                    <p className="text-sm text-gray-500">{categoria.produtos || 0} produtos</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenModal(categoria)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(categoria.id)}
                    className="p-2 rounded-full hover:bg-red-100 text-red-600"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Categoria</label>
              <input
                type="text"
                value={nomeCategoria}
                onChange={(e) => setNomeCategoria(e.target.value)}
                placeholder="Ex: Vitaminas"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-neon/50 focus:border-neon"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-neon text-[#132210] font-bold rounded-lg hover:brightness-110 disabled:opacity-50 flex items-center justify-center"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategorias;
