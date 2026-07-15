import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit, Trash2, X, Upload, Loader2, AlertCircle, ImageIcon, CheckSquare, Square } from 'lucide-react';
import { useAdminProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useCategories, useBrands } from '../hooks/useAdminApi';
import ConfirmModal from '../components/admin/ConfirmModal';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('en-IN').format(n || 0);

const stockStatus = (stock) => {
  if (stock === 0) return { label: 'Out of Stock', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' };
  if (stock <= 10) return { label: 'Low Stock', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' };
  return { label: 'In Stock', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' };
};

const EMPTY_FORM = {
  title: '', description: '', shortDescription: '',
  price: '', discountPrice: '', stock: '', SKU: '',
  category: '', brand: '',
  tags: '', status: 'active',
  featured: false, trending: false, bestSeller: false, newArrival: false,
};

// ── Product Form Modal ────────────────────────────────────────────────────────
const ProductModal = ({ open, onClose, editProduct, categories = [], brands = [] }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileRef = useRef();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const busy = createMutation.isPending || updateMutation.isPending;

  // Pre-fill on edit
  React.useEffect(() => {
    if (editProduct) {
      setForm({
        title: editProduct.title || '',
        description: editProduct.description || '',
        shortDescription: editProduct.shortDescription || '',
        price: editProduct.price ?? '',
        discountPrice: editProduct.discountPrice ?? '',
        stock: editProduct.stock ?? '',
        SKU: editProduct.SKU || '',
        category: editProduct.category?._id || editProduct.category || '',
        brand: editProduct.brand?._id || editProduct.brand || '',
        tags: Array.isArray(editProduct.tags) ? editProduct.tags.join(', ') : '',
        status: editProduct.status || 'active',
        featured: editProduct.featured || false,
        trending: editProduct.trending || false,
        bestSeller: editProduct.bestSeller || false,
        newArrival: editProduct.newArrival || false,
      });
      setPreviews(editProduct.images?.map((img) => img.url) || []);
    } else {
      setForm(EMPTY_FORM);
      setPreviews([]);
    }
    setFiles([]);
  }, [editProduct, open]);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    files.forEach((file) => fd.append('images', file));

    try {
      if (editProduct) {
        await updateMutation.mutateAsync({ id: editProduct._id, formData: fd });
      } else {
        await createMutation.mutateAsync(fd);
      }
      onClose();
    } catch { /* toasts handled in hook */ }
  };

  const inputCls = 'w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors';
  const labelCls = 'block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider';

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Images */}
              <div>
                <label className={labelCls}>Product Images</label>
                <div
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 cursor-pointer hover:border-indigo-400 transition-colors text-center"
                  onClick={() => fileRef.current?.click()}
                >
                  {previews.length > 0 ? (
                    <div className="flex gap-3 flex-wrap justify-center">
                      {previews.slice(0, 5).map((src, i) => (
                        <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                      ))}
                    </div>
                  ) : (
                    <div className="py-4">
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Click to upload images (max 5)</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
                </div>
              </div>

              {/* Title + SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Title *</label>
                  <input className={inputCls} value={form.title} onChange={set('title')} required placeholder="e.g. iPhone 15 Pro" />
                </div>
                <div>
                  <label className={labelCls}>SKU *</label>
                  <input className={inputCls} value={form.SKU} onChange={set('SKU')} required placeholder="e.g. IPH-15P-256" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>Description *</label>
                <textarea className={`${inputCls} resize-none`} rows={3} value={form.description} onChange={set('description')} required placeholder="Full product description" />
              </div>
              <div>
                <label className={labelCls}>Short Description</label>
                <input className={inputCls} value={form.shortDescription} onChange={set('shortDescription')} placeholder="Brief summary (shown in listings)" />
              </div>

              {/* Price + Discount + Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Price (₹) *</label>
                  <input type="number" min="0" className={inputCls} value={form.price} onChange={set('price')} required placeholder="0" />
                </div>
                <div>
                  <label className={labelCls}>Discount Price</label>
                  <input type="number" min="0" className={inputCls} value={form.discountPrice} onChange={set('discountPrice')} placeholder="0" />
                </div>
                <div>
                  <label className={labelCls}>Stock *</label>
                  <input type="number" min="0" className={inputCls} value={form.stock} onChange={set('stock')} required placeholder="0" />
                </div>
              </div>

              {/* Category + Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Category *</label>
                  <select className={inputCls} value={form.category} onChange={set('category')} required>
                    <option value="">— Select Category —</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Brand *</label>
                  <select className={inputCls} value={form.brand} onChange={set('brand')} required>
                    <option value="">— Select Brand —</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Tags (comma-separated)</label>
                  <input className={inputCls} value={form.tags} onChange={set('tags')} placeholder="wireless, earbuds, noise-cancelling" />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={inputCls} value={form.status} onChange={set('status')}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Flags */}
              <div>
                <label className={labelCls}>Badges</label>
                <div className="flex flex-wrap gap-3">
                  {[['featured', 'Featured'], ['trending', 'Trending'], ['bestSeller', 'Best Seller'], ['newArrival', 'New Arrival']].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300 select-none">
                      <input type="checkbox" className="hidden" checked={form[key]} onChange={set(key)} />
                      {form[key]
                        ? <CheckSquare className="w-4 h-4 text-indigo-500" />
                        : <Square className="w-4 h-4 text-slate-400" />}
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={busy} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-70">
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminProducts = () => {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isError } = useAdminProducts();
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const deleteMutation = useDeleteProduct();

  const products = data?.products || [];

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchQ = !q || p.title?.toLowerCase().includes(q) || p.SKU?.toLowerCase().includes(q);
    const matchCat = !catFilter || p.category?._id === catFilter || p.category === catFilter;
    return matchQ && matchCat;
  });

  const openAdd = () => { setEditProduct(null); setModalOpen(true); };
  const openEdit = (p) => { setEditProduct(p); setModalOpen(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget._id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Products</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isLoading ? 'Loading…' : `${filtered.length} of ${products.length} products`}
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-3 bg-slate-50 dark:bg-slate-900/50">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Search by name or SKU…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <select
            value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
        ) : isError ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <AlertCircle className="w-8 h-8 text-rose-400" />
            <p className="text-sm">Failed to load products.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            {products.length === 0 ? 'No products yet. Click "Add Product" to create one.' : 'No products match your search.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white dark:bg-slate-950 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">Stock</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((product) => {
                  const ss = stockStatus(product.stock);
                  return (
                    <tr key={product._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700">
                            {product.thumbnail
                              ? <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover" />
                              : <ImageIcon className="w-full h-full p-3 text-slate-400" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[200px]">{product.title}</p>
                            <p className="text-xs text-slate-400 font-mono">{product.SKU}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{product.category?.name || '—'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                        ₹{fmt(product.discountPrice > 0 ? product.discountPrice : product.price)}
                        {product.discountPrice > 0 && (
                          <span className="ml-1.5 text-xs text-slate-400 line-through font-normal">₹{fmt(product.price)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{product.stock}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ss.cls}`}>{ss.label}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(product)} className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(product)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editProduct={editProduct}
        categories={categories}
        brands={brands}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Product?"
        message={`"${deleteTarget?.title}" will be permanently removed. This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminProducts;
