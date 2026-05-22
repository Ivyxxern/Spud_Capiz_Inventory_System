import { useState } from 'react';
import api from '../services/api';
import axios from 'axios';

const AddProduct = () => {
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
      await api.post('/products', payload);

      setMessage({ type: 'success', text: 'Product successfully added to inventory!' });

      setFormData({
        name: '',
        sku: '',
        current_stock: 0,
        supplier_name: '',
        expiration_date: '',
        low_stock_threshold: 5,
      });
    } catch (error) {
      const text = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ?? 'Failed to add product. Please check your inputs.'
        : 'Failed to add product. Please check your inputs.';
      setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Product</h2>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock *</label>
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

        <div className="flex justify-end pt-4 border-t mt-6">
          <button type="submit" disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-400">
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
