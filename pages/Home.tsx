import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { CartItem } from '../App';

type DbProduto = {
  id: string;
  produto_id: string | null;
  produto_nome: string | null;
  preco: number | null;
  status: string | null;
};

type UIProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  desc: string;
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
  const [featuredProducts, setFeaturedProducts] = useState<UIProduct[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const loadFeatured = async () => {
      // ... carregar produtos (código existente mantido abaixo)
      const { data, error } = await supabase
        .from('produtos')
        .select('id, produto_id, produto_nome, preco, status')
        .limit(8);

      if (error) {
        console.error('Erro ao carregar produtos em destaque:', error);
        return;
      }

      const mapped: UIProduct[] = (data || [])
        .filter((p) => p.produto_nome && p.preco != null)
        .map((p) => {
          const produtoId = (p.produto_id || '').toString();
          const image = imageByProdutoId[produtoId] ?? imageByProdutoId['1'];
          return {
            id: p.id,
            name: p.produto_nome as string,
            price: p.preco as number,
            image,
            desc: 'Produto natural selecionado com cuidado para o seu bem-estar.',
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
      <section className="relative h-[calc(100vh-80px)] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage:
                'url("https://images.pexels.com/photos/2384574/pexels-photo-2384574.jpeg?auto=compress&cs=tinysrgb&w=1600")',
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-background-dark/30 to-transparent"></div>
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
          <div className="max-w-4xl mb-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter animate-typing overflow-hidden border-r-4 border-neon whitespace-nowrap mx-auto">
              O Futuro do Bem-Estar
            </h1>
          </div>
          <p className="text-lg md:text-xl mb-10 max-w-2xl text-white/90">
            Descubra a pureza e a potência dos nossos ingredientes orgânicos. Sinta a diferença.
          </p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {videos.length > 0 ? (
              videos.map((video, index) => (
                <div 
                  key={video.id} 
                  className={`group relative cursor-pointer overflow-hidden rounded-2xl shadow-lg ${index === 0 ? 'md:col-span-2' : ''}`}
                  onClick={() => video.video_url && window.open(video.video_url, '_blank')}
                >
                  <div className={`w-full bg-gray-200 ${index === 0 ? 'aspect-[16/9]' : 'aspect-video'}`}>
                    <div 
                      className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                      style={{ backgroundImage: `url("${video.thumbnail_url}")` }}
                    ></div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                    <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-neon">
                       <span className="material-symbols-outlined text-4xl md:text-5xl text-white filled-icon">play_arrow</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 md:p-8">
                       <h3 className={`font-bold text-white ${index === 0 ? 'text-2xl' : 'text-lg'}`}>{video.titulo}</h3>
                       {video.descricao && (
                         <p className="text-white/80 mt-2 line-clamp-2">{video.descricao}</p>
                       )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Fallback para vídeos estáticos se não houver vídeos no banco
              <>
                <div className="group relative md:col-span-2 cursor-pointer overflow-hidden rounded-2xl shadow-lg">
                  <div className="aspect-[16/9] w-full bg-gray-200">
                    <div className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDeUpja2snSXAtl8FLLEwLK5sHuocRoUwMYwtXVzcQTvEE4Ns2gAknDyGiMjqlhZj4_PHkySKHu9HWtgdHLczxwrmxHY1r49qFBtZAHVeHWMf2HyuhWZu1im3bBhO2_nvb7CDRclX-d-bISFgqiThus0rsCZSt3o5-F2kCnx0a7UUp8mOoVBkQLVxdNxFiQpKX9xkf5j08gnE3aFIhdiQKgcQFSMkiOd_IcNUZrlHBVtWYsbpXA1-zkxB8CHOWRKTqRpy6-7ZXxNOTS")' }}></div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-neon">
                       <span className="material-symbols-outlined text-5xl text-white filled-icon">play_arrow</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8">
                       <h3 className="text-2xl font-bold text-white">Tutorial: Sérum Facial Revitalizante</h3>
                       <p className="text-white/80 mt-2">Aprenda a aplicar nosso best-seller para resultados máximos.</p>
                    </div>
                  </div>
                </div>

                <div className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-lg">
                   <div className="aspect-video w-full bg-gray-200 dark:bg-gray-800">
                     <div className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB_maaKqTmNDL3XpKNRnWqLfgenVUE_F6zgZLnmXSek9hIMJTUTNecZCHOYLNGyOSdSalL-_S0RSe9wXG6h5rQn8BWNDKGxGN8wKnaRje-A9rFJnCovRF1HzqPTbzsxlIxr2Hn6o_iof4xPIRq8s7NxM7MXgP4lanfa_8z3qW27ZdHfRBWeLTGzt4HtrfeU56mMyzMwJI28uhDlf4kk8lB-tfgbemjRZf4ctpfQjQqliiThpKQUP4tH1CPZ7MnIgHK3n5mY0pOfLOI4")' }}></div>
                   </div>
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-neon">
                         <span className="material-symbols-outlined text-4xl text-white filled-icon">play_arrow</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                         <h3 className="text-lg font-bold text-white">Depoimento: Minha Pele Transformada</h3>
                      </div>
                   </div>
                </div>

                <div className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-lg">
                   <div className="aspect-video w-full bg-gray-200 dark:bg-gray-800">
                     <div className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBZczBJYBKjnLFE2J_zJxJRy9fox7fMel8OCrWPB7Un_a0jb6HlTlbTBFf_bKJFx42Mlk5z13y4G_y5RvGf5dpoiEV9sk2niQTACcUvF4_1026PP4BEkvAvxvxU7oHTFMZ5v4z_O9V13jjrcMDEU2ZnZuqptlCOTxQClEndX6C4TwjImRkE14S7b5HMkSMLaRNpKlbEJDp8JVYZuSS51mEwxaaA0QShZzE8VGAytBbNtz50T_tg6DqLh80e1I9aRcaULqsslSTVhHoi")' }}></div>
                   </div>
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-neon">
                         <span className="material-symbols-outlined text-4xl text-white filled-icon">play_arrow</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                         <h3 className="text-lg font-bold text-white">A Origem do Nosso Chá de Camomila</h3>
                      </div>
                   </div>
                </div>
              </>
            )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;