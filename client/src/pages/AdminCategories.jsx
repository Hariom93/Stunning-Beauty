import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit, Trash2, X, Loader2, AlertCircle, Tag } from 'lucide-react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useAdminApi';
import ConfirmModal from '../components/admin/ConfirmModal';

const EMPTY = { name: '', description: '', image: '', status: 'active', parentCategory: '' };

const inputCls = 'w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 transition-colors';
const labelCls = 'block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider';

const CategoryModal = ({ open, onClose, editItem, categories }) => {
  const [form, setForm] = useState(EMPTY);
  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const busy = createMut.isPending || updateMut.isPending;

  useEffect(() => {
    setForm(editItem
      ? { name: editItem.name || '', description: editItem.description || '', image: editItem.image || '', status: editItem.status || 'active', parentCategory: editItem.parentCategory?._id || '' }
      : EMPTY
    );
  }, [editItem, open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = { ...form, parentCategory: form.parentCategory || undefined };
    try {
      if (editItem) { await updateMut.mutateAsync({ id: editItem._id, ...body }); }
      else { await createMut.mutateAsync(body); }
      onClose();
    } catch { /* toast handled in hook */ }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editItem ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Name *</label>
                <input className={inputCls} value={form.name} onChange={set('name')} required placeholder="e.g. Electronics" />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea className={`${inputCls} resize-none`} rows={2} value={form.description} onChange={set('description')} placeholder="Brief category description" />
              </div>
              <div>
                <label className={labelCls}>Image URL</label>
                <input className={inputCls} value={form.image} onChange={set('image')} placeholder="https://…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Parent Category</label>
                  <select className={inputCls} value={form.parentCategory} onChange={set('parentCategory')}>
                    <option value="">None (Top-level)</option>
                    {categories?.filter((c) => c._id !== editItem?._id).map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={inputCls} value={form.status} onChange={set('status')}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={busy} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-70">
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editItem ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AdminCategories = () => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: categories = [], isLoading, isError } = useCategories();
  const deleteMut = useDeleteCategory();

  const filtered = categories.filter((c) =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditItem(null); setModalOpen(true); };
  const openEdit = (c) => { setEditItem(c); setModalOpen(true); };

  const handleDelete = async () => {
    await deleteMut.mutateAsync(deleteTarget._id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Categories</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{isLoading ? 'Loading…' : `${filtered.length} categories`}</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Category</button>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search categories…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors" />
          </div>
        </div>

        {isLoading ? (
          <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
        ) : isError ? (
          <div className="py-16 flex flex-col items-center gap-3"><AlertCircle className="w-8 h-8 text-rose-400" /><p className="text-sm text-slate-400">Failed to load categories.</p></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">{categories.length === 0 ? 'No categories yet.' : 'No matches.'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white dark:bg-slate-950 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Slug</th>
                  <th className="px-6 py-4 font-semibold">Parent</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((cat) => (
                  <tr key={cat._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                          {cat.image
                            ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                            : <Tag className="w-4 h-4 text-slate-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{cat.name}</p>
                          {cat.description && <p className="text-xs text-slate-400 line-clamp-1 max-w-[200px]">{cat.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-500">{cat.slug}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{cat.parentCategory?.name || <span className="text-slate-400">—</span>}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${cat.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {cat.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(cat)} className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteTarget(cat)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CategoryModal open={modalOpen} onClose={() => setModalOpen(false)} editItem={editItem} categories={categories} />
      <ConfirmModal open={!!deleteTarget} title="Delete Category?" message={`"${deleteTarget?.name}" will be deleted. Products in this category will lose their category reference.`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteMut.isPending} />
    </div>
  );
};

export default AdminCategories;
