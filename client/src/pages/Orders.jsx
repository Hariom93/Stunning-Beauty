import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronDown, Truck, CheckCircle, Clock, XCircle, Printer, Loader2, AlertCircle } from 'lucide-react';
import { useMyOrders, useCancelOrder } from '../hooks/useAdminApi';
import ConfirmModal from '../components/admin/ConfirmModal';

const STATUS_CONFIG = {
  Pending: { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-900/50', border: 'border-slate-200 dark:border-slate-700' },
  Confirmed: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50/50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-900/40' },
  Packed: { icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-50/50 dark:bg-indigo-950/20', border: 'border-indigo-200 dark:border-indigo-900/40' },
  Shipped: { icon: Truck, color: 'text-purple-500', bg: 'bg-purple-50/50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-900/40' },
  Delivered: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-900/40' },
  Cancelled: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50/50 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-900/40' },
};

const Orders = () => {
  const [expanded, setExpanded] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  // Fetch user orders
  const { data: orders = [], isLoading, isError, error } = useMyOrders();
  const cancelOrderMutation = useCancelOrder();

  const handleCancelOrder = async () => {
    if (!cancelTarget) return;
    await cancelOrderMutation.mutateAsync(cancelTarget._id);
    setCancelTarget(null);
  };

  // print Invoice helper
  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    const itemsHtml = order.items.map(item => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-size: 14px;">${item.product?.title || 'Product Item'}</td>
        <td style="padding: 12px; font-size: 14px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; font-size: 14px; text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
        <td style="padding: 12px; font-size: 14px; text-align: right; font-weight: bold;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <title>Invoice - #${order._id.toUpperCase()}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; margin: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 800; color: #0f172a; }
            .logo span { font-size: 14px; font-weight: normal; color: #64748b; margin-left: 6px; }
            .title { font-size: 28px; font-weight: 900; text-align: right; text-transform: uppercase; color: #475569; }
            .details { display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 14px; line-height: 1.6; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .table th { background-color: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 12px; font-size: 12px; text-transform: uppercase; text-align: left; color: #64748b; }
            .totals { margin-left: auto; width: 300px; font-size: 14px; line-height: 2; }
            .totals .row { display: flex; justify-content: space-between; }
            .totals .grand-total { font-size: 18px; font-weight: 900; border-top: 2px solid #e2e8f0; padding-top: 10px; margin-top: 10px; color: #1e1b4b; }
            .footer { text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 60px; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">Stunning Beauty<span>by Vandana Jain</span></div>
              <p style="font-size: 12px; color: #64748b; margin-top: 4px;">Premium E-Commerce Platform</p>
            </div>
            <div>
              <div class="title">Invoice</div>
              <p style="font-size: 12px; color: #64748b; text-align: right; margin-top: 4px;">Invoice Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
          
          <div class="details">
            <div>
              <h3 style="margin-top: 0; color: #475569;">Billed To:</h3>
              <strong>${order.shippingAddress?.name || 'Customer'}</strong><br/>
              Phone: ${order.shippingAddress?.phone || 'N/A'}<br/>
              Address: ${order.shippingAddress?.streetAddress || 'N/A'}<br/>
              ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} — ${order.shippingAddress?.zipCode || ''}
            </div>
            <div style="text-align: right;">
              <h3 style="margin-top: 0; color: #475569;">Order Details:</h3>
              Order ID: <strong>#${order._id.toUpperCase()}</strong><br/>
              Payment Method: ${order.paymentMethod}<br/>
              Payment Status: ${order.paymentStatus}<br/>
              Delivery Status: ${order.orderStatus}
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th style="width: 50%;">Product Details</th>
                <th style="text-align: center; width: 10%;">Qty</th>
                <th style="text-align: right; width: 20%;">Price</th>
                <th style="text-align: right; width: 20%;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div class="row">
              <span>Subtotal:</span>
              <span>₹${order.itemsPrice.toLocaleString('en-IN')}</span>
            </div>
            <div class="row">
              <span>GST (18%):</span>
              <span>₹${order.taxPrice.toLocaleString('en-IN')}</span>
            </div>
            <div class="row">
              <span>Shipping:</span>
              <span>${order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice.toLocaleString('en-IN')}`}</span>
            </div>
            ${order.discountPrice > 0 ? `
              <div class="row" style="color: #10b981; font-weight: bold;">
                <span>Discount Applied:</span>
                <span>- ₹${order.discountPrice.toLocaleString('en-IN')}</span>
              </div>
            ` : ''}
            <div class="row grand-total">
              <span>Total:</span>
              <span>₹${order.totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div class="footer">
             <p>Thank you for choosing Stunning Beauty! If you have any questions, please contact support@stunningbeauty.in.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-900 dark:text-slate-100">
      <h1 className="section-heading text-slate-900 dark:text-white mb-8">My Orders</h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
          <AlertCircle className="w-10 h-10 text-rose-500" />
          <p className="font-semibold text-lg text-slate-800 dark:text-slate-200">Failed to load orders</p>
          <p className="text-sm">{error.response?.data?.error || error.message}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
          <Package className="w-16 h-16 text-slate-350 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No orders yet</h2>
          <p className="text-slate-400 text-sm">Your completed orders will appear here. Go grab some awesome products!</p>
          <Link to="/products" className="btn-primary mt-6">Shop Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG['Pending'];
            const StatusIcon = cfg.icon;
            const isOpen = expanded === order._id;

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : order._id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-750/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center`}>
                      <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800 dark:text-white font-mono text-sm">
                        #{order._id.toUpperCase().slice(-8)}
                      </p>
                      <p className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{order.orderStatus}</span>
                    <span className="font-extrabold text-slate-900 dark:text-white hidden sm:block">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    className="border-t border-slate-100 dark:border-slate-700 px-5 py-4 space-y-4"
                  >
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex-shrink-0 flex items-center justify-center p-1">
                          <img src={item.product?.thumbnail || item.product?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80'} alt={item.product?.title} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link to={`/products/${item.product?._id || item.product}`} className="text-sm font-semibold text-slate-800 dark:text-white hover:text-indigo-600 line-clamp-1">
                            {item.product?.title || 'Product Item'}
                          </Link>
                          <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                    <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-slate-700 text-sm">
                      <span className="font-bold text-slate-700 dark:text-slate-200">Total Bill (inc. Tax & Shipping)</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-base">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                      {order.orderStatus === 'Delivered' && (
                        <Link to={`/products/${order.items[0]?.product?._id || order.items[0]?.product}`} className="text-xs font-bold text-indigo-600 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 px-4 py-2 rounded-xl transition-colors cursor-pointer">
                          Write Review
                        </Link>
                      )}
                      
                      <button 
                        onClick={() => handlePrintInvoice(order)}
                        className="text-xs font-bold text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> Download Invoice
                      </button>

                      <Link 
                        to={`/orders/${order._id}`}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-850 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        Track Shipment
                      </Link>

                      {['Pending', 'Confirmed'].includes(order.orderStatus) && (
                        <button 
                          onClick={() => setCancelTarget(order)}
                          className="text-xs font-bold text-rose-600 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-4 py-2 rounded-xl transition-colors cursor-pointer ml-auto"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Cancel Order Confirm Modal */}
      <ConfirmModal
        open={!!cancelTarget}
        title="Cancel Order?"
        message={`Are you sure you want to cancel order #${cancelTarget?._id.toUpperCase()}? Restored items will return to the inventory.`}
        onConfirm={handleCancelOrder}
        onCancel={() => setCancelTarget(null)}
        loading={cancelOrderMutation.isPending}
      />
    </div>
  );
};

export default Orders;
