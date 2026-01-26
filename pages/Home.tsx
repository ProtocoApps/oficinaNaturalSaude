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
  imagens?: string[] | null;
  gramas?: string | null;
};

type Variacao = {
  gramas: string;
  preco: number;
};

type UIProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  desc: string;
  variacoes?: Variacao[] | null;
  gramas?: string | null;
};

type Video = {
  id: number;
  titulo: string;
  descricao: string;
  thumbnail_url: string;
  video_url: string;
};

const imageByProdutoId: Record<string, string> = {
  '1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFqfRvPlxLtpJf3q4Q_4nbSx9qYYKC9Bfpfo-t-Y1C-StMKE3C3oK_IY7xW1PP0lAXxi0_S8chw44Ou7mr7yPHZC8fDbbfqPBbcZcDWnlHDvUnZyS39-3wbxBRqOCHy14AaDbuzyPnpVdi2njwgMOIPpKgQ2cq0yvLv4fFODzpBJNDI0mnX3M8TmxPSHmrBp2J-yy4IhbCUFXSaZ6hdckt7U3SMv3TiYPh6vEFdECsX-hBbd_N1jiZMscPs3KpNlMgpltxB6oPwalh',
  '2': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxNsEreXnXH8j-ImeOC6ICXbB_X7sfhJRf065-7sQMyvN4qH06X119y_pOp5s36RV9VzHUrSy9Wl1RcAc4CX2kFIjPCDde-NoPVORgGBs47gUjD5horwh9ibWB0S-i6jF2MAvgNaWut5DuU72VdNU_P2R2qDhDIrJZzs3qqOtwgLZyag_KtIU3tUqBi4Ubnt5EnZP3zOlD0TwZHJ0K1bFlC7wzMWp0nHJ-o4VSeo2WbwoNsTgzb8z-1hf-SKMfFh99GyxBOWV3AQjJ',
  '3': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDq72sQ_WEOQMb5_Va4aBzY3qU5b5n3_0ubUlrY-dp4rJgUnfzpLHwgUnieFBsEqC23x6OygckLCVgweooL9ERt2u8yOXxt7B5FmDzIBnvq5FrGbXQuLNGVN03KC_zfq1krM2vOsXvXHxoeKSe1CwmF8MmfDHxGFqY2arSrj4MYJfaft5k2gIHxPKqZGtxT-hYGwCO-_VlRKf_ZdrPztUs_Dn_w8aHEEL02vT4av2whHYO0j959ShQr5wvSCwIVh8zxM11wBQS9bNsm',
  '4': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaP2m-SaJsgUjIbxWkJJ652kt6IMD6zcY9we8UjPOnIjSbQjypq4KVqAZx1clfdqSNVd6kZGT7oxP-_bqMxQx-vxyKKH8dipEpjqmIEOCw0na5K4DcFW2tnh14l_pCncULEJzahq-Cn5bidDs1ijsMMhB1tY7pNxxkRP7ssPAkl3Lf0i7h87Ns1U-Kv8cqhvoBBdVlYSYwti6uDnGhrgLf_UVl5Hoz00lfceFanj0jCvjgWffzid3oelQnFTMUwlMguusrisqjqDME',
  '5': 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5Q0DyOA_ZKfVSjXgO6wSSuoVJZldfRGuRtfRC1G9geNNjfgmnkEGAliv8T9ob540g-rOICXKGZvCMjR-Gm-PcFLOl--9JZyYFdL-Hj-nanBzP2KSQupoS4mbKH8YtjHXYeDeQsdp8OCG5oavrNUlMm9ytPTB4935pgPVjcwva8wzEEeog5CqiDwu_8V91Hch3NjqRJ0YH9bMzJiH7xi58lBCipIVogkQu1HD4_EEiDxm46p9HSlcXxmfbfUFRyGU4crxguGE5uE6m',
};

