import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import axios from 'axios';
import { getProductImageUrl } from '../utils/productImage';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    current_stock: 0,
    supplier_name: '',
    expiration_date: '',
    low_stock_threshold: 5,
  });

  const [image, setImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const product = response.data.data;

        setFormData({
          name: product.name,
          sku: product.sku,
          current_stock: product.current_stock,
          supplier_name: product.supplier_name || '',
          expiration_date: product.expiration_date
            ? String(product.expiration_date).slice(0, 10)
            : '',
          low_stock_threshold: product.low_stock_threshold,
        });

        setCurrentImageUrl(getProductImageUrl(product));
      } catch {
        setMessage({ type: 'error', text: 'Failed to load product data.' });
      } finally {
        setLoading(false);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setCurrentImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('sku', formData.sku);
    submitData.append('current_stock', formData.current_stock.toString());
    submitData.append('low_stock_threshold', formData.low_stock_threshold.toString());

    if (formData.supplier_name) submitData.append('supplier_name', formData.supplier_name);
    if (formData.expiration_date) submitData.append('expiration_date', formData.expiration_date);
    if (image) submitData.append('image', image);

    submitData.append('_method', 'PUT');

    try {
      await api.post(`/products/${id}`, submitData);
      setMessage({ type: 'success', text: 'Product updated successfully!' });
      setTimeout(() => navigate('/inventory'), 1500);
    } catch (error) {
      const text = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ?? 'Failed to update product.'
        : 'Failed to update product.';
      setMessage({ type: 'error', text });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="p-8 text-slate-500 font-medium animate-pulse">Loading product details...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Product</h2>
          <p className="text-slate-500 mt-1">Update details for {formData.name}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="text-slate-500 hover:text-slate-800 font-medium transition-colors"
        >
          &larr; Back to Inventory
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        {message.text && (
          <div className={`p-4 rounded-xl mb-6 font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Product Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                  className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">SKU / Barcode *</label>
                <input type="text" name="sku" value={formData.sku} onChange={handleChange} required
                  className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Stock Level *</label>
                  <input type="number" name="current_stock" min="0" value={formData.current_stock} onChange={handleChange} required
                    className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Low Alert At *</label>
                  <input type="number" name="low_stock_threshold" min="1" value={formData.low_stock_threshold} onChange={handleChange} required
                    className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Product Image</label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="edit-image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 overflow-hidden relative transition-colors">
                    {currentImageUrl ? (
                      <img src={currentImageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 hover:opacity-40 transition-opacity" />
                    ) : null}
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
                      <svg className="w-8 h-8 mb-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <p className="text-sm text-slate-700 font-bold bg-white/70 px-2 py-1 rounded">Change image</p>
                    </div>
                    <input id="edit-image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Supplier Name</label>
                <input type="text" name="supplier_name" value={formData.supplier_name} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Expiration Date</label>
                <input type="date" name="expiration_date" value={formData.expiration_date} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-600" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-100 mt-8">
            <button type="submit" disabled={saving}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-md shadow-blue-500/30 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
