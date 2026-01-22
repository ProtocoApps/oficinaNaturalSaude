import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { CartItem } from '../App';

type DbProduto = {
  id: string;
  produto_id: string | null;
  produto_nome: string | null;
  preco: number | null;
  status: string | null;
};

type Variacao = {
  gramas: string;
  preco: number;
};

type UIProduct = {
  id: string;
  produtoId: string;
  name: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  variacoes?: Variacao[] | null;
  gramas?: string | null;
};

type ProductsProps = {
  addToCart: (item: CartItem) => void;
};

const imageByProdutoId: Record<string, string> = {
  '1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFqfRvPlxLtpJf3q4Q_4nbSx9qYYKC9Bfpfo-t-Y1C-StMKE3C3oK_IY7xW1PP0lAXxi0_S8chw44Ou7mr7yPHZC8fDbbfqPBbcZcDWnlHDvUnZyS39-3wbxBRqOCHy14AaDbuzyPnpVdi2njwgMOIPpKgQ2cq0yvLv4fFODzpBJNDI0mnX3M8TmxPSHmrBp2J-yy4IhbCUFXSaZ6hdckt7U3SMv3TiYPh6vEFdECsX-hBbd_N1jiZMscPs3KpNlMgpltxB6oPwalh',
  '2': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxNsEreXnXH8j-ImeOC6ICXbB_X7sfhJRf065-7sQMyvN4qH06X119y_pOp5s36RV9VzHUrSy9Wl1RcAc4CX2kFIjPCDde-NoPVORgGBs47gUjD5horwh9ibWB0S-i6jF2MAvgNaWut5DuU72VdNU_P2R2qDhDIrJZzs3qqOtwgLZyag_KtIU3tUqBi4Ubnt5EnZP3zOlD0TwZHJ0K1bFlC7wzMWp0nHJ-o4VSeo2WbwoNsTgzb8z-1hf-SKMfFh99GyxBOWV3AQjJ',
  '3': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDq72sQ_WEOQMb5_Va4aBzY3qU5b5n3_0ubUlrY-dp4rJgUnfzpLHwgUnieFBsEqC23x6OygckLCVgweooL9ERt2u8yOXxt7B5FmDzIBnvq5FrGbXQuLNGVN03KC_zfq1krM2vOsXvXHxoeKSe1CwmF8MmfDHxGFqY2arSrj4MYJfaft5k2gIHxPKqZGtxT-hYGwCO-_VlRKf_ZdrPztUs_Dn_w8aHEEL02vT4av2whHYO0j959ShQr5wvSCwIVh8zxM11wBQS9bNsm',
  '4': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaP2m-SaJsgUjIbxWkJJ652kt6IMD6zcY9we8UjPOnIjSbQjypq4KVqAZx1clfdqSNVd6kZGT7oxP-_bqMxQx-vxyKKH8dipEpjqmIEOCw0na5K4DcFW2tnh14l_pCncULEJzahq-Cn5bidDs1ijsMMhB1tY7pNxxkRP7ssPAkl3Lf0i7h87Ns1U-Kv8cqhvoBBdVlYSYwti6uDnGhrgLf_UVl5Hoz00lfceFanj0jCvjgWffzid3oelQnFTMUwlMguusrisqjqDME',
  '5': 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5Q0DyOA_ZKfVSjXgO6wSSuoVJZldfRGuRtfRC1G9geNNjfgmnkEGAliv8T9ob540g-rOICXKGZvCMjR-Gm-PcFLOl--9JZyYFdL-Hj-nanBzP2KSQupoS4mbKH8YtjHXYeDeQsdp8OCG5oavrNUlMm9ytPTB4935pgPVjcwva8wzEEeog5CqiDwu_8V91Hch3NjqRJ0YH9bMzJiH7xi58lBCipIVogkQu1HD4_EEiDxm46p9HSlcXxmfbfUFRyGU4crxguGE5uE6m',
};

const categoryByProdutoId: Record<string, string> = {
  '1': 'Chás',
  '6': 'Chás',
  '7': 'Chás',
  '2': 'Suplementos',
  '8': 'Suplementos',
  '9': 'Suplementos',
  '3': 'Cuidados com a pele',
  '4': 'Cuidados com a pele',
  '5': 'Cuidados com a pele',
  '10': 'Cuidados com a pele',
  '11': 'Cuidados com a pele',
};

const brandByProdutoId: Record<string, string> = {
  '1': 'Naturalis',
  '2': 'Naturalis',
  '3': 'Naturalis',
  '4': 'Terra Viva',
  '5': 'Terra Viva',
  '6': 'Organico',
  '7': 'Organico',
  '8': 'Naturalis',
  '9': 'Terra Viva',
  '10': 'Organico',
  '11': 'Organico',
};

