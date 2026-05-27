import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout failed on server, but forcing client logout anyway.', error);
    } finally {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="flex h-screen bg-slate-50 font-sans">

      <aside className="w-64 bg-slate-900 flex flex-col shadow-2xl relative z-20 text-slate-300">

        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">SPUD Capiz</h2>
              <p className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-0.5">Inventory</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">

          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
              isActive('/dashboard')
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </Link>

          <Link
            to="/inventory"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
              isActive('/inventory') || isActive('/edit-product')
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Master Inventory
          </Link>

          <Link
            to="/add-product"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
              isActive('/add-product')
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Add Product
          </Link>

        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-rose-400 font-medium hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all duration-200"
          >
            <svg className="w-5 h-5 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10">
        <Outlet />
      </main>

    </div>
  );
};

export default Layout;
