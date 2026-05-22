import { Outlet, Link } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-blue-600">SPUD Capiz</h2>
          <p className="text-sm text-gray-500">Inventory System</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="block p-3 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition-colors">
            Dashboard
          </Link>
          <Link to="/inventory" className="block p-3 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition-colors">
            Master Inventory
          </Link>
          <Link to="/add-product" className="block p-3 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition-colors">
            Add Product
          </Link>
        </nav>
        
        <div className="p-4 border-t">
          <button className="w-full text-left p-3 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* The <Outlet /> renders whichever page the router is currently on */}
        <Outlet /> 
      </main>
    </div>
  );
};

export default Layout;