const parsePriceToNumber = (price: string): number => {
  // Remove "R$" e espaços, troca ponto de milhar e vírgula decimal para formato JS
  const cleaned = price
    .replace(/R\$/i, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');
  const value = Number(cleaned);
  return Number.isNaN(value) ? 0 : value;
};

const Products: React.FC<ProductsProps> = ({ addToCart }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<UIProduct[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(200);
  const [sortBy, setSortBy] = useState<'relevance' | 'priceAsc' | 'priceDesc'>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Sempre buscar do Supabase para garantir dados atualizados
        const { data, error } = await supabase
          .from('produtos')
          .select('id, produto_id, produto_nome, preco, status, imagens, categoria, variacoes, gramas')
          .order('produto_nome', { ascending: true });

        if (error) {
          console.error('Erro ao carregar produtos do Supabase:', error);
          setLoading(false);
          return;
        }

        console.log(`Total de produtos carregados do banco: ${data?.length || 0}`);

        const mapped: UIProduct[] = (data || [])
          .filter((p) => {
            // Filtrar apenas produtos com nome e preço válidos
            const hasName = p.produto_nome && p.produto_nome.trim() !== '';
            const hasPrice = p.preco != null && !isNaN(Number(p.preco)) && Number(p.preco) > 0;
            
            if (!hasName || !hasPrice) {
              console.warn('Produto filtrado (sem nome ou preço):', p.id, p.produto_nome, p.preco);
            }
            
            return hasName && hasPrice;
          })
          .map((p) => {
            const produtoId = (p.produto_id || '').toString();
            const image = (p.imagens && p.imagens.length > 0) 
              ? p.imagens[0] 
              : (imageByProdutoId[produtoId] ?? imageByProdutoId['1']);
            const category = p.categoria || categoryByProdutoId[produtoId] || 'Outros';
            const brand = brandByProdutoId[produtoId] ?? 'Naturalis';
            return {
              id: p.id,
              produtoId,
              name: p.produto_nome as string,
              price: p.preco as number,
              image,
              category,
              brand,
              variacoes: (p as any).variacoes,
              gramas: (p as any).gramas,
            };
          });

        console.log(`Total de produtos mapeados e exibidos: ${mapped.length}`);
        setProducts(mapped);
        
        // Atualiza o cache para as próximas navegações
        try {
          localStorage.setItem('productsCache', JSON.stringify(mapped));
        } catch {
          // se não conseguir salvar, segue sem cache
        }
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);
  const handleAddToCart = (product: UIProduct) => {
    // Se tem múltiplas opções de gramas, redireciona para a página do produto
    const hasMultipleOptions = (product.variacoes && product.variacoes.length > 1) || 
                              (product.gramas && product.variacoes && product.variacoes.length === 0);
    
    if (hasMultipleOptions) {
      navigate(`/product/${product.id}`);
      return;
    }
    
    const item: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1,
    };
    addToCart(item);
    setJustAddedId(product.id);
    window.setTimeout(() => {
      setJustAddedId((current) => (current === product.id ? null : current));
    }, 800);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const applyFilters = (items: UIProduct[]): UIProduct[] => {
    let result = [...items];

    // Busca por nome
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(term));
    }

    // Categorias
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // Marcas
    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    // Faixa de preço (preço máximo via slider)
    result = result.filter((p) => p.price <= maxPrice);

    // Ordenação
    if (sortBy === 'priceAsc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  };

  const filteredProducts = applyFilters(products);
  const productsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Resetar para página 1 quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategories, selectedBrands, maxPrice, sortBy]);

  // Função para gerar números de página a exibir
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Número máximo de páginas visíveis
    
    if (totalPages <= maxVisible) {
      // Se temos poucas páginas, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Sempre mostra primeira página
      pages.push(1);
      
      if (currentPage <= 4) {
        // Perto do início
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Perto do fim
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // No meio
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="container mx-auto flex flex-1 flex-col px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar Filters */}
        <aside className="col-span-1 lg:col-span-1">
          <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-6 text-gray-900">Filtros</h3>
            
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary-dark/50 focus:border-primary-dark transition text-sm"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            </div>

            <div className="flex flex-col space-y-2">
              <details className="group transition-all duration-300 ease-in-out border-b border-gray-100" open>
                <summary className="flex cursor-pointer items-center justify-between gap-6 py-4 list-none">
                  <p className="font-semibold text-gray-800">Categorias</p>
                  <span className="material-symbols-outlined text-xl transition-transform duration-300 group-open:rotate-180">expand_more</span>
                </summary>
                <div className="overflow-hidden pb-4">
                  <div className="flex flex-col gap-3">
                    {["Chás", "Suplementos", "Cuidados com a pele"].map((cat) => (
                      <label
                        key={cat}
                        className="flex items-center gap-3 text-sm font-normal text-gray-600 hover:text-primary-dark cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => toggleCategory(cat)}
                          className="h-4 w-4 rounded border-gray-300 text-primary-dark focus:ring-primary-dark/50 bg-white"
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>
              </details>

              <details className="group transition-all duration-300 ease-in-out border-b border-gray-100">
                <summary className="flex cursor-pointer items-center justify-between gap-6 py-4 list-none">
                  <p className="font-semibold text-gray-800">Marcas</p>
                  <span className="material-symbols-outlined text-xl transition-transform duration-300 group-open:rotate-180">expand_more</span>
                </summary>
                 <div className="overflow-hidden pb-4">
                  <div className="flex flex-col gap-3">
                    {["Naturalis", "Terra Viva", "Organico"].map((brand) => (
                      <label
                        key={brand}
                        className="flex items-center gap-3 text-sm font-normal text-gray-600 hover:text-primary-dark cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="h-4 w-4 rounded border-gray-300 text-primary-dark focus:ring-primary-dark/50 bg-white"
                        />
                        {brand}
                      </label>
                    ))}
                  </div>
                </div>
              </details>
            </div>

            <div className="pt-6 mt-4">
              <p className="font-semibold mb-4 text-gray-800">Faixa de Preço</p>
              <div className="flex h-[38px] w-full items-center">
                 <input
                   type="range"
                   min={0}
                   max={200}
                   step={5}
                   value={maxPrice}
                   onChange={(e) => setMaxPrice(Number(e.target.value))}
                   className="w-full accent-neon"
                 />
             </div>
             <div className="flex justify-between text-sm text-gray-500 mt-2">
               <span>R$ 0</span>
               <span>Máx: R$ {maxPrice.toFixed(2).replace('.', ',')}</span>
             </div>
             <div className="w-24 h-1 bg-neon mt-4 rounded-full"></div>
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <section className="col-span-1 lg:col-span-3">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-gray-900">Nossos Produtos</h1>
            <p className="text-gray-500 mt-1">Descubra nossa seleção de produtos naturais.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as 'relevance' | 'priceAsc' | 'priceDesc'
                )
              }
              className="rounded-lg border-gray-200 bg-white focus:ring-neon/50 focus:border-neon text-sm font-semibold pr-8 py-2"
            >
              <option value="relevance">Relevância</option>
              <option value="priceAsc">Menor Preço</option>
              <option value="priceDesc">Maior Preço</option>
            </select>
          </div>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {loading && <p className="text-gray-500 text-sm">Carregando produtos...</p>}
          {!loading && currentProducts.length === 0 && (
            <p className="text-gray-500 text-sm">Nenhum produto encontrado.</p>
          )}
          {currentProducts.map((product) => {
            const isAdded = justAddedId === product.id;
            return (
            <div key={product.id} className="group flex w-72 flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-neon/10 hover:-translate-y-2">
              <Link 
                to={`/product/${product.id}`} 
                state={{ product }}
                className="relative w-full aspect-square overflow-hidden block"
              >
                <div className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url("${product.image}")` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-6">
                  <p className="text-white text-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{product.category}</p>
                </div>
              </Link>
              <div className="flex flex-col flex-1 justify-between p-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{product.name}</h3>
                  <p className="text-neon text-lg font-bold mt-2">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  className={`mt-6 w-full rounded-full py-3 text-sm font-bold transition-all duration-300 ${
                    isAdded 
                      ? 'bg-neon text-[#132210] scale-95' 
                      : 'bg-neon/20 text-primary-dark hover:bg-neon hover:text-[#132210]'
                  }`}
                >
                  {isAdded ? '✓ Adicionado!' : 'Adicionar ao Carrinho'}
                </button>
              </div>
            </div>
          )})}
        </div>

        {/* Paginação com numeração */}
        {totalPages > 1 && (
          <nav className="mt-12 flex flex-col items-center justify-center gap-4">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {/* Botão Primeira Página */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Primeira página"
              >
                <span className="material-symbols-outlined text-lg">first_page</span>
              </button>
              
              {/* Botão Página Anterior */}
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Página anterior"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>

              {/* Números de Página */}
              {getPageNumbers().map((page, index) => {
                if (page === '...') {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="flex h-10 w-10 items-center justify-center text-gray-500"
                    >
                      ...
                    </span>
                  );
                }
                
                const pageNum = page as number;
                const isActive = pageNum === currentPage;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-all ${
                      isActive
                        ? 'bg-neon text-white border-neon font-bold shadow-md scale-110'
                        : 'border-gray-300 text-gray-700 hover:bg-neon/10 hover:border-neon'
                    }`}
                    aria-label={`Ir para página ${pageNum}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Botão Próxima Página */}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Próxima página"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
              
              {/* Botão Última Página */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Última página"
              >
                <span className="material-symbols-outlined text-lg">last_page</span>
              </button>
            </div>
            
            {/* Informação de produtos exibidos */}
            <div className="text-sm text-gray-600">
              Mostrando {indexOfFirstProduct + 1} - {Math.min(indexOfLastProduct, filteredProducts.length)} de {filteredProducts.length} produtos
              {totalPages > 1 && (
                <span className="ml-2">(Página {currentPage} de {totalPages})</span>
              )}
            </div>
          </nav>
        )}
      </section>
    </div>
  </div>
  );
};

export default Products;