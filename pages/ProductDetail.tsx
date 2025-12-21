import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { CartItem } from '../App';

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
  variacoes?: Variacao[] | null;
  gramas?: string | null;
};

type Review = {
  id: string;
  user_id: string;
  nota: number;
  comentario: string | null;
  created_at: string;
};

const imageByProdutoId: Record<string, string> = {
  '1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFqfRvPlxLtpJf3q4Q_4nbSx9qYYKC9Bfpfo-t-Y1C-StMKE3C3oK_IY7xW1PP0lAXxi0_S8chw44Ou7mr7yPHZC8fDbbfqPBbcZcDWnlHDvUnZyS39-3wbxBRqOCHy14AaDbuzyPnpVdi2njwgMOIPpKgQ2cq0yvLv4fFODzpBJNDI0mnX3M8TmxPSHmrBp2J-yy4IhbCUFXSaZ6hdckt7U3SMv3TiYPh6vEFdECsX-hBbd_N1jiZMscPs3KpNlMgpltxB6oPwalh',
  '2': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxNsEreXnXH8j-ImeOC6ICXbB_X7sfhJRf065-7sQMyvN4qH06X119y_pOp5s36RV9VzHUrSy9Wl1RcAc4CX2kFIjPCDde-NoPVORgGBs47gUjD5horwh9ibWB0S-i6jF2MAvgNaWut5DuU72VdNU_P2R2qDhDIrJZzs3qqOtwgLZyag_KtIU3tUqBi4Ubnt5EnZP3zOlD0TwZHJ0K1bFlC7wzMWp0nHJ-o4VSeo2WbwoNsTgzb8z-1hf-SKMfFh99GyxBOWV3AQjJ',
  '3': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDq72sQ_WEOQMb5_Va4aBzY3qU5b5n3_0ubUlrY-dp4rJgUnfzpLHwgUnieFBsEqC23x6OygckLCVgweooL9ERt2u8yOXxt7B5FmDzIBnvq5FrGbXQuLNGVN03KC_zfq1krM2vOsXvXHxoeKSe1CwmF8MmfDHxGFqY2arSrj4MYJfaft5k2gIHxPKqZGtxT-hYGwCO-_VlRKf_ZdrPztUs_Dn_w8aHEEL02vT4av2whHYO0j959ShQr5wvSCwIVh8zxM11wBQS9bNsm',
  '4': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaP2m-SaJsgUjIbxWkJJ652kt6IMD6zcY9we8UjPOnIjSbQjypq4KVqAZx1clfdqSNVd6kZGT7oxP-_bqMxQx-vxyKKH8dipEpjqmIEOCw0na5K4DcFW2tnh14l_pCncULEJzahq-Cn5bidDs1ijsMMhB1tY7pNxxkRP7ssPAkl3Lf0i7h87Ns1U-Kv8cqhvoBBdVlYSYwti6uDnGhrgLf_UVl5Hoz00lfceFanj0jCvjgWffzid3oelQnFTMUwlMguusrisqjqDME',
  '5': 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5Q0DyOA_ZKfVSjXgO6wSSuoVJZldfRGuRtfRC1G9geNNjfgmnkEGAliv8T9ob540g-rOICXKGZvCMjR-Gm-PcFLOl--9JZyYFdL-Hj-nanBzP2KSQupoS4mbKH8YtjHXYeDeQsdp8OCG5oavrNUlMm9ytPTB4935pgPVjcwva8wzEEeog5CqiDwu_8V91Hch3NjqRJ0YH9bMzJiH7xi58lBCipIVogkQu1HD4_EEiDxm46p9HSlcXxmfbfUFRyGU4crxguGE5uE6m'
};

type ProductDetailProps = {
  addToCart: (item: CartItem) => void;
};

