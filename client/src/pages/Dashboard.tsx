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
  const [expiringItems, setExpiringItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/products');
        const inventory: Product[] = response.data.data.inventory;

        setStats(response.data.data.dashboard_stats);

        const critical = inventory.filter(item => item.current_stock <= item.low_stock_threshold);
        setCriticalItems(critical);

        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const expiring = inventory.filter(item => {
          if (!item.expiration_date) return false;
          const expDate = new Date(item.expiration_date);
          return expDate <= thirtyDaysFromNow;
        });

        expiring.sort((a, b) => new Date(a.expiration_date!).getTime() - new Date(b.expiration_date!).getTime());
        setExpiringItems(expiring);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !stats) return <div className="p-10 text-slate-500 font-medium">Loading dashboard...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Overview</h2>
        <p className="text-slate-500 mt-1">Real-time insights for SPUD Capiz inventory.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-md text-white transition-transform hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-blue-100 uppercase tracking-wider">Total Products</h3>
            <svg className="w-8 h-8 text-blue-200 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <p className="text-4xl font-extrabold mt-4">{stats.total_items}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 rounded-2xl shadow-md text-white transition-transform hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-orange-100 uppercase tracking-wider">Low Stock</h3>
            <svg className="w-8 h-8 text-orange-200 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <p className="text-4xl font-extrabold mt-4">{stats.low_stock_items}</p>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-red-600 p-6 rounded-2xl shadow-md text-white transition-transform hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-red-100 uppercase tracking-wider">Expiring Soon</h3>
            <svg className="w-8 h-8 text-red-200 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-4xl font-extrabold mt-4">{stats.expiring_soon}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-rose-50/50 p-5 border-b border-rose-100">
            <h3 className="text-lg font-bold text-rose-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              Low Stock Alerts
            </h3>
          </div>
          <div className="p-0">
            {criticalItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="font-medium">All stock levels are healthy.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {criticalItems.map(item => (
                  <li key={item.id} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-bold text-slate-800 text-lg">{item.name}</p>
                      <p className="text-sm text-slate-500 font-medium">SKU: {item.sku} <span className="mx-2">•</span> Threshold: {item.low_stock_threshold}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-black tracking-tight ${item.current_stock === 0 ? 'text-rose-600' : 'text-amber-500'}`}>
                        {item.current_stock}
                      </p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remaining</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-amber-50/50 p-5 border-b border-amber-100">
            <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Expiring Soon (Next 30 Days)
            </h3>
          </div>
          <div className="p-0">
            {expiringItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="font-medium">No items expiring soon.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {expiringItems.map(item => {
                  const isExpired = new Date(item.expiration_date!) < new Date();
                  return (
                    <li key={`exp-${item.id}`} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-bold text-slate-800 text-lg">{item.name}</p>
                        <p className="text-sm text-slate-500 font-medium">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-black tracking-tight ${isExpired ? 'text-rose-600' : 'text-amber-600'}`}>
                          {new Date(item.expiration_date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {isExpired ? 'Expired' : 'Expiration Date'}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
