import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import axios from 'axios';

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    current_stock: 0,
    supplier_name: '',
    expiration_date: '',
    low_stock_threshold: 5,
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const product = response.data.data;
        setFormData({
          name: product.name,
          sku: product.sku,
          current_stock: product.current_stock,
          supplier_name: product.supplier_name ?? '',
          expiration_date: product.expiration_date
            ? String(product.expiration_date).slice(0, 10)
            : '',
          low_stock_threshold: product.low_stock_threshold,
        });
      } catch {
        setMessage({ type: 'error', text: 'Failed to load product.' });
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'current_stock' || name === 'low_stock_threshold' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const payload = {
      ...formData,
      expiration_date: formData.expiration_date || null,
      supplier_name: formData.supplier_name || null,
    };

    try {
      await api.put(`/products/${id}`, payload);
      setMessage({ type: 'success', text: 'Product updated successfully!' });
      setTimeout(() => navigate('/inventory'), 1000);
    } catch (error) {
      const text = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ?? 'Failed to update product. Please check your inputs.'
        : 'Failed to update product. Please check your inputs.';
      setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-gray-500">Loading product...</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
        <Link to="/inventory" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
          ← Back to Inventory
        </Link>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU / Barcode *</label>
            <input type="text" name="sku" value={formData.sku} onChange={handleChange} required
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock *</label>
            <input type="number" name="current_stock" min="0" value={formData.current_stock} onChange={handleChange} required
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert Threshold *</label>
            <input type="number" name="low_stock_threshold" min="1" value={formData.low_stock_threshold} onChange={handleChange} required
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
            <input type="text" name="supplier_name" value={formData.supplier_name} onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
            <input type="date" name="expiration_date" value={formData.expiration_date} onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
          <Link
            to="/inventory"
            className="px-6 py-3 rounded-lg font-bold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button type="submit" disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-400">
            {loading ? 'Saving...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
