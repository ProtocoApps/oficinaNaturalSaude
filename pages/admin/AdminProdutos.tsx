import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

type Variacao = {
  gramas: string;
  preco: number;
};

type Produto = {
  id: string;
  produto_id: string;
  produto_nome: string;
  preco: number;
  status: string;
  categoria?: string;
  gramas?: string;
  descricao?: string;
  imagens?: string[];
  variacoes?: Variacao[];
};

const imageByProdutoId: Record<string, string> = {
  '1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFqfRvPlxLtpJf3q4Q_4nbSx9qYYKC9Bfpfo-t-Y1C-StMKE3C3oK_IY7xW1PP0lAXxi0_S8chw44Ou7mr7yPHZC8fDbbfqPBbcZcDWnlHDvUnZyS39-3wbxBRqOCHy14AaDbuzyPnpVdi2njwgMOIPpKgQ2cq0yvLv4fFODzpBJNDI0mnX3M8TmxPSHmrBp2J-yy4IhbCUFXSaZ6hdckt7U3SMv3TiYPh6vEFdECsX-hBbd_N1jiZMscPs3KpNlMgpltxB6oPwalh',
  '2': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxNsEreXnXH8j-ImeOC6ICXbB_X7sfhJRf065-7sQMyvN4qH06X119y_pOp5s36RV9VzHUrSy9Wl1RcAc4CX2kFIjPCDde-NoPVORgGBs47gUjD5horwh9ibWB0S-i6jF2MAvgNaWut5DuU72VdNU_P2R2qDhDIrJZzs3qqOtwgLZyag_KtIU3tUqBi4Ubnt5EnZP3zOlD0TwZHJ0K1bFlC7wzMWp0nHJ-o4VSeo2WbwoNsTgzb8z-1hf-SKMfFh99GyxBOWV3AQjJ',
  '3': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDq72sQ_WEOQMb5_Va4aBzY3qU5b5n3_0ubUlrY-dp4rJgUnfzpLHwgUnieFBsEqC23x6OygckLCVgweooL9ERt2u8yOXxt7B5FmDzIBnvq5FrGbXQuLNGVN03KC_zfq1krM2vOsXvXHxoeKSe1CwmF8MmfDHxGFqY2arSrj4MYJfaft5k2gIHxPKqZGtxT-hYGwCO-_VlRKf_ZdrPztUs_Dn_w8aHEEL02vT4av2whHYO0j959ShQr5wvSCwIVh8zxM11wBQS9bNsm',
  '4': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaP2m-SaJsgUjIbxWkJJ652kt6IMD6zcY9we8UjPOnIjSbQjypq4KVqAZx1clfdqSNVd6kZGT7oxP-_bqMxQx-vxyKKH8dipEpjqmIEOCw0na5K4DcFW2tnh14l_pCncULEJzahq-Cn5bidDs1ijsMMhB1tY7pNxxkRP7ssPAkl3Lf0i7h87Ns1U-Kv8cqhvoBBdVlYSYwti6uDnGhrgLf_UVl5Hoz00lfceFanj0jCvjgWffzid3oelQnFTMUwlMguusrisqjqDME',
  '5': 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5Q0DyOA_ZKfVSjXgO6wSSuoVJZldfRGuRtfRC1G9geNNjfgmnkEGAliv8T9ob540g-rOICXKGZvCMjR-Gm-PcFLOl--9JZyYFdL-Hj-nanBzP2KSQupoS4mbKH8YtjHXYeDeQsdp8OCG5oavrNUlMm9ytPTB4935pgPVjcwva8wzEEeog5CqiDwu_8V91Hch3NjqRJ0YH9bMzJiH7xi58lBCipIVogkQu1HD4_EEiDxm46p9HSlcXxmfbfUFRyGU4crxguGE5uE6m',
};

const GRAMAS_OPTIONS = ['50g', '100g', '200g', '250g', '500g', '1kg'];

