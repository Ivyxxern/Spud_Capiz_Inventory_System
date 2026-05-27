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
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'current_stock' || name === 'low_stock_threshold' ? Number(value) : value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('sku', formData.sku);
    payload.append('current_stock', String(formData.current_stock));
    payload.append('low_stock_threshold', String(formData.low_stock_threshold));
    if (formData.supplier_name) payload.append('supplier_name', formData.supplier_name);
    if (formData.expiration_date) payload.append('expiration_date', formData.expiration_date);
    if (image) payload.append('image', image);

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
      setImage(null);
      setImagePreview(null);
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
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs text-center px-2">
                  No image
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                onChange={handleImageChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">JPEG, PNG, GIF or WebP. Max 2MB.</p>
          </div>

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
