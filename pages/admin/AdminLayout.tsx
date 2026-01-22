import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const ADMIN_EMAIL = 'lojaoficinadasaude@gmail.com';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Admin');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || session.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        navigate('/admin');
        return;
      }

      setUserName(session.user.email.split('@')[0]);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const isActive = (path: string) => location.pathname === path;

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  const menuItems = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/admin/pedidos', icon: 'shopping_cart', label: 'Pedidos' },
    { path: '/admin/produtos', icon: 'inventory_2', label: 'Produtos' },
    { path: '/admin/clientes', icon: 'group', label: 'Clientes' },
    { path: '/admin/categorias', icon: 'category', label: 'Categorias' },
    { path: '/admin/videos', icon: 'smart_display', label: 'Vídeos' },
  ];

  return (
    <div className="flex min-h-screen bg-background-light">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen flex-col border-r border-gray-200 bg-white w-64 p-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-neon/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-neon">eco</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-gray-900 text-base font-bold leading-normal">Painel Administrativo</h1>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-neon/20 text-gray-900 font-bold'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className={`material-symbols-outlined ${isActive(item.path) ? 'fill' : ''}`}>
                {item.icon}
              </span>
              <p className="text-sm leading-normal">{item.label}</p>
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-gray-100 pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 w-full text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <p className="text-sm font-medium leading-normal">Sair</p>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="sticky top-0 z-10 flex justify-between items-center gap-4 px-8 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-neon/50 focus:border-neon"
              placeholder="Buscar pedidos, produtos..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="relative group">
              <button className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded-lg transition-colors">
                <div className="w-9 h-9 bg-neon/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-neon">person</span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              </button>
              
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-1">
                  <Link
                    to="/"
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  >
                    <span className="material-symbols-outlined text-lg">storefront</span>
                    Ver Loja
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          <Outlet context={{ searchTerm }} />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