const instagramVideos = [
  {
    id: 1,
    titulo: "Benefícios dos Produtos Naturais",
    descricao: "Descubra como nossos produtos podem transformar sua saúde",
    thumbnail_url: "/1.png",
    video_url: "https://www.instagram.com/reel/DRK9KrckRt6/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
  },
  {
    id: 2,
    titulo: "Dicas de Uso - Óleos Essenciais",
    descricao: "Aprenda a usar nossos óleos da maneira correta",
    thumbnail_url: "/2.png",
    video_url: "https://www.instagram.com/p/DQ7ghqxkfa0/"
  },
  {
    id: 3,
    titulo: "Chá de Camomila - Relaxamento",
    descricao: "O poder calmante da camomila orgânica",
    thumbnail_url: "/3.png",
    video_url: "https://www.instagram.com/reel/DQpeKhuEaL2/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
  }
];

const testimonials = [
  {
    name: "Juliana S.",
    role: "Cliente Satisfeita",
    text: "Os produtos são incríveis! Qualidade excepcional e entrega super rápida. O chá de camomila é o meu favorito.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkO0sO6Dc_Fad5Mw9x0tcW676Qypw6RaKs37xEnXytMEb7IgKVzMjU9GTZZmbrt_MOz_9t1O1IbJuI2CcTPgOTAqYo9Q7oQJvJhOQgPaFpoCU1sE9SGMz18gzO_lvWzv6W57pFKwd8Ps9Md3nDO2TcpaIvE4xCj-4hduYb8JFP6ytTTNkP-wkGrYmTSSYLI-Ekohj-ihzet0A4L1KVsvxkJW1WsEj88YucXF7KHKrLWoenRbVOSxncyaj2TpCiHO4voLh_R09UFVVd",
    backText: "Qualidade excepcional!"
  },
  {
    name: "Marcos P.",
    role: "Cliente Fiel",
    text: "Finalmente encontrei um óleo essencial de melaleuca puro. Faz maravilhas pela minha pele. Recomendo a todos!",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuE62d6pIXGO01RY9aWYhTWcPjRNJrW13Vlx8hTCKB0fyh2OH8bhrPZLqaKzQ5x8LUeSYblvHzLfnNlJTqb5Vtj493FGqxpX8dexxcOYJFPDDLcmb1QGgrPYvFi6Fz7iOZ0dP12KNzbEOS4ifPVsRklgTYQZoD6qlwn-5lGMCdjnLA829LqflwxJySrvRjcKtgWoSnLREIJvQSxGy71-0M12k9FWm8ykRQh_BcXKzQX1cZmWxNUBVlOZ7qXC-fMBdGi6OI4H3QYN8Y",
    backText: "Faz maravilhas pela pele!"
  },
  {
    name: "Carla M.",
    role: "Cliente Verificada",
    text: "Amo a variedade e a confiança que a loja transmite. Tudo orgânico e de alta qualidade. Minha saúde agradece!",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOMqJvwQHu6eDoXOa-TvGTjYS73k8wSbcpT0NXZBcG8XudcJWc3tAa5pd1cqTW2APRQ7w1Sj6gLO3D4j23_iS8UJ9TlyLe3bJOs_Ztf3ev93vQjbYq0szts_17JhOX_N9vI2mNOT0nTj7MV--slwmiLCiLG4xMqAXn1DEKRFTNryFPlrFvTSVxSq5R-3Z6k7E5mUbdZYTsEYo9kC0p8xs53SIqrzneHEsk940ECuZkh7Q8hJDAdVd8ahKrUGHEzQ7oW7yoqIe410VX",
    backText: "Saúde em primeiro lugar!"
  }
];

type HomeProps = {
  addToCart: (item: CartItem) => void;
};

