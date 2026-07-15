import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  IndianRupee, ShoppingCart, Users, Package,
  TrendingUp, Loader2, AlertCircle, ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useDashboard } from '../hooks/useAdminApi';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n || 0);

const ORDER_STATUS_COLORS = {
  Pending:   'bg-slate-100  text-slate-700  dark:bg-slate-800 dark:text-slate-300',
  Confirmed: 'bg-blue-100   text-blue-700   dark:bg-blue-900/40 dark:text-blue-300',
  Packed:    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  Shipped:   'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  Cancelled: 'bg-rose-100   text-rose-700   dark:bg-rose-900/40 dark:text-rose-400',
};

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

const StatCard = ({ label, value, icon: Icon, color, bg, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <TrendingUp className="w-4 h-4 text-emerald-400" />
    </div>
    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</p>
  </motion.div>
);

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="w-10 h-4 rounded bg-slate-200 dark:bg-slate-800" />
    </div>
    <div className="w-24 h-4 rounded bg-slate-200 dark:bg-slate-800 mb-2" />
    <div className="w-32 h-8 rounded bg-slate-200 dark:bg-slate-800" />
  </div>
);

// ── component ─────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { data: analytics, isLoading, isError, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Loading live data…</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <p className="text-slate-500 dark:text-slate-400">Failed to load dashboard data.</p>
        <button onClick={() => refetch()} className="btn-primary px-4 py-2 text-sm">Retry</button>
      </div>
    );
  }

  const { counters, monthlySales, categorySales, recentOrders } = analytics;

  const stats = [
    { label: 'Total Revenue',  value: `₹${fmt(counters.revenue)}`, icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', delay: 0 },
    { label: 'Total Orders',   value: fmt(counters.orders),         icon: ShoppingCart, color: 'text-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-500/10',  delay: 0.05 },
    { label: 'Total Customers',value: fmt(counters.users),          icon: Users,        color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-500/10',  delay: 0.1 },
    { label: 'Products',       value: fmt(counters.products),       icon: Package,      color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-500/10',    delay: 0.15 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Live data from your MongoDB database.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Monthly Revenue Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="xl:col-span-2 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
        >
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6">Monthly Revenue</h2>
          {monthlySales?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlySales} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={52} />
                <Tooltip
                  formatter={(v) => [`₹${fmt(v)}`, 'Revenue']}
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#f1f5f9', fontSize: 13 }}
                  cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                />
                <Bar dataKey="revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[240px] text-slate-400 text-sm">No sales data yet.</div>
          )}
        </motion.div>

        {/* Category Sales Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
        >
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6">Sales by Category</h2>
          {categorySales?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={categorySales} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                  {categorySales.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [`₹${fmt(v)}`, n]}
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#f1f5f9', fontSize: 13 }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[240px] text-slate-400 text-sm">No category data yet.</div>
          )}
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Orders</h2>
          <Link to="/admin/orders" className="flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recentOrders?.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400 text-sm">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-3 font-semibold">Order ID</th>
                  <th className="px-6 py-3 font-semibold">Customer</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Amount</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentOrders?.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white font-mono">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {order.user?.name || 'Guest'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                      ₹{fmt(order.totalPrice)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[order.orderStatus] || ''}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
