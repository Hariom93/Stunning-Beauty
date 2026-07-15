import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, X, Loader2, AlertCircle, ToggleLeft, ToggleRight, Layout } from 'lucide-react';
import { useAdminBanners, useCreateBanner, useToggleBannerStatus, useDeleteBanner } from '../hooks/useAdminApi';
import ConfirmModal from '../components/admin/ConfirmModal';

const EMPTY = {
  title: '',
  subtitle: '',
  image: '',
  link: '/products',
  position: 'Hero',
  status: 'active'
};

const inputCls = 'w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 transition-colors text-slate-900 dark:text-slate-100';
const labelCls = 'block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider';

const BannerModal = ({ open, onClose }) => {
  const [form, setForm] = useState(EMPTY);
  const createMut = useCreateBanner();
  const busy = createMut.isPending;

  useEffect(() => {
    if (open) setForm(EMPTY);
  }, [open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMut.mutateAsync(form);
      onClose();
    } catch { /* hook handles toast */ }
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
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Ad Banner</h2>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Banner Title *</label>
                <input className={inputCls} value={form.title} onChange={set('title')} required placeholder="e.g. Summer Collection" />
              </div>
              <div>
                <label className={labelCls}>Subtitle</label>
                <input className={inputCls} value={form.subtitle} onChange={set('subtitle')} placeholder="e.g. Save up to 50% Off" />
              </div>
              <div>
                <label className={labelCls}>Image URL *</label>
                <input className={inputCls} value={form.image} onChange={set('image')} required placeholder="https://unsplash.com/..." />
                {form.image && (
                  <div className="mt-2 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <img src={form.image} alt="preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                )}
              </div>
              <div>
                <label className={labelCls}>Redirect Link *</label>
                <input className={inputCls} value={form.link} onChange={set('link')} required placeholder="e.g. /products?cat=fashion" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Position</label>
                  <select className={inputCls} value={form.position} onChange={set('position')}>
                    <option value="Hero">Hero Carousel Slider</option>
                    <option value="Promo">Promo Sub-section</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={inputCls} value={form.status} onChange={set('status')}>
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={busy} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-70">
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Banner
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AdminBanners = () => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: banners = [], isLoading, isError } = useAdminBanners();
  const toggleStatusMut = useToggleBannerStatus();
  const deleteMut = useDeleteBanner();

  const filtered = banners.filter((b) => !search || b.title?.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async () => {
    await deleteMut.mutateAsync(deleteTarget._id);
    setDeleteTarget(null);
  };

  const handleToggleStatus = async (id) => {
    await toggleStatusMut.mutateAsync(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Banners</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{isLoading ? 'Loading…' : `${filtered.length} banners configured`}</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Banner</button>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search banners…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors" />
          </div>
        </div>

        {isLoading ? (
          <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
        ) : isError ? (
          <div className="py-16 flex flex-col items-center gap-3"><AlertCircle className="w-8 h-8 text-rose-400" /><p className="text-sm text-slate-400">Failed to load banners.</p></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">{banners.length === 0 ? 'No banners yet.' : 'No matches.'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white dark:bg-slate-950 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 font-semibold">Banner details</th>
                  <th className="px-6 py-4 font-semibold">Position</th>
                  <th className="px-6 py-4 font-semibold">Redirect Link</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((banner) => (
                  <tr key={banner._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-150 border border-slate-200/50 flex-shrink-0">
                          <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-slate-900 dark:text-white">{banner.title}</p>
                          {banner.subtitle && <p className="text-xs text-slate-400">{banner.subtitle}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-350">{banner.position}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{banner.link}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleToggleStatus(banner._id)} className="flex items-center cursor-pointer">
                        {banner.status === 'active' ? (
                          <ToggleRight className="w-8 h-8 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-slate-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setDeleteTarget(banner)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BannerModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <ConfirmModal open={!!deleteTarget} title="Delete Banner?" message={`Are you sure you want to delete banner "${deleteTarget?.title}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteMut.isPending} />
    </div>
  );
};

export default AdminBanners;
