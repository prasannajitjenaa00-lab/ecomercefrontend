import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiUpload } from 'react-icons/fi';
import api from '../../utils/api';
import { formatCurrency, generateSlug } from '../../utils/helpers';
import { toast } from 'react-toastify';

const EMPTY_FORM = { name: '', slug: '', description: '', shortDescription: '', price: '', comparePrice: '', discount: '', category: '', brand: '', sizes: [], stock: '', isFeatured: false, isNewArrival: false, isBestSeller: false, isFlashSale: false, isActive: true, tags: '', gst: 18 };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
    api.get('/categories').then(({ data }) => setCategories(data.categories));
    api.get('/brands').then(({ data }) => setBrands(data.brands));
  }, [page, search]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15, ...(search && { search }) });
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  };

  const openCreate = () => { setForm(EMPTY_FORM); setProductImages([]); setEditingId(null); setModalOpen(true); };
  const openEdit = (p) => {
    setForm({ ...p, category: p.category?._id || p.category, brand: p.brand?._id || p.brand, tags: p.tags?.join(', ') || '' });
    setProductImages(p.images || []);
    setEditingId(p._id);
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImages(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      const { data } = await api.post('/upload/multiple?folder=overrated/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProductImages(prev => [...prev, ...data.images.map((img, i) => ({ url: img.url, public_id: img.public_id, isMain: prev.length === 0 && i === 0 }))]);
      toast.success(`${files.length} image(s) uploaded`);
    } catch { toast.error('Image upload failed'); }
    finally { setUploadingImages(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || generateSlug(form.name),
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        discount: parseInt(form.discount) || 0,
        stock: parseInt(form.stock),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        images: productImages,
      };
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created!');
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      loadProducts();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">Products</h1>
          <p className="font-body text-sm text-stone-500 mt-1">{pagination?.total || 0} total products</p>
        </div>
        <button onClick={openCreate} className="flex items-center space-x-2 bg-gold-400 text-dark-950 font-body font-semibold px-5 py-2.5 rounded-xl hover:bg-gold-300 transition-colors">
          <FiPlus size={18} /><span>Add Product</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
        <input type="text" placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-11 pr-4 py-3 font-body text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-gold-400" />
      </div>

      {/* Table */}
      <div className="bg-dark-900 rounded-2xl border border-dark-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-800">
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-4 font-body text-xs tracking-widest uppercase text-stone-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="skeleton h-10 rounded bg-dark-800" /></td></tr>
                ))
              ) : products.map(product => (
                <tr key={product._id} className="hover:bg-dark-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-3">
                      <img src={product.images?.[0]?.url} alt="" className="w-10 h-12 object-cover rounded-lg" />
                      <div>
                        <p className="font-body text-sm font-medium text-white line-clamp-1">{product.name}</p>
                        <p className="font-body text-xs text-stone-500">{product.brand?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-body text-sm text-stone-400">{product.category?.name}</td>
                  <td className="px-5 py-4">
                    <p className="font-body text-sm font-semibold text-white">{formatCurrency(product.price)}</p>
                    {product.discount > 0 && <p className="font-body text-xs text-green-400">-{product.discount}%</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-body text-xs px-2 py-1 rounded-full ${product.stock > 10 ? 'bg-green-900/30 text-green-400' : product.stock > 0 ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {product.isFeatured && <span className="text-xs bg-gold-400/20 text-gold-400 px-2 py-0.5 rounded">Featured</span>}
                      {product.isNewArrival && <span className="text-xs bg-blue-400/20 text-blue-400 px-2 py-0.5 rounded">New</span>}
                      {product.isFlashSale && <span className="text-xs bg-red-400/20 text-red-400 px-2 py-0.5 rounded">Sale</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => openEdit(product)} className="p-2 text-stone-400 hover:text-gold-400 hover:bg-dark-800 rounded-lg transition-colors">
                        <FiEdit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="p-2 text-stone-400 hover:text-red-400 hover:bg-dark-800 rounded-lg transition-colors">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination?.pages > 1 && (
          <div className="flex justify-center space-x-2 p-4 border-t border-dark-800">
            {[...Array(pagination.pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-lg font-body text-sm transition-all ${page === i + 1 ? 'bg-gold-400 text-dark-950 font-bold' : 'bg-dark-800 text-stone-400 hover:text-white'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              className="fixed inset-y-4 left-1/2 -translate-x-1/2 w-full max-w-3xl bg-dark-900 rounded-2xl border border-dark-700 z-50 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-dark-800">
                <h2 className="font-heading text-xl text-white">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-white"><FiX size={22} /></button>
              </div>
              <div className="overflow-y-auto flex-1 p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="admin-label">Product Name *</label>
                      <input type="text" value={form.name} required onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: generateSlug(e.target.value) }))} className="admin-input" />
                    </div>
                    <div>
                      <label className="admin-label">Slug</label>
                      <input type="text" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} className="admin-input" />
                    </div>
                    <div>
                      <label className="admin-label">Category *</label>
                      <select value={form.category} required onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="admin-input">
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="admin-label">Brand</label>
                      <select value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} className="admin-input">
                        <option value="">Select Brand</option>
                        {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="admin-label">Price (₹) *</label>
                      <input type="number" value={form.price} required min="0" onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="admin-input" />
                    </div>
                    <div>
                      <label className="admin-label">Compare Price (₹)</label>
                      <input type="number" value={form.comparePrice} min="0" onChange={e => setForm(p => ({ ...p, comparePrice: e.target.value }))} className="admin-input" />
                    </div>
                    <div>
                      <label className="admin-label">Discount (%)</label>
                      <input type="number" value={form.discount} min="0" max="100" onChange={e => setForm(p => ({ ...p, discount: e.target.value }))} className="admin-input" />
                    </div>
                    <div>
                      <label className="admin-label">Stock *</label>
                      <input type="number" value={form.stock} required min="0" onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} className="admin-input" />
                    </div>
                    <div className="col-span-2">
                      <label className="admin-label">Description *</label>
                      <textarea value={form.description} required rows={3} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="admin-input resize-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="admin-label">Tags (comma-separated)</label>
                      <input type="text" value={form.tags} placeholder="cotton, casual, summer" onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="admin-input" />
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[['isFeatured','Featured'], ['isNewArrival','New Arrival'], ['isBestSeller','Best Seller'], ['isFlashSale','Flash Sale']].map(([key, label]) => (
                      <label key={key} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))}
                          className="w-4 h-4 rounded border-dark-600 bg-dark-800 accent-gold-400" />
                        <span className="font-body text-sm text-stone-300">{label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="admin-label">Product Images</label>
                    <div className="border-2 border-dashed border-dark-600 rounded-xl p-6 text-center hover:border-gold-400 transition-colors cursor-pointer"
                      onClick={() => document.getElementById('img-upload').click()}>
                      <FiUpload size={24} className="text-stone-400 mx-auto mb-2" />
                      <p className="font-body text-sm text-stone-400">Click to upload images</p>
                      <input id="img-upload" type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </div>
                    {uploadingImages && <p className="font-body text-xs text-gold-400 mt-2">Uploading...</p>}
                    {productImages.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-4">
                        {productImages.map((img, i) => (
                          <div key={i} className="relative w-20 h-24 rounded-lg overflow-hidden border border-dark-600">
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setProductImages(prev => prev.filter((_, j) => j !== i))}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <FiX size={10} className="text-white" />
                            </button>
                            {img.isMain && <span className="absolute bottom-0 left-0 right-0 bg-gold-400/80 text-dark-950 text-xs text-center font-bold">Main</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-dark-800">
                    <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2.5 border border-dark-600 text-stone-400 font-body text-sm rounded-xl hover:text-white transition-colors">Cancel</button>
                    <button type="submit" disabled={saving} className="px-6 py-2.5 bg-gold-400 text-dark-950 font-body font-semibold text-sm rounded-xl hover:bg-gold-300 transition-colors disabled:opacity-60">
                      {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .admin-label { display: block; font-family: 'Jost', sans-serif; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #666; margin-bottom: 6px; }
        .admin-input { width: 100%; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 10px; padding: 10px 14px; font-family: 'Jost', sans-serif; font-size: 14px; color: white; outline: none; transition: border-color 0.2s; }
        .admin-input:focus { border-color: #d4af37; }
        .admin-input option { background: #1a1a1a; }
      `}</style>
    </div>
  );
}
