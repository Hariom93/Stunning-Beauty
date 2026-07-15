import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Loader2, AlertCircle, TrendingUp, DollarSign, ShoppingCart, Tag, Star, Award } from 'lucide-react';
import { useDashboard, useAdminProducts } from '../hooks/useAdminApi';

const fmt = (n) => new Intl.NumberFormat('en-IN').format(n || 0);

const COLORS = ['#6366f1', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];

const AdminAnalytics = () => {
  const { data: analytics, isLoading: dashLoading, isError: dashError } = useDashboard();
  const { data: prodData, isLoading: prodLoading } = useAdminProducts({ limit: 10 });

  const [activeTab, setActiveTab] = useState('revenue');

  const products = prodData?.products || [];

  if (dashLoading || prodLoading) {
    return (
      <div className="py-32 flex justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (dashError || !analytics) {
    return (
      <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <p className="text-sm font-semibold">Failed to load analytics data.</p>
      </div>
    );
  }

  const { counters = {}, categorySales = [], monthlySales = [] } = analytics;

  // Sorting products by rating / sales for top products showcase
  const topProducts = [...products]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Business Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Deep-dive reports on sales performance, categories, and top inventory items</p>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        {[
          { id: 'revenue', label: 'Revenue Analysis', icon: DollarSign },
          { id: 'orders', label: 'Order Velocity', icon: ShoppingCart },
          { id: 'categories', label: 'Category Sales', icon: Tag },
          { id: 'products', label: 'Top Performers', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Timeline</h2>
                <p className="text-xs text-slate-400">Total accumulated revenue trends over the last 6 months</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Sales</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">₹{fmt(counters.revenue)}</p>
              </div>
            </div>
            
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySales}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${fmt(val)}`} />
                  <Tooltip formatter={(val) => [`₹${fmt(val)}`, 'Revenue']} contentStyle={{ borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Order Volume Tracker</h2>
                <p className="text-xs text-slate-400">Monthly breakdown of successful consumer transactions</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Orders</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{counters.orders} orders</p>
              </div>
            </div>

            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px' }} />
                  <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sales by Category</h2>
                <p className="text-xs text-slate-400">Total revenue generated per product category</p>
              </div>
              
              <div className="space-y-3">
                {categorySales.map((cat, index) => (
                  <div key={cat.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{cat.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">₹{fmt(cat.value)}</span>
                  </div>
                ))}
                {categorySales.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-6">No category sales logged yet.</p>
                )}
              </div>
            </div>

            <div className="h-80 flex items-center justify-center">
              {categorySales.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySales}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categorySales.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => `₹${fmt(val)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-sm text-slate-400">No chart data available</span>
              )}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Highest-Rated Products</h2>
              <p className="text-xs text-slate-400">Catalog items with superior consumer ratings and feedback</p>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Product details</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-center">Rating</th>
                    <th className="px-6 py-4 text-center">Reviews count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {topProducts.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/50 p-1 flex-shrink-0 flex items-center justify-center">
                          <img src={p.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80'} alt="" className="max-h-full max-w-full object-contain" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[250px]">{p.title}</p>
                          <p className="text-[10px] text-slate-450 font-mono">{p.SKU}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        ₹{fmt(p.discountPrice > 0 ? p.discountPrice : p.price)}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{p.stock} units</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="font-bold text-slate-800 dark:text-white">{p.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-500">
                        {p.reviewCount || 0} reviews
                      </td>
                    </tr>
                  ))}
                  {topProducts.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-slate-400">No products configured in catalog yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminAnalytics;
