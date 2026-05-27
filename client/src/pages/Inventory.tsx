import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Product } from '../types';
import { getProductImageUrl } from '../utils/productImage';

const DEMO_CATEGORIES = ['Meat', 'Vegetables', 'Poultry', 'Canned Goods'] as const;

const minDelay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const STATUS_STYLES = {
  emerald: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
    dot: 'bg-emerald-500',
    pulse: false,
  },
  amber: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200/50',
    dot: 'bg-amber-500',
    pulse: true,
  },
  rose: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200/50',
    dot: 'bg-rose-500',
    pulse: true,
  },
} as const;

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
] as const;

const InventorySpinner = () => (
  <div className="flex flex-col items-center justify-center py-24 space-y-4">
    <svg
      role="status"
      aria-label="Loading"
      className="w-12 h-12 text-slate-200 animate-spin fill-blue-600"
      viewBox="0 0 100 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 28.003 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 28.003 9.08144 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentFill"
      />
    </svg>
    <span className="text-slate-600 font-medium">Loading inventory data...</span>
  </div>
);

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const [response] = await Promise.all([
        api.get('/products'),
        minDelay(600),
      ]);
      const fetchedProducts: Product[] = response.data.data.inventory.map((p: Product) => ({
        ...p,
        category: p.category || DEMO_CATEGORIES[Math.floor(Math.random() * DEMO_CATEGORIES.length)],
      }));
      setProducts(fetchedProducts);
    } catch {
      setError('Failed to load inventory data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = window.confirm('Are you sure you want to permanently delete this item?');
    if (!isConfirmed) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(product => product.id !== id));
    } catch {
      alert('Failed to delete the product. Please try again.');
    }
  };

  const handleExportCsv = () => {
    const headers = ['Name', 'SKU', 'Category', 'Stock', 'Threshold', 'Supplier', 'Expiration'];
    const rows = filteredProducts.map(p => [
      p.name,
      p.sku,
      p.category || 'Uncategorized',
      p.current_stock,
      p.low_stock_threshold,
      p.supplier_name || '',
      p.expiration_date || '',
    ]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spud-capiz-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const uniqueCategories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[]))];

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="p-8 text-rose-500 font-medium bg-white rounded-2xl border border-rose-100">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Master Inventory</h2>
          <p className="text-slate-500 mt-1">Manage, filter, and track all product stock levels.</p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={loading || filteredProducts.length === 0}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[420px] flex items-center justify-center">
          <InventorySpinner />
        </div>
      ) : (
        <>
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-2 items-center justify-between">
            <div className="relative w-full md:flex-1 md:max-w-md">
              <svg className="w-5 h-5 absolute left-4 top-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
              />
            </div>
            <div className="w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-200 pl-0 md:pl-2 pt-2 md:pt-0 flex items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-48 bg-transparent border-none text-slate-600 text-sm focus:ring-0 font-medium cursor-pointer py-2.5"
              >
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Product details</th>
                    <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-500 font-medium">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p>No matching products found.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((product, index) => {
                      let statusKey: keyof typeof STATUS_STYLES = 'emerald';
                      let statusText = 'In Stock';
                      if (product.current_stock === 0) {
                        statusKey = 'rose';
                        statusText = 'Out of Stock';
                      } else if (product.current_stock <= product.low_stock_threshold) {
                        statusKey = 'amber';
                        statusText = 'Low Stock';
                      }

                      const style = STATUS_STYLES[statusKey];
                      const initials = product.name.substring(0, 2).toUpperCase();
                      const avatarColor = AVATAR_COLORS[(product.id + index) % AVATAR_COLORS.length];
                      const imageUrl = getProductImageUrl(product);

                      return (
                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={product.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
                                />
                              ) : (
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${avatarColor}`}>
                                  {initials}
                                </div>
                              )}
                              <div>
                                <p className="text-slate-900 font-bold">{product.name}</p>
                                <p className="text-slate-500 font-mono text-xs mt-0.5">{product.sku}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {product.category || 'Uncategorized'}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className={`text-lg font-black ${product.current_stock === 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                              {product.current_stock}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${style.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${style.pulse ? 'animate-pulse' : ''}`} />
                              {statusText}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link
                                to={`/edit-product/${product.id}`}
                                title="Edit Product"
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDelete(product.id)}
                                title="Delete Product"
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filteredProducts.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
                <span className="text-sm text-slate-500 font-medium">
                  Showing <span className="font-bold text-slate-900">{startIndex + 1}</span> to{' '}
                  <span className="font-bold text-slate-900">{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</span> of{' '}
                  <span className="font-bold text-slate-900">{filteredProducts.length}</span> results
                </span>
                {totalPages > 1 && (
                  <div className="flex gap-0 shadow-sm rounded-xl overflow-hidden border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border-r border-slate-200 disabled:opacity-50 disabled:bg-slate-100 transition-colors"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:bg-slate-100 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Inventory;