const AdminProdutos: React.FC = () => {
  const { searchTerm } = useOutletContext<{ searchTerm: string }>();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [formData, setFormData] = useState<{
    produto_nome: string;
    preco: string;
    status: string;
    categoria: string;
    gramas: string;
    descricao: string;
    imagens: string[];
    newImages: File[];
    variacoes: Variacao[];
  }>({
    produto_nome: '',
    preco: '',
    status: 'ativo',
    categoria: 'Chás',
    gramas: '',
    descricao: '',
    imagens: [],
    newImages: [],
    variacoes: [],
  });
  const [novaVariacaoGramas, setNovaVariacaoGramas] = useState('');
  const [novaVariacaoPreco, setNovaVariacaoPreco] = useState('');

  const loadProdutos = async () => {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('produto_nome');

    if (!error && data) {
      setProdutos(data);
    }

    // Carregar categorias
    const { data: catsData } = await supabase
      .from('categorias')
      .select('nome')
      .order('nome');
    
    if (catsData) {
      setCategorias(catsData.map(c => c.nome));
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProdutos();
  }, []);

  const filteredProdutos = produtos.filter((p) =>
    p.produto_nome?.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const handleOpenModal = (produto?: Produto) => {
    if (produto) {
      setEditingProduto(produto);
      setFormData({
        produto_nome: produto.produto_nome,
        preco: produto.preco.toString(),
        status: produto.status || 'ativo',
        categoria: produto.categoria || 'Chás',
        gramas: produto.gramas || '',
        descricao: produto.descricao || '',
        imagens: produto.imagens || [],
        newImages: [],
        variacoes: produto.variacoes || [],
      });
    } else {
      setEditingProduto(null);
      setFormData({
        produto_nome: '',
        preco: '',
        status: 'ativo',
        categoria: 'Chás',
        gramas: '',
        descricao: '',
        imagens: [],
        newImages: [],
        variacoes: [],
      });
      setNovaVariacaoGramas('');
      setNovaVariacaoPreco('');
    }
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        newImages: [...prev.newImages, ...filesArray]
      }));
    }
  };

  const handleRemoveImage = (index: number, isNew: boolean) => {
    if (isNew) {
      setFormData(prev => ({
        ...prev,
        newImages: prev.newImages.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        imagens: prev.imagens.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSave = async () => {
    const preco = parseFloat(formData.preco.replace(',', '.'));
    
    if (!formData.produto_nome || isNaN(preco)) {
      alert('Preencha todos os campos corretamente');
      return;
    }

    setUploading(true);
    let uploadedImageUrls: string[] = [...formData.imagens];

    // Upload new images to Supabase Storage
    if (formData.newImages.length > 0) {
      for (const file of formData.newImages) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('produtos')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Erro ao fazer upload:', uploadError);
          setUploading(false);
          alert(`Erro ao fazer upload da imagem ${file.name}:\n\n${uploadError.message}\n\nVerifique se o bucket 'produtos' existe e tem as políticas de acesso configuradas no Supabase Storage.`);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('produtos')
          .getPublicUrl(filePath);

        uploadedImageUrls.push(publicUrl);
      }
    }

    const produtoData = {
      produto_nome: formData.produto_nome,
      preco,
      status: formData.status,
      categoria: formData.categoria,
      descricao: formData.descricao,
      gramas: formData.variacoes.length > 0 ? formData.variacoes[0].gramas : formData.gramas,
      imagens: uploadedImageUrls,
      variacoes: formData.variacoes.length > 0 ? formData.variacoes : null,
    };

    if (editingProduto) {
      // Atualizar
      const { error } = await supabase
        .from('produtos')
        .update(produtoData)
        .eq('id', editingProduto.id);

      if (error) {
        alert(`Erro ao atualizar produto:\n${error.message}`);
        console.error('Erro Supabase:', error);
        setUploading(false);
        return;
      }
    } else {
      // Criar novo
      const { error } = await supabase.from('produtos').insert({
        ...produtoData,
        produto_id: Date.now().toString(),
      });

      if (error) {
        alert('Erro ao criar produto');
        console.error(error);
        setUploading(false);
        return;
      }
    }

    setUploading(false);
    setShowModal(false);
    loadProdutos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    const { error } = await supabase.from('produtos').delete().eq('id', id);

    if (error) {
      alert('Erro ao excluir produto');
      return;
    }

    loadProdutos();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-gray-900 text-3xl font-bold leading-tight">Gerenciamento de Produtos</h1>
          <p className="text-gray-500 text-base mt-1">
            Adicione, edite e remova produtos do seu catálogo.
            <span className="ml-2 font-semibold text-neon">
              Total: {filteredProdutos.length} {filteredProdutos.length === 1 ? 'produto' : 'produtos'}
            </span>
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-neon text-[#132210] font-bold rounded-lg hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Adicionar Produto
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome do Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-gray-500">Carregando...</td>
                </tr>
              ) : filteredProdutos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-gray-500">Nenhum produto encontrado.</td>
                </tr>
              ) : (
                filteredProdutos.map((produto) => {
                  const image = (produto.imagens && produto.imagens.length > 0) 
                    ? produto.imagens[0] 
                    : (imageByProdutoId[produto.produto_id] || imageByProdutoId['1']);
                  return (
                    <tr key={produto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="h-12 w-12 rounded-lg bg-gray-100 bg-cover bg-center border border-gray-200" 
                             style={{ backgroundImage: `url("${image}")` }}>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{produto.produto_nome}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        R$ {produto.preco?.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          produto.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {produto.status || 'Ativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(produto)}
                            className="p-2 rounded-full hover:bg-gray-200 text-gray-600"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(produto.id)}
                            className="p-2 rounded-full hover:bg-red-100 text-red-600"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {formData.id ? 'Editar Produto' : 'Adicionar Produto'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Produto</label>
                  <input
                    type="text"
                    value={formData.produto_nome}
                    onChange={(e) => setFormData({ ...formData, produto_nome: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-neon/50 focus:border-neon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preço (R$)</label>
                  <input
                    type="text"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-neon/50 focus:border-neon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-neon/50 focus:border-neon"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição do Produto</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descreva os benefícios, composição ou modo de uso..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-neon/50 focus:border-neon resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Peso do Produto</label>
                  <p className="text-xs text-gray-500 mb-3">Digite o peso ou escolha uma opção. Você pode digitar qualquer valor (ex: 80g, 150g, 1.5kg)</p>
                  <input
                    type="text"
                    list="gramas-options"
                    value={formData.gramas}
                    onChange={(e) => setFormData({ ...formData, gramas: e.target.value })}
                    placeholder="Ex: 100g, 250g, 1kg..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-neon/50 focus:border-neon"
                  />
                  <datalist id="gramas-options">
                    {GRAMAS_OPTIONS.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Variações de Peso e Preço (opcional)</label>
                  <p className="text-xs text-gray-500 mb-3">Se o produto tiver diferentes pesos com preços diferentes, adicione aqui. Caso contrário, use apenas o campo acima.</p>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        list="gramas-options-variacao"
                        value={novaVariacaoGramas}
                        onChange={(e) => setNovaVariacaoGramas(e.target.value)}
                        placeholder="Peso (ex: 50g, 200g)"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-neon/50 focus:border-neon text-sm"
                      />
                      <datalist id="gramas-options-variacao">
                        {GRAMAS_OPTIONS.map((option) => (
                          <option key={option} value={option} />
                        ))}
                      </datalist>
                      <input
                        type="text"
                        value={novaVariacaoPreco}
                        onChange={(e) => setNovaVariacaoPreco(e.target.value)}
                        placeholder="Preço (R$)"
                        className="w-28 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-neon/50 focus:border-neon text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const gramas = novaVariacaoGramas.trim();
                          const preco = parseFloat(novaVariacaoPreco.replace(',', '.'));
                          
                          if (!gramas || isNaN(preco) || preco <= 0) {
                            alert('Digite o peso e um preço válido');
                            return;
                          }
                          
                          const jaExiste = formData.variacoes.some(v => v.gramas.toLowerCase() === gramas.toLowerCase());
                          if (jaExiste) {
                            alert('Já existe uma variação com esse peso');
                            return;
                          }
                          
                          setFormData(prev => ({
                            ...prev,
                            variacoes: [...prev.variacoes, { gramas, preco }]
                          }));
                          
                          setNovaVariacaoGramas('');
                          setNovaVariacaoPreco('');
                        }}
                        className="px-4 py-2 bg-neon text-[#132210] font-medium rounded-lg hover:brightness-110 text-sm"
                      >
                        Adicionar
                      </button>
                    </div>
                    
                    {formData.variacoes.length > 0 && (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Peso</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Preço</th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Ação</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {formData.variacoes.map((variacao, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2 font-medium">{variacao.gramas}</td>
                                <td className="px-3 py-2">R$ {variacao.preco.toFixed(2).replace('.', ',')}</td>
                                <td className="px-3 py-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        variacoes: prev.variacoes.filter((_, i) => i !== index)
                                      }));
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <span className="material-symbols-outlined text-base">delete</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {formData.variacoes.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-2">Nenhuma variação adicionada</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imagens do Produto</label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center cursor-pointer relative mb-3">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span className="material-symbols-outlined text-2xl text-gray-400">cloud_upload</span>
                    <p className="text-xs text-gray-500 mt-1">Clique ou arraste imagens aqui</p>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {formData.imagens.map((img, index) => (
                      <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index, false)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-[10px] leading-none flex items-center justify-center w-4 h-4">close</span>
                        </button>
                      </div>
                    ))}
                    
                    {formData.newImages.map((file, index) => (
                      <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={URL.createObjectURL(file)} alt={`New Preview ${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index, true)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-[10px] leading-none flex items-center justify-center w-4 h-4">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-neon/50 focus:border-neon"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={uploading}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={uploading}
                  className="flex-1 py-3 bg-neon text-[#132210] font-bold rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-[#132210] border-t-transparent rounded-full"></div>
                      Enviando imagens...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProdutos;
