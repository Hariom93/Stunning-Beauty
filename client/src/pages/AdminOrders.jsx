import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { useAdminOrders, useUpdateOrderStatus } from '../hooks/useAdminApi';

const fmt = (n) => new Intl.NumberFormat('en-IN').format(n || 0);

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_STYLES = {
  Pending:   'bg-slate-100   text-slate-700   dark:bg-slate-800   dark:text-slate-300',
  Confirmed: 'bg-blue-100   text-blue-700   dark:bg-blue-900/40  dark:text-blue-300',
  Packed:    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  Shipped:   'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  Cancelled: 'bg-rose-100   text-rose-700   dark:bg-rose-900/40  dark:text-rose-400',
};

const AdminOrders = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(null); // id of currently-updating order

  const { data: orders = [], isLoading, isError } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchQ = !q
      || o._id.toLowerCase().includes(q)
      || o.user?.name?.toLowerCase().includes(q)
      || o.user?.email?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || o.orderStatus === statusFilter;
    return matchQ && matchStatus;
  });

  const handleStatusChange = async (order, newStatus) => {
    if (newStatus === order.orderStatus) return;
    setUpdating(order._id);
    try {
      await updateStatus.mutateAsync({ id: order._id, orderStatus: newStatus });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Orders</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isLoading ? 'Loading…' : `${filtered.length} orders`}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-3 bg-slate-50 dark:bg-slate-900/50">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Search by order ID or customer…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <select
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
        ) : isError ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <AlertCircle className="w-8 h-8 text-rose-400" />
            <p className="text-sm">Failed to load orders.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            {orders.length === 0 ? 'No orders yet.' : 'No orders match your filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white dark:bg-slate-950 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-center">Items</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Payment</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white font-mono">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{order.user?.name || 'Guest'}</p>
                      <p className="text-xs text-slate-400">{order.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-600 dark:text-slate-300">
                      {order.items?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                      ₹{fmt(order.totalPrice)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                          : order.paymentStatus === 'Failed'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {order.paymentMethod} · {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {updating === order._id ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                          <span className="text-xs text-slate-400">Updating…</span>
                        </div>
                      ) : (
                        <div className="relative inline-block">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order, e.target.value)}
                            className={`appearance-none pr-7 pl-3 py-1 rounded-full text-xs font-semibold border-0 outline-none cursor-pointer ${STATUS_STYLES[order.orderStatus] || ''}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{s}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
