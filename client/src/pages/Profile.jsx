import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Camera, Save } from 'lucide-react';

const Profile = () => {
  const { user, login, token } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: user?.name || 'Guest User',
    email: user?.email || 'guest@stunningbeauty.in',
    phone: '',
    city: '',
    bio: '',
  });
  const [saved, setSaved] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="section-heading text-slate-900 dark:text-white mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar card */}
        <div className="text-center">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="relative inline-block mb-4">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-5xl font-black text-white shadow-xl">
                {form.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors">
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">{form.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{form.email}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-3 gap-2 text-center">
              {[['12', 'Orders'], ['5', 'Reviews'], ['3', 'Wishlist']].map(([val, label]) => (
                <div key={label}>
                  <p className="font-extrabold text-slate-900 dark:text-white">{val}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSave} className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
            <h2 className="font-extrabold text-lg text-slate-900 dark:text-white mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { name: 'name', label: 'Full Name', icon: User, placeholder: 'Your name' },
                { name: 'email', label: 'Email', icon: Mail, placeholder: 'Your email', type: 'email' },
                { name: 'phone', label: 'Phone', icon: Phone, placeholder: '+91 9876543210' },
                { name: 'city', label: 'City', icon: MapPin, placeholder: 'Mumbai' },
              ].map(({ name, label, icon: Icon, placeholder, type = 'text' }) => (
                <div key={name}>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input name={name} type={type} value={form[name]} onChange={handleChange} placeholder={placeholder}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all" />
                  </div>
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Bio</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all resize-none" />
              </div>
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              className={`mt-6 flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm transition-all ${
                saved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-indigo-500/30'
              }`}
            >
              <Save className="w-4 h-4" />
              {saved ? 'Saved!' : 'Save Changes'}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
