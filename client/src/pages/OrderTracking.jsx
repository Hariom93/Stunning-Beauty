import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, CheckCircle, Truck, Box, MapPin, CreditCard, 
  ArrowLeft, AlertCircle, Phone, ShieldCheck, HelpCircle, PackageOpen, Tag, Printer
} from 'lucide-react';
import { useOrderDetails, useCancelOrder } from '../hooks/useAdminApi';
import ConfirmModal from '../components/admin/ConfirmModal';

const STEPS = [
  { status: 'Pending', label: 'Order Placed', desc: 'Your order has been recorded' },
  { status: 'Confirmed', label: 'Order Confirmed', desc: 'Seller has accepted your order' },
  { status: 'Packed', label: 'Packed & Ready', desc: 'Item is packed and ready to ship' },
  { status: 'Shipped', label: 'In Transit', desc: 'Item is dispatched by courier' },
  { status: 'Delivered', label: 'Out for Delivery', desc: 'Order delivered successfully' }
];

const OrderTracking = () => {
  const { id } = useParams();
  const { data: order, isLoading, isError, error } = useOrderDetails(id);
  const cancelOrderMutation = useCancelOrder();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-slate-900 dark:text-slate-100">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
        <p className="text-slate-500 dark:text-slate-450 mb-6">{error?.response?.data?.error || 'Could not fetch order tracking details.'}</p>
        <Link to="/orders" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>
      </div>
    );
  }

  const handleCancelOrder = async () => {
    await cancelOrderMutation.mutateAsync(order._id);
    setCancelModalOpen(false);
  };

  // Determine current active step index
  const getActiveStepIndex = (status) => {
    if (status === 'Cancelled') return -1;
    const index = STEPS.findIndex(s => s.status === status);
    return index !== -1 ? index : 0;
  };

  const activeIndex = getActiveStepIndex(order.orderStatus);

  // Formatting helpers
  const formatDate = (dateStr, daysToAdd = 0) => {
    const d = new Date(dateStr);
    if (daysToAdd > 0) d.setDate(d.getDate() + daysToAdd);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-900 dark:text-slate-100">
      
      {/* Header Back Button */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-slate-500">
          Order ID: #{order._id.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Timeline & Courier Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tracking timeline card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-850 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-50 dark:border-slate-850/60 pb-4 mb-6">
              <div>
                <h1 className="text-xl font-black text-slate-950 dark:text-white">Track Order Status</h1>
                <p className="text-xs text-slate-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {order.orderStatus === 'Cancelled' ? (
                  <span className="text-xs font-bold px-3.5 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Order Cancelled
                  </span>
                ) : (
                  <span className="text-xs font-bold px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center gap-1.5 animate-pulse">
                    <ShieldCheck className="w-3.5 h-3.5" /> Live Tracking Active
                  </span>
                )}
              </div>
            </div>

            {/* Cancelled screen banner */}
            {order.orderStatus === 'Cancelled' ? (
              <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-4.5 mb-6 text-slate-700 dark:text-slate-350 text-sm flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white">This order was cancelled</p>
                  <p className="text-xs text-slate-450 mt-1">Any payment deducted will be refunded to your source account within 5-7 business days.</p>
                </div>
              </div>
            ) : (
              /* Flipkart vertical timeline */
              <div className="relative pl-8 space-y-8 py-2">
                {/* Timeline Bar Line */}
                <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800">
                  {/* Dynamic colored timeline filler */}
                  <div 
                    className="w-full bg-emerald-500 transition-all duration-1000 ease-out" 
                    style={{ height: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
                  />
                </div>

                {STEPS.map((step, idx) => {
                  const isDone = idx <= activeIndex;
                  const isCurrent = idx === activeIndex;
                  
                  return (
                    <div key={idx} className="relative flex gap-4 items-start">
                      {/* Step Circle Indicator */}
                      <div className={`absolute -left-8.5 w-7 h-7 rounded-full flex items-center justify-center shadow transition-all duration-300 ${
                        isDone 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 fill-current text-white stroke-emerald-500" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-left leading-normal">
                        <p className={`text-sm font-extrabold transition-colors duration-300 ${isDone ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">{step.desc}</p>
                        {isDone && (
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">
                            {formatDate(order.createdAt, idx * 1)} {/* mock progression */}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Courier journey detail logs (Meesho style) */}
          {order.orderStatus !== 'Cancelled' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-850 p-6 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-4 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-indigo-500" /> Shipment details
              </h2>
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-xs font-semibold leading-relaxed space-y-3.5 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-2.5">
                  <span className="text-slate-400">Courier Partner</span>
                  <span className="text-slate-800 dark:text-white font-bold">Delhivery Express Logistics</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-2.5">
                  <span className="text-slate-400">Tracking Number</span>
                  <span className="text-slate-800 dark:text-white font-mono font-bold hover:underline cursor-pointer">DX-{order._id.toUpperCase().slice(-12)}-IN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Delivery</span>
                  <span className="text-emerald-500 font-extrabold">{formatDate(order.createdAt, 3).split(',')[0]}</span>
                </div>
              </div>
            </div>
          )}

          {/* Purchased Items List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-850 p-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-5 flex items-center gap-1.5">
              <PackageOpen className="w-4 h-4 text-rose-500" /> Items in this Order
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex gap-4 py-3.5 first:pt-0 last:pb-0 items-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/60 p-1 flex items-center justify-center flex-shrink-0">
                    <img 
                      src={item.product?.thumbnail || item.product?.image || 'https://via.placeholder.com/100?text=Product'} 
                      alt={item.product?.title} 
                      className="max-h-full max-w-full object-contain" 
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <Link to={`/products/${item.product?._id || item.product}`} className="text-sm font-extrabold text-slate-800 dark:text-white hover:text-amber-500 line-clamp-1">
                      {item.product?.title || 'Product Item'}
                    </Link>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-white">₹{item.price.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-slate-400">per unit</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Columns - Details Cards */}
        <div className="space-y-6">
          
          {/* Shipping Address details */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-850 p-6 shadow-sm text-left">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-4.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-500" /> Delivery Address
            </h2>
            <div className="space-y-1 text-sm font-semibold">
              <p className="text-slate-900 dark:text-white font-extrabold">{order.shippingAddress?.name || 'Customer Name'}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{order.shippingAddress?.street}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Pincode: {order.shippingAddress?.zipCode || order.shippingAddress?.pincode}</p>
              
              <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>+91 {order.shippingAddress?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Pricing breakdown summary */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-850 p-6 shadow-sm text-left">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-4 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-500" /> Payment Summary
            </h2>
            
            <div className="space-y-3.5 text-xs font-semibold">
              <div className="flex justify-between text-slate-450">
                <span>Items Subtotal</span>
                <span className="text-slate-800 dark:text-white">₹{order.itemsPrice?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-450">
                <span>Tax (18% GST)</span>
                <span className="text-slate-800 dark:text-white">₹{order.taxPrice?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-450">
                <span>Shipping Fees</span>
                <span className="text-slate-850 dark:text-white">
                  {order.shippingPrice === 0 ? <span className="text-emerald-500 font-bold">FREE</span> : `₹${order.shippingPrice}`}
                </span>
              </div>
              
              {order.discountPrice > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-450">
                  <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Coupon Discount</span>
                  <span>- ₹{order.discountPrice?.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="border-t border-slate-150 dark:border-slate-800 pt-3 flex justify-between text-sm font-black text-slate-950 dark:text-white">
                <span>Grand Total</span>
                <span className="text-base">₹{order.totalPrice?.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center gap-2.5 mt-5 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850/60 text-[10px] font-bold">
                <div className="bg-slate-200 dark:bg-slate-800 p-1.5 rounded-lg text-slate-650 dark:text-slate-300">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-400 uppercase tracking-wider">Payment Method</p>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5">{order.paymentMethod} ({order.paymentStatus})</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Actions */}
          <div className="space-y-2">
            {/* Show cancel button if order status is Pending or Confirmed */}
            {['Pending', 'Confirmed'].includes(order.orderStatus) && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="w-full py-2.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-500 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                Cancel Order Shipment
              </button>
            )}

            {/* Help / Support Link */}
            <a
              href="mailto:support@stunningbeauty.in"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all border border-transparent"
            >
              <HelpCircle className="w-4 h-4" /> Need Support? Contact Us
            </a>
          </div>

        </div>
      </div>

      {/* Confirm cancel modal */}
      <ConfirmModal
        open={cancelModalOpen}
        title="Cancel Order Shipment?"
        message={`Are you sure you want to cancel order #${order._id.toUpperCase()}? Restored products will return to shop inventory immediately.`}
        onConfirm={handleCancelOrder}
        onCancel={() => setCancelModalOpen(false)}
        loading={cancelOrderMutation.isPending}
      />
    </div>
  );
};

export default OrderTracking;
