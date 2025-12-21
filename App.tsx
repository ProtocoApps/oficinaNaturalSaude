import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Link, useNavigate, Outlet } from 'react-router-dom';
import { supabase } from './supabaseClient';
import LoginModal from './components/LoginModal';
import Toast from './components/Toast';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Security from './pages/Security';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import PaymentPending from './pages/PaymentPending';

// Admin imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProdutos from './pages/admin/AdminProdutos';
import AdminPedidos from './pages/admin/AdminPedidos';
import AdminClientes from './pages/admin/AdminClientes';
import AdminCategorias from './pages/admin/AdminCategorias';
import AdminVideos from './pages/admin/AdminVideos';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

type HeaderProps = {
  cartCount?: number;
  user?: any;
  onLoginClick?: () => void;
  onLogout?: () => void;
};

const Header: React.FC<HeaderProps> = ({ cartCount = 0, user, onLoginClick, onLogout }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  // Dynamic header styles based on page to match the screenshots
  const headerBg = isHome ? "bg-white/95 backdrop-blur-lg shadow-lg" : "bg-white/95 backdrop-blur-lg shadow-lg";
  const textColor = isHome ? "text-gray-900" : "text-gray-900";
  
  return (
    <header className={`sticky top-0 z-50 ${headerBg} transition-all duration-300 border-b border-gray-100/50`}>
      <div className="mx-auto flex max-w-[1400px] items-center justify-between whitespace-nowrap px-4 sm:px-8 py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/WhatsApp_Image_2025-12-17_at_16.14.11__1_-removebg-preview.png"
            alt="Oficina da Saúde Natural"
            className="h-10 w-auto object-contain"
          />
          <span className="sr-only">oficina da saude natural</span>
        </Link>
        
        <nav className="hidden lg:flex items-center gap-6">
          {[
            { name: 'Início', path: '/' },
            { name: 'Produtos', path: '/products' },
            { name: 'Sobre', path: '/about' },
          ].map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 ${
                location.pathname === item.path 
                  ? 'text-neon font-semibold' 
                  : `${textColor} hover:text-neon`
              }`}
            >
              {item.name}
              {location.pathname === item.path && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-neon rounded-full"></span>
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100 hover:bg-neon/20 transition-all duration-300 hover:scale-110">
            <span className={`material-symbols-outlined ${textColor} group-hover:text-neon`}>shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-neon text-[10px] leading-none font-bold text-[#132210] border-2 border-white shadow-md animate-bounce">
                <span className="inline-block translate-y-[0.5px]">{cartCount}</span>
              </span>
            )}
          </Link>
          
          {/* User Profile */}
          {user ? (
            <div className="relative group">
              <button className="group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100 hover:bg-neon/20 transition-all duration-300 hover:scale-110">
                <span className={`material-symbols-outlined ${textColor} group-hover:text-neon`}>person</span>
              </button>
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden transform group-hover:translate-y-0 translate-y-2">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-neon/5 to-emerald-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neon/20">
                      <span className="material-symbols-outlined text-neon">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 truncate" title={user.email}>
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500">Conta Ativa</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  {user.email === 'lojaoficinadasaude@gmail.com' && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-neon/10 hover:to-emerald-50 rounded-lg mb-1 font-medium transition-all duration-200"
                    >
                      <span className="material-symbols-outlined text-lg text-neon">dashboard</span>
                      <span>Painel Admin</span>
                    </Link>
                  )}
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                  >
                    <span className="material-symbols-outlined text-lg text-red-600">logout</span>
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100 hover:bg-neon/20 transition-all duration-300 hover:scale-110"
            >
              <span className={`material-symbols-outlined ${textColor} group-hover:text-neon`}>person</span>
            </button>
          )}
          
          <button className="lg:hidden flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gray-100 hover:bg-neon/20 transition-all duration-300 hover:scale-110">
            <span className={`material-symbols-outlined ${textColor} group-hover:text-neon`}>menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="mt-auto py-12 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="material-symbols-outlined text-neon text-xl">eco</span>
            <span>© 2024 oficina da saude natural. Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
            <a href="#" className="hover:text-neon transition-colors">Termos de Serviço</a>
            <a href="#" className="hover:text-neon transition-colors">Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
};

interface StoreLayoutProps {
  cartCount: number;
  user: any;
  onLoginClick: () => void;
  onLogout: () => void;
}

const StoreLayout: React.FC<StoreLayoutProps> = ({ cartCount, user, onLoginClick, onLogout }) => (
  <div className="flex min-h-screen w-full flex-col font-display">
    <Header 
      cartCount={cartCount}
      user={user}
      onLoginClick={onLoginClick}
      onLogout={onLogout}
    />
    <main className="flex-1 w-full">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const ProductDetailWrapper = ({ addToCart }: { addToCart: (item: CartItem) => void }) => {
  const location = useLocation();
  // A key força o React a destruir e recriar o componente quando a URL muda
  return <ProductDetail key={location.pathname} addToCart={addToCart} />;
};

const App: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    // Verificar se há uma sessão ativa
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user);
      if (event === 'SIGNED_OUT') {
        setToast({ message: 'Você saiu da conta.', type: 'success' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addToCart = (item: CartItem) => {
    if (!user) {
      setToast({ message: "Faça login para adicionar ao carrinho!", type: 'info' });
      setShowLoginModal(true);
      return;
    }

    console.log('Adicionando ao carrinho:', item);

    setCartItems((prev) => {
      console.log('Carrinho atual:', prev);
      
      // Primeiro tenta encontrar pelo ID exato
      const existing = prev.find((p) => p.id === item.id);
      console.log('Produto existente com mesmo ID:', existing);
      
      if (existing) {
        const updated = prev.map((p) =>
          p.id === item.id ? { ...p, qty: p.qty + item.qty } : p
        );
        console.log('Carrinho atualizado (somando):', updated);
        
        // Forçar recálculo do frete no checkout
        setTimeout(() => {
          const checkoutElement = document.querySelector('[data-checkout-refresh]');
          if (checkoutElement) {
            const event = new CustomEvent('cartUpdated', { detail: updated });
            checkoutElement.dispatchEvent(event);
          }
        }, 100);
        
        return updated;
      }
      
      // Se não encontrar, adiciona como novo item
      console.log('Adicionando como novo item');
      const newCart = [...prev, item];
      
      // Forçar recálculo do frete no checkout
      setTimeout(() => {
        const checkoutElement = document.querySelector('[data-checkout-refresh]');
        if (checkoutElement) {
          const event = new CustomEvent('cartUpdated', { detail: newCart });
          checkoutElement.dispatchEvent(event);
        }
      }, 100);
      
      return newCart;
    });

    setToast({ message: "Produto adicionado ao carrinho!", type: 'success' });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((p) => p.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, qty: Math.max(1, p.qty + delta) } : p
        )
        .filter((p) => p.qty > 0)
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        {/* Admin Routes (Sem layout da loja) */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="produtos" element={<AdminProdutos />} />
          <Route path="pedidos" element={<AdminPedidos />} />
          <Route path="clientes" element={<AdminClientes />} />
          <Route path="categorias" element={<AdminCategorias />} />
          <Route path="videos" element={<AdminVideos />} />
        </Route>

        {/* Store Routes (Com Header e Footer) */}
        <Route element={
          <StoreLayout 
            cartCount={cartItems.reduce((sum, item) => sum + item.qty, 0)}
            user={user}
            onLoginClick={() => setShowLoginModal(true)}
            onLogout={handleLogout}
          />
        }>
          <Route path="/" element={<Home addToCart={addToCart} />} />
          <Route
            path="/products"
            element={<Products addToCart={addToCart} />}
          />
          <Route
            path="/product/:id"
            element={<ProductDetailWrapper addToCart={addToCart} />}
          />
          <Route path="/about" element={<About />} />
          <Route
            path="/cart"
            element={
              <Cart
                items={cartItems}
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <Checkout items={cartItems} />
            }
          />
          <Route path="/seguranca" element={<Security />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />
          <Route path="/payment/pending" element={<PaymentPending />} />
        </Route>
      </Routes>
      
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => setShowLoginModal(false)}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </HashRouter>
  );
};

export default App;