const ProductDetail: React.FC<ProductDetailProps> = ({ addToCart }) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  
  // Tentar iniciar com dados passados pela navegação para carregamento instantâneo
  const initialProduct = location.state?.product as UIProduct | undefined;
  // Só usa o inicial se o ID bater (segurança)
  const hasInitialData = initialProduct && initialProduct.id === id;

  const [product, setProduct] = useState<UIProduct | null>(hasInitialData ? initialProduct : null);
  const [relatedProducts, setRelatedProducts] = useState<UIProduct[]>([]);
  const [loading, setLoading] = useState(!hasInitialData);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [selectedVariacao, setSelectedVariacao] = useState<Variacao | null>(null);

  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [myRating, setMyRating] = useState<number>(0);
  const [myComment, setMyComment] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Se mudou de ID e não temos dados iniciais desse novo ID, reseta e mostra loading
    if (!hasInitialData) {
      setProduct(null);
      setLoading(true);
    } else {
      // Se temos dados iniciais, garante que o loading esteja false
      setLoading(false);
      setProduct(initialProduct);
    }
    
    setQuantity(1);
    setSelectedImage(0);
    setSelectedVariacao(null);

    const load = async () => {
      if (!id) return;

      // Se NÃO temos dados iniciais, buscamos do banco
      if (!hasInitialData) {
        const { data, error } = await supabase
          .from('produtos')
          .select('id, produto_id, produto_nome, preco, status, imagens, variacoes, gramas')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Erro ao carregar produto:', error);
          setLoading(false);
          return;
        }

        if (data) {
          const produtoId = (data.produto_id || '').toString();
          const image = (data.imagens && data.imagens.length > 0) 
            ? data.imagens[0] 
            : (imageByProdutoId[produtoId] ?? imageByProdutoId['1']);
          setProduct({
            id: data.id,
            produtoId,
            name: data.produto_nome,
            price: data.preco,
            image,
            variacoes: data.variacoes,
            gramas: (data as any).gramas,
          });
        }
      }

      // Sempre carregamos os relacionados em background
      const { data: relatedData } = await supabase
        .from('produtos')
        .select('id, produto_id, produto_nome, preco, status')
        .neq('id', id)
        .limit(4);

      if (relatedData) {
        const mapped = relatedData
          .filter((p) => p.produto_nome && p.preco != null)
          .map((p) => {
            const produtoId = (p.produto_id || '').toString();
            const image = imageByProdutoId[produtoId] ?? imageByProdutoId['1'];
            return {
              id: p.id,
              produtoId,
              name: p.produto_nome as string,
              price: p.preco as number,
              image,
            };
          });
        setRelatedProducts(mapped);
      }
      
      // Garante que loading termina
      setLoading(false);
    };

    load();
  }, [id, hasInitialData]); // Re-executa se o ID mudar ou se a disponibilidade de dados iniciais mudar

  useEffect(() => {
    const loadReviews = async () => {
      if (!id) return;

      setReviewError('');

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('avaliacoes_produto')
        .select('id, user_id, nota, comentario, created_at')
        .eq('produto_id', id)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.error('Erro ao carregar avaliações:', reviewsError);
        const raw = (reviewsError as any)?.message || '';
        const msgLower = String(raw).toLowerCase();
        if (msgLower.includes('does not exist') || msgLower.includes('relation') || msgLower.includes('42p01')) {
          setReviewError('Tabela de avaliações não existe no Supabase. Rode o arquivo supabase_avaliacoes.sql no Supabase (SQL Editor) e recarregue a página.');
        } else if (msgLower.includes('column') || msgLower.includes('42703')) {
          setReviewError('Estrutura da tabela de avaliações está diferente do esperado. Confirme que existe a coluna "nota" (int) e recarregue a página.');
        } else if (msgLower.includes('permission') || msgLower.includes('rls') || msgLower.includes('not allowed')) {
          setReviewError('Sem permissão para ler avaliações (RLS). Verifique as policies da tabela avaliacoes_produto.');
        } else {
          setReviewError('Erro ao carregar avaliações.');
        }
        setReviews([]);
        setAvgRating(0);
        return;
      }

      const list = (reviewsData as unknown as Review[]) || [];
      setReviews(list);

      const avg = list.length ? list.reduce((sum, r) => sum + (r.nota || 0), 0) / list.length : 0;
      setAvgRating(avg);
    };

    loadReviews();
  }, [id]);

  useEffect(() => {
    const loadMyReview = async () => {
      if (!id || !user?.id) return;

      const { data, error } = await supabase
        .from('avaliacoes_produto')
        .select('nota, comentario')
        .eq('produto_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setMyRating((data as any).nota || 0);
        setMyComment(data.comentario || '');
      }
    };

    loadMyReview();
  }, [id, user?.id]);

  const submitReview = async () => {
    if (!id) return;
    if (!user?.id) {
      setReviewError('Faça login para avaliar.');
      return;
    }
    if (!myRating || myRating < 1 || myRating > 5) {
      setReviewError('Selecione uma nota de 1 a 5.');
      return;
    }

    setSavingReview(true);
    setReviewError('');

    const { error } = await supabase
      .from('avaliacoes_produto')
      .upsert(
        {
          produto_id: id,
          user_id: user.id,
          nota: myRating,
          comentario: myComment?.trim() ? myComment.trim() : null,
        },
        { onConflict: 'produto_id,user_id' }
      );

    if (error) {
      console.error('Erro ao salvar avaliação:', error);
      const raw = (error as any)?.message || '';
      const msgLower = String(raw).toLowerCase();
      if (msgLower.includes('does not exist') || msgLower.includes('relation') || msgLower.includes('42p01')) {
        setReviewError('Tabela de avaliações não existe no Supabase. Rode o arquivo supabase_avaliacoes.sql no Supabase (SQL Editor) e recarregue a página.');
      } else if (msgLower.includes('column') || msgLower.includes('42703')) {
        setReviewError('Estrutura da tabela de avaliações está diferente do esperado. Confirme que existe a coluna "nota" (int).');
      } else if (msgLower.includes('permission') || msgLower.includes('rls') || msgLower.includes('not allowed')) {
        setReviewError('Sem permissão para salvar avaliações (RLS). Verifique as policies da tabela avaliacoes_produto.');
      } else {
        setReviewError('Não foi possível salvar sua avaliação.');
      }
      setSavingReview(false);
      return;
    }

    setSavingReview(false);

    const { data: reviewsData } = await supabase
      .from('avaliacoes_produto')
      .select('id, user_id, nota, comentario, created_at')
      .eq('produto_id', id)
      .order('created_at', { ascending: false });

    const list = (reviewsData as unknown as Review[]) || [];
    setReviews(list);
    const avg = list.length ? list.reduce((sum, r) => sum + (r.nota || 0), 0) / list.length : 0;
    setAvgRating(avg);
  };

  const handleAddToCart = () => {
    if (!product) return;

    const effectiveVariacoes: Variacao[] | null =
      product.variacoes && product.variacoes.length > 0
        ? product.variacoes
        : product.gramas
          ? [{ gramas: product.gramas, preco: product.price }]
          : null;
    
    // Se tem variações, precisa selecionar uma
    if (effectiveVariacoes && effectiveVariacoes.length > 0 && !selectedVariacao) {
      alert('Por favor, selecione o peso do produto antes de adicionar ao carrinho.');
      return;
    }
    
    const finalPrice = selectedVariacao ? selectedVariacao.preco : product.price;
    const finalName = selectedVariacao ? `${product.name} - ${selectedVariacao.gramas}` : product.name;
    
    const item: CartItem = {
      id: selectedVariacao ? `${product.id}-${selectedVariacao.gramas}` : product.id,
      name: finalName,
      price: finalPrice,
      image: product.image,
      qty: quantity,
    };
    addToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQty = () => setQuantity((q) => q + 1);

  // Imagem principal do produto
  const mainImage = product?.image;

  if (loading) {
    return (
      <div className="bg-background-light min-h-screen font-display text-text-light-bg">
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8 max-w-[1200px]">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
                <div className="aspect-[4/3] w-full rounded-xl bg-gray-200"></div>
                <div className="flex flex-col gap-6 pt-4">
                  <div className="h-12 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-24 bg-gray-200 rounded w-full"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-12 bg-gray-200 rounded w-full mt-4"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background-light min-h-screen font-display text-text-light-bg">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-[1200px]">
          {/* Breadcrumb */}
          <div className="flex flex-wrap gap-2 pb-8">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-neon">Início</Link>
            <span className="text-sm font-medium text-gray-600">/</span>
            <Link to="/products" className="text-sm font-medium text-gray-600 hover:text-neon">Produtos</Link>
            <span className="text-sm font-medium text-gray-600">/</span>
            <span className="text-sm font-medium text-text-light-bg">
              {product ? product.name : loading ? 'Carregando...' : 'Produto não encontrado'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
            {/* Imagem do Produto */}
            <div className="grid grid-cols-1 gap-4">
              <div className="aspect-[4/3] w-full rounded-xl bg-[#e9f3e7]">
                <div
                  className="w-full h-full bg-center bg-no-repeat bg-cover rounded-xl"
                  style={{ backgroundImage: `url("${mainImage || ''}")` }}
                />
              </div>

              {product && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Avaliações</h3>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`material-symbols-outlined text-lg ${i < Math.round(avgRating) ? 'text-yellow-500' : 'text-gray-300'}`}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      {avgRating ? avgRating.toFixed(1).replace('.', ',') : '0,0'} ({reviews.length})
                    </div>
                  </div>

                  {reviewError && (
                    <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {reviewError}
                    </div>
                  )}

                  {user ? (
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-900 mb-3">Sua avaliação</div>
                      <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const val = i + 1;
                          const active = val <= myRating;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setMyRating(val)}
                              className={`p-1 ${active ? 'text-yellow-500' : 'text-gray-300'}`}
                              aria-label={`Nota ${val}`}
                            >
                              <span className="material-symbols-outlined">star</span>
                            </button>
                          );
                        })}
                      </div>
                      <textarea
                        value={myComment}
                        onChange={(e) => setMyComment(e.target.value)}
                        className="w-full min-h-[96px] px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-neon/50 focus:border-neon"
                        placeholder="Escreva um comentário (opcional)"
                      />
                      <button
                        type="button"
                        onClick={submitReview}
                        disabled={savingReview}
                        className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-neon text-[#132210] font-bold disabled:opacity-50"
                      >
                        {savingReview ? 'Salvando...' : 'Salvar avaliação'}
                      </button>
                    </div>
                  ) : (
                    <div className="mb-4 text-sm text-gray-600">
                      Faça login para avaliar este produto.
                    </div>
                  )}

                  <div className="space-y-3">
                    {reviews.length === 0 ? (
                      <div className="text-sm text-gray-600">Nenhuma avaliação ainda.</div>
                    ) : (
                      reviews.map((r) => (
                        <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-gray-900 truncate">Cliente</div>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span
                                  key={i}
                                  className={`material-symbols-outlined text-base ${i < r.nota ? 'text-yellow-500' : 'text-gray-300'}`}
                                >
                                  star
                                </span>
                              ))}
                            </div>
                          </div>
                          {r.comentario && (
                            <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{r.comentario}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Informações do Produto */}
            <div className="flex flex-col gap-6 pt-4">
              <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] lg:text-5xl text-gray-900">
                {product ? product.name : loading ? 'Carregando...' : 'Produto não encontrado'}
              </h1>
              
              {product && (
                <p className="text-base text-gray-700">
                  Relaxe e desfrute de um momento de tranquilidade com nosso produto natural. Selecionado com cuidado para preservar suas propriedades e benefícios.
                </p>
              )}

              {product && ((product.variacoes && product.variacoes.length > 0) || !!product.gramas) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecione o peso <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(
                      product.variacoes && product.variacoes.length > 0
                        ? product.variacoes
                        : product.gramas
                          ? [{ gramas: product.gramas, preco: product.price }]
                          : []
                    ).map((variacao, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedVariacao(variacao)}
                        className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${
                          selectedVariacao?.gramas === variacao.gramas
                            ? 'border-neon bg-neon text-[#132210]'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-neon'
                        }`}
                      >
                        {variacao.gramas} - R$ {variacao.preco.toFixed(2).replace('.', ',')}
                      </button>
                    ))}
                  </div>
                  {!selectedVariacao && (
                    <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">warning</span>
                      Selecione um peso para adicionar ao carrinho
                    </p>
                  )}
                </div>
              )}

              {product && (
                <p className="text-4xl font-bold text-gray-900">
                  R$ {(selectedVariacao ? selectedVariacao.preco : product.price).toFixed(2).replace('.', ',')}
                </p>
              )}

              {/* Quantidade e Botão */}
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-lg border border-[#e9f3e7]">
                  <button
                    onClick={decreaseQty}
                    className="px-3 py-2 text-lg font-medium hover:bg-[#e9f3e7] rounded-l-md"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="w-12 text-center border-x border-y-0 border-[#e9f3e7] bg-transparent focus:ring-0 focus:outline-none"
                  />
                  <button
                    onClick={increaseQty}
                    className="px-3 py-2 text-lg font-medium hover:bg-[#e9f3e7] rounded-r-md"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-neon text-[#101b0d] text-base font-bold tracking-wide shadow-lg shadow-neon/30 hover:bg-neon/90 transition-all duration-300"
                >
                  {added ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}>check_circle</span>
                      <span>Adicionado!</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <span className="material-symbols-outlined">shopping_cart</span>
                      <span>Adicionar ao Carrinho</span>
                    </span>
                  )}
                </button>
              </div>

              {/* Acordeões */}
              <div className="flex flex-col gap-4 pt-6">
                <details className="group border-b border-[#e9f3e7]" open>
                  <summary className="flex cursor-pointer list-none items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-neon">description</span>
                      <h3 className="text-lg font-bold">Descrição Completa</h3>
                    </div>
                    <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
                  </summary>
                  <div className="pb-4 text-gray-700 space-y-4 pl-9">
                    <p>Nosso produto é a escolha perfeita para quem busca qualidade natural. Conhecido por suas propriedades benéficas, ajuda a promover bem-estar e saúde. É também um excelente aliado no dia a dia.</p>
                    <p><strong>Modo de Uso:</strong> Siga as instruções na embalagem para melhores resultados.</p>
                  </div>
                </details>

                <details className="group border-b border-[#e9f3e7]">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-neon">eco</span>
                      <h3 className="text-lg font-bold">Ingredientes</h3>
                    </div>
                    <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
                  </summary>
                  <div className="pb-4 text-gray-700 pl-9">
                    <p>100% ingredientes naturais e orgânicos. Sem aditivos, conservantes ou aromas artificiais. Cultivado de forma sustentável.</p>
                  </div>
                </details>

                <details className="group border-b border-[#e9f3e7]">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-neon">local_shipping</span>
                      <h3 className="text-lg font-bold">Informações de Envio</h3>
                    </div>
                    <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
                  </summary>
                  <div className="pb-4 text-gray-700 space-y-4 pl-9">
                    <p>Entregamos em todo o Brasil. O prazo de entrega e o valor do frete variam de acordo com a sua localidade. Calcule o frete na página do carrinho.</p>
                  </div>
                </details>
              </div>

            </div>
          </div>
        </div>

        {/* Produtos Relacionados */}
        {relatedProducts.length > 0 && (
          <div className="w-full mt-16 py-16 bg-background-light">
            <div className="container mx-auto px-4 max-w-[1200px]">
              <h2 className="text-3xl font-bold mb-8 text-center lg:text-4xl text-gray-900">Você também pode gostar</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {relatedProducts.map((item) => (
                  <Link to={`/product/${item.id}`} key={item.id} className="flex flex-col gap-3 group cursor-pointer">
                    <div className="overflow-hidden rounded-xl bg-[#e9f3e7]">
                      <div
                        className="w-full bg-center bg-no-repeat bg-cover aspect-square rounded-xl group-hover:scale-105 transition-transform duration-300"
                        style={{ backgroundImage: `url("${item.image}")` }}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                      <p className="font-semibold text-neon">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductDetail;