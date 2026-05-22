import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Product } from '../types';

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.data.inventory);
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

  if (loading) return <div className="p-8 text-gray-500">Loading inventory...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Master Inventory</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b">
              <th className="p-4 font-semibold text-sm">Product Name</th>
              <th className="p-4 font-semibold text-sm">SKU</th>
              <th className="p-4 font-semibold text-sm">Stock Level</th>
              <th className="p-4 font-semibold text-sm">Status</th>
              <th className="p-4 font-semibold text-sm">Supplier</th>
              <th className="p-4 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">No products found. Add some to get started.</td>
              </tr>
            ) : (
              products.map((product) => {
                let statusBadge = <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">In Stock</span>;
                if (product.current_stock === 0) {
                  statusBadge = <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Out of Stock</span>;
                } else if (product.current_stock <= product.low_stock_threshold) {
                  statusBadge = <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Low Stock</span>;
                }

                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-800 font-medium">{product.name}</td>
                    <td className="p-4 text-gray-500 text-sm">{product.sku}</td>
                    <td className="p-4 text-gray-800 font-bold">{product.current_stock}</td>
                    <td className="p-4">{statusBadge}</td>
                    <td className="p-4 text-gray-600 text-sm">{product.supplier_name || '-'}</td>

                    <td className="p-4 space-x-3">
                      <Link
                        to={`/edit-product/${product.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
