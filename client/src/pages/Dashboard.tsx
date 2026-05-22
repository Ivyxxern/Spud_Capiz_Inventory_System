import { useState, useEffect } from 'react';
import api from '../services/api';
import type { Product } from '../types';

interface DashboardStats {
  total_items: number;
  low_stock_items: number;
  expiring_soon: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [criticalItems, setCriticalItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/products');
        const inventory: Product[] = response.data.data.inventory;

        setStats(response.data.data.dashboard_stats);

        const critical = inventory.filter(item => item.current_stock <= item.low_stock_threshold);
        setCriticalItems(critical);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !stats) return <div className="p-8 text-gray-500">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Products</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total_items}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-500">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Low Stock Alerts</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.low_stock_items}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Expiring Soon</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.expiring_soon}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="bg-red-50 p-4 border-b border-red-100">
          <h3 className="text-lg font-bold text-red-800">Requires Immediate Attention (Out of Stock / Low Stock)</h3>
        </div>
        <div className="p-0">
          {criticalItems.length === 0 ? (
            <p className="p-6 text-gray-500">All stock levels are healthy.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {criticalItems.map(item => (
                <li key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="font-bold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">SKU: {item.sku} | Threshold: {item.low_stock_threshold}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${item.current_stock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {item.current_stock} remaining
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
