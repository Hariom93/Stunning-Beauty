import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, X, Loader2, AlertCircle, Sparkles, Tag, Calendar } from 'lucide-react';
import { useCoupons, useCreateCoupon, useDeleteCoupon } from '../hooks/useAdminApi';
import ConfirmModal from '../components/admin/ConfirmModal';

const EMPTY = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  expiryDate: '',
  usageLimit: '1'
};

const inputCls = 'w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 transition-colors text-slate-900 dark:text-slate-100';
const labelCls = 'block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider';

const CouponModal = ({ open, onClose }) => {
  const [form, setForm] = useState(EMPTY);
  const createMut = useCreateCoupon();
  const busy = createMut.isPending;

  useEffect(() => {
    if (open) setForm(EMPTY);
  }, [open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMut.mutateAsync({
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        usageLimit: Number(form.usageLimit)
      });
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
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Promo Coupon</h2>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Coupon Code *</label>
                <input className={inputCls} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required placeholder="e.g. SAVE30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Discount Type *</label>
                  <select className={inputCls} value={form.discountType} onChange={set('discountType')}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Value *</label>
                  <input type="number" min="1" className={inputCls} value={form.discountValue} onChange={set('discountValue')} required placeholder="e.g. 10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Min Order Amt (₹)</label>
                  <input type="number" min="0" className={inputCls} value={form.minOrderAmount} onChange={set('minOrderAmount')} placeholder="0" />
                </div>
                <div>
                  <label className={labelCls}>Max Discount (₹)</label>
                  <input type="number" min="0" className={inputCls} value={form.maxDiscountAmount} onChange={set('maxDiscountAmount')} placeholder="0 (No limit)" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Expiry Date *</label>
                  <input type="date" className={inputCls} value={form.expiryDate} onChange={set('expiryDate')} required />
                </div>
                <div>
                  <label className={labelCls}>Usage Limit</label>
                  <input type="number" min="1" className={inputCls} value={form.usageLimit} onChange={set('usageLimit')} placeholder="1" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={busy} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-70">
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Coupon
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AdminCoupons = () => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: coupons = [], isLoading, isError } = useCoupons();
  const deleteMut = useDeleteCoupon();

  const filtered = coupons.filter((c) => !search || c.code?.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async () => {
    await deleteMut.mutateAsync(deleteTarget._id);
    setDeleteTarget(null);
  };

  const isExpired = (expiryDate) => new Date(expiryDate) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Coupons</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{isLoading ? 'Loading…' : `${filtered.length} active coupons`}</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Coupon</button>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search coupon code…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors" />
          </div>
        </div>

        {isLoading ? (
          <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
        ) : isError ? (
          <div className="py-16 flex flex-col items-center gap-3"><AlertCircle className="w-8 h-8 text-rose-400" /><p className="text-sm text-slate-400">Failed to load coupons.</p></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">{coupons.length === 0 ? 'No coupons yet.' : 'No matches.'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white dark:bg-slate-950 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 font-semibold">Code</th>
                  <th className="px-6 py-4 font-semibold">Discount</th>
                  <th className="px-6 py-4 font-semibold">Requirement</th>
                  <th className="px-6 py-4 font-semibold">Usage Log</th>
                  <th className="px-6 py-4 font-semibold">Expiry</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((coupon) => {
                  const expired = isExpired(coupon.expiryDate);
                  return (
                    <tr key={coupon._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-xl flex items-center justify-center">
                            <Tag className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">{coupon.code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Off`}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        Min. Spend: ₹{coupon.minOrderAmount}
                        {coupon.maxDiscountAmount > 0 && <span className="block text-[10px] text-slate-400">Max Discount: ₹{coupon.maxDiscountAmount}</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                        {coupon.usageCount} / {coupon.usageLimit}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${expired ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'}`}>
                          <Calendar className="w-3 h-3" />
                          {new Date(coupon.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          {expired && ' (Expired)'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setDeleteTarget(coupon)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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

      <CouponModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <ConfirmModal open={!!deleteTarget} title="Delete Coupon?" message={`Are you sure you want to delete coupon "${deleteTarget?.code}"? It will immediately stop working.`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteMut.isPending} />
    </div>
  );
};

export default AdminCoupons;
