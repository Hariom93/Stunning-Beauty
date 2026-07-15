import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, Shield, Settings, Database, Server } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const { user } = useAuth();
  
  // Settings forms
  const [general, setGeneral] = useState({
    appName: 'Stunning Beauty',
    supportEmail: 'support@stunningbeauty.in',
    currency: 'INR',
    taxRate: '18'
  });

  const [payment, setPayment] = useState({
    mockMode: true,
    codAllowed: true,
    stripeEnabled: false,
    razorpayEnabled: true
  });

  const handleSave = (section) => {
    toast.success(`${section} settings updated successfully! (Sandbox simulated)`);
  };

  const inputCls = 'w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 transition-colors text-slate-900 dark:text-slate-100';
  const labelCls = 'block text-xs font-semibold text-slate-650 dark:text-slate-400 mb-1.5 uppercase tracking-wider';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure global application variables, store metadata, and gateway preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* General Store configuration */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-850">
            <Settings className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">General Preferences</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className={labelCls}>Store Name</label>
              <input className={inputCls} value={general.appName} onChange={e => setGeneral(g => ({ ...g, appName: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Support Email Address</label>
              <input className={inputCls} value={general.supportEmail} onChange={e => setGeneral(g => ({ ...g, supportEmail: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Base Currency</label>
                <select className={inputCls} value={general.currency} onChange={e => setGeneral(g => ({ ...g, currency: e.target.value }))}>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Default GST/Tax Rate (%)</label>
                <input type="number" className={inputCls} value={general.taxRate} onChange={e => setGeneral(g => ({ ...g, taxRate: e.target.value }))} />
              </div>
            </div>
          </div>

          <button onClick={() => handleSave('General')} className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 cursor-pointer mt-4">
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>

        {/* Gateways Settings */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-850">
            <Server className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Payment Gateways & Integrations</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={payment.mockMode} onChange={e => setPayment(p => ({ ...p, mockMode: e.target.checked }))} className="w-4 h-4 accent-indigo-500" />
              <div>
                <p className="text-sm font-bold text-slate-850 dark:text-white">Razorpay Mock Mode</p>
                <p className="text-[10px] text-slate-400">Uses simulation triggers if API credentials are dummy values</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={payment.codAllowed} onChange={e => setPayment(p => ({ ...p, codAllowed: e.target.checked }))} className="w-4 h-4 accent-indigo-500" />
              <div>
                <p className="text-sm font-bold text-slate-850 dark:text-white">Cash on Delivery (COD) Checkout</p>
                <p className="text-[10px] text-slate-400">Enable cash payment option during customer purchase flow</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={payment.stripeEnabled} onChange={e => setPayment(p => ({ ...p, stripeEnabled: e.target.checked }))} className="w-4 h-4 accent-indigo-500" />
              <div>
                <p className="text-sm font-bold text-slate-850 dark:text-white">Stripe Credit Card Checkout</p>
                <p className="text-[10px] text-slate-400">Manage Stripe payments gateway connection (Not Configured)</p>
              </div>
            </label>
          </div>

          <button onClick={() => handleSave('Payment Gateway')} className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 cursor-pointer mt-4">
            <Save className="w-4 h-4" /> Save Gateways
          </button>
        </div>

        {/* System info */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-850">
            <Database className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">System Information</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Environment</span>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">Development</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Database State</span>
              <p className="text-sm font-bold text-emerald-500 mt-0.5">CONNECTED</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">API Prefix</span>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">/api/v1</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Admin Authority</span>
              <p className="text-sm font-bold text-indigo-500 mt-0.5">{user?.name || 'Authorized'}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSettings;