const Home: React.FC<HomeProps> = ({ addToCart }) => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<UIProduct[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const loadFeatured = async () => {
      // ... carregar produtos (código existente mantido abaixo)
      const { data, error } = await supabase
        .from('produtos')
        .select('id, produto_id, produto_nome, preco, status, imagens, variacoes, gramas')
        .limit(8);

      if (error) {
        console.error('Erro ao carregar produtos em destaque:', error);
        return;
      }

      const mapped: UIProduct[] = (data || [])
        .filter((p) => p.produto_nome && p.preco != null)
        .map((p) => {
          const produtoId = (p.produto_id || '').toString();
          const image = (p.imagens && p.imagens.length > 0) 
            ? p.imagens[0] 
            : (imageByProdutoId[produtoId] ?? imageByProdutoId['1']);
          return {
            id: p.id,
            name: p.produto_nome as string,
            price: p.preco as number,
            image,
            desc: 'Produto natural selecionado com cuidado para o seu bem-estar.',
            variacoes: (p as any).variacoes,
            gramas: (p as any).gramas,
          };
        });

      setFeaturedProducts(mapped);
    };

    const loadVideos = async () => {
      const { data, error } = await supabase
        .from('videos_home')
        .select('*')
        .order('id');
      
      if (!error && data) {
        setVideos(data);
      }
    };

    loadFeatured();
    loadVideos();
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
  };

  const handlePrev = () => {
    if (featuredProducts.length === 0) return;
    setCurrentIndex((prev) => {
      const newIndex = prev - 4;
      if (newIndex < 0) {
        const totalGroups = Math.ceil(featuredProducts.length / 4);
        return (totalGroups - 1) * 4;
      }
      return newIndex;
    });
  };

  const handleNext = () => {
    if (featuredProducts.length === 0) return;
    setCurrentIndex((prev) => {
      const newIndex = prev + 4;
      if (newIndex >= featuredProducts.length) {
        return 0;
      }
      return newIndex;
    });
  };

  const displayProducts = featuredProducts.slice(currentIndex, currentIndex + 4);
  const needsLoop = currentIndex + 4 > featuredProducts.length;
  const finalDisplay = needsLoop ? [...displayProducts, ...featuredProducts.slice(0, 4 - displayProducts.length)] : displayProducts;
  return (
    <>
      <section className="relative h-[calc(100vh-80px)] min-h-[600px] overflow-auto">
        <div className="absolute inset-0 z-0">
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage:
                'url("/home2.png")',
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark/60 via-background-dark/20 to-transparent"></div>
        </div>

        <div className="absolute inset-0 z-10 flex items-start justify-center pointer-events-none px-4 pt-10">
          <img
            src="/24.png"
            alt=""
            className="max-h-[55vh] w-auto max-w-[90vw] object-contain"
          />
        </div>

        <div className="relative z-20 flex h-full flex-col items-center justify-end text-center px-4 pb-20">
          <div className="flex gap-4 flex-col sm:flex-row">
            <Link
              to="/products"
              className="group relative flex min-w-[200px] items-center justify-center overflow-hidden rounded-full h-14 bg-neon text-[#132210] text-base font-bold tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-neon/40 hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center gap-2">Explorar Produtos</span>
            </Link>
            <Link
              to="/about"
              className="group relative flex min-w-[200px] items-center justify-center overflow-hidden rounded-full h-14 bg-white/20 backdrop-blur-sm text-white text-base font-bold tracking-wide transition-all duration-300 hover:bg-white/30 hover:scale-105 border border-white/20"
            >
              Nossa Filosofia
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background-light">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-gray-900">Produtos em Destaque</h2>
              <div className="w-24 h-1 bg-neon mt-4 rounded-full"></div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrev}
                disabled={featuredProducts.length <= 1}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-neon text-neon hover:bg-neon/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <button 
                onClick={handleNext}
                disabled={featuredProducts.length <= 1}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-neon text-neon hover:bg-neon/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex gap-8 transition-transform duration-500 ease-in-out">
              {finalDisplay.map((product, index) => (
                <div key={`${product.id}-${index}`} className="w-72 flex-shrink-0 group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-neon/10 hover:-translate-y-2">
                  <Link 
                    to={`/product/${product.id}`} 
                    state={{ product }}
                    className="relative w-full aspect-square overflow-hidden block"
                  >
                    <div className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url("${product.image}")` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-6">
                      <p className="text-white text-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{product.desc}</p>
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
                      className="mt-6 w-full rounded-full bg-neon/20 py-3 text-sm font-bold text-primary-dark transition-all duration-300 hover:bg-neon hover:text-[#132210]"
                    >
                      Adicionar ao Carrinho
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background-light">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-gray-900">Veja a Magia Acontecer</h2>
            <p className="mt-4 max-w-2xl mx-auto text-gray-600">Descubra os segredos dos nossos produtos, dicas de uso e histórias inspiradoras.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {instagramVideos.map((video, index) => (
              <div 
                key={video.id} 
                className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-lg border-2 border-green-500 hover:border-green-400 transition-all duration-300"
                onClick={() => video.video_url && window.open(video.video_url, '_blank')}
              >
                <div className="aspect-[4/5] w-full bg-gray-200">
                  <div 
                    className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                    style={{ backgroundImage: `url("${video.thumbnail_url}")` }}
                  ></div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-neon">
                     <span className="material-symbols-outlined text-4xl text-white filled-icon">play_arrow</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                     <h3 className="font-bold text-white text-lg">{video.titulo}</h3>
                     {video.descricao && (
                       <p className="text-white/80 mt-2 line-clamp-2">{video.descricao}</p>
                     )}
                    <div className="flex items-center gap-2 mt-3">
                      <svg className="h-5 w-5 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
                      </svg>
                      <span className="text-white/80 text-sm">Instagram</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-neon/5">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
          <h2 className="text-center text-3xl md:text-4xl font-bold tracking-tighter mb-16 text-gray-900">Confiança que floresce a cada dia</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="group h-80 [perspective:1000px] cursor-pointer">
                <div className="relative h-full w-full rounded-2xl bg-white shadow-lg transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  {/* Front */}
                  <div className="absolute inset-0 h-full w-full flex flex-col items-center justify-center p-8 text-center [backface-visibility:hidden]">
                    <img alt={t.name} className="h-20 w-20 rounded-full object-cover mb-6 border-2 border-neon" src={t.img} />
                    <p className="italic text-gray-600 text-sm leading-relaxed mb-6">"{t.text}"</p>
                    <div>
                      <p className="font-bold text-gray-900">{t.name}</p>
                      <p className="text-xs font-bold text-neon uppercase tracking-wider mt-1">{t.role}</p>
                    </div>
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 h-full w-full rounded-2xl bg-neon flex flex-col items-center justify-center p-8 text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <span className="material-symbols-outlined text-5xl text-[#132210] mb-4">verified</span>
                    <p className="font-bold text-xl text-[#132210]">{t.backText}</p>
                    <p className="text-sm text-[#132210]/80 mt-2 font-medium">Avaliação 5 Estrelas</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-background-light">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            <Link to="/seguranca" className="group flex items-center gap-4 rounded-2xl bg-white shadow-sm border border-neon/20 px-6 py-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-neon/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neon/10 text-neon transition-transform duration-300 group-hover:scale-110 group-hover:bg-neon/20">
                <span className="material-symbols-outlined text-3xl">verified_user</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">Compra Segura</p>
                <p className="text-sm text-gray-600">Site protegido com segurança SSL.</p>
              </div>
            </Link>

            <div className="group flex items-center gap-4 rounded-2xl bg-white shadow-sm border border-neon/20 px-6 py-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-neon/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neon/10 text-neon transition-transform duration-300 group-hover:scale-110 group-hover:bg-neon/20">
                <span className="material-symbols-outlined text-3xl">headset_mic</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">Atendimento</p>
                <p className="text-sm text-gray-600">Tire suas dúvidas com nossa equipe.</p>
                <a
                  href="https://wa.me/554734653209"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-neon hover:underline"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Fale Conosco
                </a>
              </div>
            </div>

            <div className="group flex items-center gap-4 rounded-2xl bg-white shadow-sm border border-neon/20 px-6 py-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-neon/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neon/10 text-neon transition-transform duration-300 group-hover:scale-110 group-hover:bg-neon/20">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-8 w-8"
                    aria-hidden="true"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
                  </svg>
              </div>
              <div>
                <p className="font-bold text-gray-900">Siga Nossas Dicas</p>
                <p className="text-sm text-gray-600">Conteúdo exclusivo e promoções!</p>
                <a
                  href="https://www.instagram.com/oficinadasaudenatural/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-neon hover:underline"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9A3.5 3.5 0 0 0 20 16.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm11 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                  </svg>
                  Visite nosso Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;