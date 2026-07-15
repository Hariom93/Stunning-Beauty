import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle } from 'lucide-react';

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-10 lg:p-16 text-center"
    >
      {/* Background circles */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full" />

      <div className="relative z-10 max-w-xl mx-auto">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-3">Stay in the Loop</h2>
        <p className="text-white/75 mb-8">
          Subscribe to get exclusive deals, new arrivals, and fashion tips delivered straight to your inbox.
        </p>

        {sent ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-6 py-4"
          >
            <CheckCircle className="w-5 h-5 text-green-300" />
            <span className="text-white font-semibold">You're subscribed! 🎉</span>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-5 py-3.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-white placeholder-white/50 outline-none focus:bg-white/25 focus:border-white/50 transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3.5 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all flex items-center gap-2 justify-center shadow-xl disabled:opacity-70"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Subscribe
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-white/50 text-xs mt-4">No spam, unsubscribe anytime. 100% free.</p>
      </div>
    </motion.div>
  );
};

export default NewsletterForm;
