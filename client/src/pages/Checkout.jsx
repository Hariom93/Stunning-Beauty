import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useApplyCoupon
} from '../hooks/useAdminApi';
import api from '../api';
import {
  CreditCard, MapPin, Phone, User, CheckCircle, Package, AlertCircle, Sparkles, Tag, X, Loader2, Plus, Edit2, Trash2, Printer, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = ['Shipping Address', 'Review Order', 'Payment Method', 'Success'];

const Checkout = () => {
  const { cartItems, clearCart, removeFromCart } = useContext(CartContext);
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  // State Management
  const [step, setStep] = useState(0);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');

  // Address form fields
  const [addressForm, setAddressForm] = useState({
    title: 'Home',
    streetAddress: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
    phone: '',
    isDefault: false
  });

  // Coupon states
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Address Queries & Mutations
  const { data: addresses = [], isLoading: addressesLoading } = useAddresses();
  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();
  const applyCouponMutation = useApplyCoupon();

  // Redirect if guest/empty cart
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast.error('Please login to proceed to checkout.');
        navigate('/login?redirect=checkout');
      }
    }
  }, [user, authLoading, navigate]);

  // Synchronize cart with server upon loading Checkout
  useEffect(() => {
    const syncCart = async () => {
      if (user && cartItems.length > 0) {
        let hasInvalidItems = false;
        try {
          await api.delete('/cart');
          for (const item of cartItems) {
            if (item.product?._id) {
              try {
                await api.post('/cart', {
                  productId: item.product._id,
                  quantity: item.quantity
                });
              } catch (postErr) {
                if (postErr.response?.status === 404) {
                  removeFromCart(item.product._id);
                  hasInvalidItems = true;
                }
                console.warn(`Failed to sync product ${item.product._id} (likely deleted from DB):`, postErr);
              }
            }
          }
          if (hasInvalidItems) {
            toast.error("Some unavailable products were removed from your cart.");
          }
        } catch (err) {
          console.error('Failed to sync cart to database:', err);
        }
      }
    };

    if (user && !authLoading) {
      syncCart();
    }
  }, [user, authLoading]);

  // Auto-select default address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr._id);
    }
  }, [addresses, selectedAddressId]);

  // Price calculations
  const subtotal = cartItems.reduce((sum, i) => {
    const itemPrice = i.product.discountPrice > 0 ? i.product.discountPrice : i.product.price;
    return sum + itemPrice * i.quantity;
  }, 0);
  const shipping = subtotal > 1000 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + shipping + tax - discountAmount;

  // Estimated delivery date (4 days from today)
  const getDeliveryDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  console.log('[Checkout Render] step:', step, 'selectedAddressId:', selectedAddressId, 'loading:', loading, 'cartItems count:', cartItems.length);

  // Handlers
  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (addressForm.phone.length < 10) {
      toast.error('Contact phone number must be at least 10 digits.');
      return;
    }
    if (addressForm.zipCode.length < 6) {
      toast.error('Pincode must be at least 6 digits.');
      return;
    }

    setLoading(true);
    try {
      if (editingAddress) {
        await updateAddressMutation.mutateAsync({
          id: editingAddress._id,
          ...addressForm
        });
        setEditingAddress(null);
      } else {
        const res = await createAddressMutation.mutateAsync(addressForm);
        if (res.data?.address) {
          setSelectedAddressId(res.data.address._id);
        }
      }
      setIsAddressFormOpen(false);
      setAddressForm({
        title: 'Home',
        streetAddress: '',
        city: '',
        state: '',
        country: 'India',
        zipCode: '',
        phone: '',
        isDefault: false
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddressClick = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      title: addr.title,
      streetAddress: addr.streetAddress,
      city: addr.city,
      state: addr.state,
      country: addr.country,
      zipCode: addr.zipCode,
      phone: addr.phone,
      isDefault: addr.isDefault
    });
    setIsAddressFormOpen(true);
  };

  const handleDeleteAddressClick = async (addrId) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddressMutation.mutateAsync(addrId);
        if (selectedAddressId === addrId) {
          setSelectedAddressId('');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    try {
      const res = await applyCouponMutation.mutateAsync({
        code: couponInput.trim(),
        orderAmount: subtotal
      });
      setAppliedCoupon(res.data.coupon);
      setDiscountAmount(res.data.discountAmount);
      toast.success(`Coupon "${couponInput.toUpperCase()}" applied successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired coupon code.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponInput('');
  };

  // Razorpay dynamic checkout loader
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckoutSubmit = async () => {
    console.log('--- CHECKOUT SUBMIT INITIATED ---');
    console.log('Cart items count:', cartItems.length);
    console.log('Selected address ID:', selectedAddressId);
    console.log('Addresses list:', addresses);
    
    if (cartItems.length === 0) {
      console.warn('Checkout submit aborted: cart is empty');
      toast.error('Your cart is empty.');
      return;
    }
    const activeAddress = addresses.find(a => a._id === selectedAddressId);
    console.log('Active address resolved:', activeAddress);
    if (!activeAddress) {
      console.warn('Checkout submit aborted: activeAddress is null/undefined');
      toast.error('Please select or add a delivery address to continue.');
      return;
    }

    setLoading(true);

    const shippingAddress = {
      streetAddress: activeAddress.streetAddress,
      city: activeAddress.city,
      state: activeAddress.state,
      zipCode: activeAddress.zipCode,
      country: activeAddress.country,
      phone: activeAddress.phone
    };
    console.log('Shipping address payload:', shippingAddress);
    console.log('Payment method:', paymentMethod);

    try {
      console.log('Calling POST /orders/checkout API...');
      const { data: checkoutData } = await api.post('/orders/checkout', {
        shippingAddress,
        paymentMethod,
        couponCode: appliedCoupon?.code
      });
      console.log('Checkout API Response:', checkoutData);

      // --- COD CHECKOUT FLOW ---
      if (paymentMethod === 'COD') {
        const orderRes = checkoutData.order;
        setCreatedOrder(orderRes);
        clearCart();
        setStep(3);
        toast.success('Order placed successfully using Cash on Delivery!');
      }

      // --- RAZORPAY CHECKOUT FLOW ---
      if (paymentMethod === 'Razorpay') {
        console.log('Razorpay flow starting. Loading script...');
        const loaded = await loadRazorpay();
        if (!loaded) {
          toast.error('Failed to load payment gateway. Please try again.');
          setLoading(false);
          return;
        }

        const options = {
          key: checkoutData.razorpayOrder.key,
          amount: checkoutData.razorpayOrder.amount,
          currency: checkoutData.razorpayOrder.currency,
          name: 'ShopSphere',
          description: 'Secure checkout payment',
          order_id: checkoutData.razorpayOrder.id,
          handler: async function (response) {
            setLoading(true);
            try {
              // Verify payment on backend
              const verifyRes = await api.post('/orders/verify-payment', {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: checkoutData.orderId
              });

              if (verifyRes.data.success) {
                setCreatedOrder(verifyRes.data.order);
                clearCart();
                setStep(3);
                toast.success('Payment verified & order placed!');
              } else {
                toast.error('Payment verification failed.');
              }
            } catch (err) {
              toast.error(err.response?.data?.error || 'Payment verification failed.');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: user?.name || '',
            contact: activeAddress.phone,
            email: user?.email || '',
          },
          theme: {
            color: '#6366f1'
          },
          modal: {
            ondismiss: function () {
              toast.error('Payment cancelled by user.');
              setLoading(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error('Checkout error caught inside catch block:', err);
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
      }
      toast.error(err.response?.data?.error || 'Checkout process failed.');
    } finally {
      setLoading(false);
    }
  };

  // Print tax invoice helper
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
              <div class="title">Tax Invoice</div>
              <p style="font-size: 12px; color: #64748b; text-align: right; margin-top: 4px;">Invoice Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
          
          <div class="details">
            <div>
              <h3 style="margin-top: 0; color: #475569;">Billed To:</h3>
              <strong>${order.shippingAddress?.name || user?.name || 'Customer'}</strong><br/>
              Phone: ${order.shippingAddress?.phone || 'N/A'}<br/>
              Address: ${order.shippingAddress?.streetAddress || 'N/A'}<br/>
              ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} — ${order.shippingAddress?.zipCode || ''}
            </div>
            <div style="text-align: right;">
              <h3 style="margin-top: 0; color: #475569;">Order Information:</h3>
              Order Number: <strong>#${order._id.toUpperCase()}</strong><br/>
              Payment Mode: ${order.paymentMethod}<br/>
              Payment Status: ${order.paymentStatus}<br/>
              Delivery Status: ${order.orderStatus}
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th style="width: 50%;">Item Specification</th>
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
                <span>Coupon Discount:</span>
                <span>- ₹${order.discountPrice.toLocaleString('en-IN')}</span>
              </div>
            ` : ''}
            <div class="row grand-total">
              <span>Grand Total:</span>
              <span>₹${order.totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div class="footer">
            <p>This is a computer-generated tax invoice. No signature is required.</p>
            <p>If you have any questions, write to support@stunningbeauty.in.</p>
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

  // Skeletons during Loading
  if (addressesLoading && step === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading checkout information...</p>
      </div>
    );
  }

  // Confirmation Success Page
  if (step === 3 && createdOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-slate-900 dark:text-slate-100">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Order Confirmed! 🎉</h1>
            <p className="text-slate-500 text-sm">Thank you for your order, #{createdOrder._id.toUpperCase().slice(-8)}</p>
          </motion.div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-slate-100 dark:border-slate-700 pb-6">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Shipping details:</p>
              <strong className="text-sm block">{user?.name}</strong>
              <p className="text-sm text-slate-500 mt-1">
                {createdOrder.shippingAddress?.streetAddress}, {createdOrder.shippingAddress?.city}<br/>
                {createdOrder.shippingAddress?.state} — {createdOrder.shippingAddress?.zipCode}<br/>
                Contact: {createdOrder.shippingAddress?.phone}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Billing Summary:</p>
              <div className="space-y-1 text-sm text-slate-500">
                <div className="flex justify-between"><span>Items Price:</span><span>₹{createdOrder.itemsPrice}</span></div>
                <div className="flex justify-between"><span>GST (18%):</span><span>₹{createdOrder.taxPrice}</span></div>
                <div className="flex justify-between"><span>Shipping:</span><span>{createdOrder.shippingPrice === 0 ? 'FREE' : `₹${createdOrder.shippingPrice}`}</span></div>
                {createdOrder.discountPrice > 0 && <div className="flex justify-between text-emerald-500"><span>Discount:</span><span>- ₹{createdOrder.discountPrice}</span></div>}
                <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-100 dark:border-slate-700">
                  <span>Grand Total:</span><span>₹{createdOrder.totalPrice}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
            <button
              onClick={() => handlePrintInvoice(createdOrder)}
              className="btn-primary flex items-center gap-2 justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl py-3 px-6 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Download Invoice
            </button>
            <Link
              to={`/orders/${createdOrder._id}`}
              className="btn-secondary flex items-center gap-2 justify-center border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750/30 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl py-3 px-6"
            >
              <Package className="w-4 h-4" /> Live Tracking
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-900 dark:text-slate-100">
      <h1 className="section-heading text-slate-900 dark:text-white mb-8">Secure Checkout</h1>

      {/* Steps indicators */}
      <div className="flex items-center justify-between mb-10 overflow-x-auto pb-2 scrollbar-none">
        {STEPS.slice(0, 3).map((label, i) => (
          <React.Fragment key={i}>
            <button
              disabled={i > step}
              onClick={() => setStep(i)}
              className="flex items-center gap-2 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed group outline-none"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                i === step
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                  : i < step
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-semibold transition-colors ${
                i === step ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-455 dark:text-slate-400 group-hover:text-indigo-500'
              }`}>{label}</span>
            </button>
            {i < 2 && <ChevronRight className="w-4 h-4 text-slate-350 flex-shrink-0 mx-2" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Steps content */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* STEP 0: Address Management */}
            {step === 0 && (
              <motion.div
                key="step-address"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-250/20 pb-3">
                  <h2 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-500" /> Delivery Address
                  </h2>
                  {!isAddressFormOpen && (
                    <button
                      onClick={() => {
                        setEditingAddress(null);
                        setAddressForm({
                          title: 'Home',
                          streetAddress: '',
                          city: '',
                          state: '',
                          country: 'India',
                          zipCode: '',
                          phone: '',
                          isDefault: false
                        });
                        setIsAddressFormOpen(true);
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-455 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Address
                    </button>
                  )}
                </div>

                {isAddressFormOpen ? (
                  <form onSubmit={handleSaveAddress} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                      {editingAddress ? 'Modify Address' : 'Register New Shipping Address'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Address Tag (e.g. Home, Office) *</label>
                        <input name="title" value={addressForm.title} onChange={handleAddressFormChange} required placeholder="Home" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 text-slate-800 dark:text-slate-200" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Contact Phone Number *</label>
                        <input name="phone" value={addressForm.phone} onChange={handleAddressFormChange} required placeholder="9876543210" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 text-slate-800 dark:text-slate-200" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Street Address *</label>
                      <input name="streetAddress" value={addressForm.streetAddress} onChange={handleAddressFormChange} required placeholder="Building No., Street, Locality..." className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">City *</label>
                        <input name="city" value={addressForm.city} onChange={handleAddressFormChange} required placeholder="Mumbai" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 text-slate-800 dark:text-slate-200" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">State *</label>
                        <input name="state" value={addressForm.state} onChange={handleAddressFormChange} required placeholder="Maharashtra" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 text-slate-800 dark:text-slate-200" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Pincode *</label>
                        <input name="zipCode" value={addressForm.zipCode} onChange={handleAddressFormChange} required placeholder="400001" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 text-slate-800 dark:text-slate-200" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <input type="checkbox" id="isDefault" name="isDefault" checked={addressForm.isDefault} onChange={handleAddressFormChange} className="w-4 h-4 text-indigo-650 border-slate-200 rounded outline-none" />
                      <label htmlFor="isDefault" className="text-xs text-slate-500 cursor-pointer">Set this as my default delivery address</label>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button type="button" onClick={() => setIsAddressFormOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 dark:text-slate-200 text-slate-655 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer">Cancel</button>
                      <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer">
                        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Save Address
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {addresses.length === 0 ? (
                      <div className="text-center py-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                        <MapPin className="w-12 h-12 text-slate-350 mx-auto mb-2" />
                        <h3 className="font-bold text-slate-700 dark:text-slate-200">No saved addresses</h3>
                        <p className="text-xs text-slate-400 mt-1">Please register a shipping address to deliver your items.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map(addr => {
                          const isSelected = selectedAddressId === addr._id;
                          return (
                            <div
                              key={addr._id}
                              onClick={() => setSelectedAddressId(addr._id)}
                              className={`bg-white dark:bg-slate-800 border rounded-2xl p-4 cursor-pointer relative transition-all shadow-sm flex flex-col justify-between ${
                                isSelected
                                  ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-50/50 dark:ring-none'
                                  : 'border-slate-200 dark:border-slate-750 hover:border-slate-300'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                                    isSelected ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-655 dark:bg-slate-700 dark:text-slate-300'
                                  }`}>
                                    {addr.title}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="text-[10px] text-emerald-500 font-extrabold uppercase">Default</span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-350 line-clamp-2 mt-2">
                                  {addr.streetAddress}, {addr.city}, {addr.state} — {addr.zipCode}
                                </p>
                                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5" /> {addr.phone}
                                </p>
                              </div>

                              <div className="flex justify-end gap-2 mt-4 border-t border-slate-100 dark:border-slate-700/80 pt-2.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditAddressClick(addr);
                                  }}
                                  className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-250 cursor-pointer border-0 outline-none"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAddressClick(addr._id);
                                  }}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 rounded-lg text-rose-550 cursor-pointer border-0 outline-none"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {addresses.length > 0 && (
                      <button
                        onClick={() => {
                          if (!selectedAddressId) {
                            toast.error('Please select or add a delivery address to continue.');
                            return;
                          }
                          setStep(1);
                        }}
                        className="btn-primary w-full py-3.5 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-indigo-150 cursor-pointer"
                      >
                        Deliver to this Address <ChevronRight className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 1: Review Order & Coupons */}
            {step === 1 && (
              <motion.div
                key="step-review"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-250/20 pb-3">
                  <h2 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-indigo-500" /> Review Order Items
                  </h2>
                </div>

                <div className="space-y-4">
                  {cartItems.map(item => {
                    const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
                    return (
                      <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex gap-4 border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 flex-shrink-0 flex items-center justify-center p-1">
                          <img src={item.product.thumbnail || item.product.image} alt={item.product.title} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <strong className="text-sm block text-slate-800 dark:text-white line-clamp-1">{item.product.title || item.product.name}</strong>
                          <span className="text-xs text-slate-450 capitalize">{item.product.category?.name || item.product.category}</span>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-slate-500">Qty: <strong>{item.quantity}</strong></span>
                            <span className="font-bold text-sm text-slate-900 dark:text-white">₹{(price * item.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Address Card */}
                {addresses.find(a => a._id === selectedAddressId) && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-250/30 dark:border-slate-700 shadow-sm">
                    <p className="text-xs font-semibold text-slate-450 uppercase mb-2">Delivery Address Details:</p>
                    {(() => {
                      const addr = addresses.find(a => a._id === selectedAddressId);
                      return (
                        <>
                          <strong className="text-sm">{user?.name}</strong>
                          <p className="text-xs text-slate-550 mt-1">
                            {addr.streetAddress}, {addr.city}, {addr.state} — {addr.zipCode}<br/>
                            Contact Phone: {addr.phone}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                )}

                <button
                  onClick={() => setStep(2)}
                  className="btn-primary w-full py-3.5 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-indigo-150 cursor-pointer"
                >
                  Proceed to Payment <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </motion.div>
            )}

            {/* STEP 2: Payment Method */}
            {step === 2 && (
              <motion.div
                key="step-payment"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-250/20 pb-3">
                  <h2 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-500" /> Select Payment Method
                  </h2>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'Razorpay', label: 'Razorpay Secure Checkout', desc: 'Pay via Cards, UPI, Netbanking, or Wallet details.', icon: CreditCard },
                    { id: 'COD', label: 'Cash on Delivery (COD)', desc: 'Pay with cash upon delivery of package.', icon: Package }
                  ].map(m => {
                    const isSelected = paymentMethod === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`bg-white dark:bg-slate-800 border rounded-2xl p-4 cursor-pointer transition-all shadow-sm flex items-center gap-4 ${
                          isSelected
                            ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-50/50 dark:ring-none'
                            : 'border-slate-200 dark:border-slate-750 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/25 dark:text-indigo-400' : 'bg-slate-50 text-slate-500 dark:bg-slate-700/60 dark:text-slate-300'
                        }`}>
                          <m.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <strong className="text-sm block">{m.label}</strong>
                          <span className="text-xs text-slate-400">{m.desc}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-indigo-650 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleCheckoutSubmit}
                  disabled={loading}
                  className="btn-primary w-full py-4 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-indigo-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Processing Payment...
                    </>
                  ) : (
                    <>
                      Confirm & Pay ₹{total.toLocaleString('en-IN')}
                    </>
                  )}
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Right Side: Order summary details */}
        {step < 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm sticky top-24">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-4">Pricing Invoice</h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-455">Subtotal:</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-455">GST (18%):</span>
                  <span className="font-semibold">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-455">Shipping charges:</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-emerald-500' : ''}`}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-500 font-semibold animate-fade-in">
                    <span>Coupon discount:</span>
                    <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Coupon form */}
              {appliedCoupon ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-3 flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <div>
                      <strong className="text-xs text-emerald-700 dark:text-emerald-400 font-bold font-mono">{appliedCoupon.code}</strong>
                      <p className="text-[10px] text-emerald-650/85">Applied successfully</p>
                    </div>
                  </div>
                  <button onClick={handleRemoveCoupon} className="p-1 bg-white dark:bg-slate-800 rounded-full hover:bg-emerald-150 text-slate-500 cursor-pointer border-0 outline-none">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-5">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-indigo-400 text-slate-800 dark:text-slate-200 uppercase font-bold font-mono"
                    />
                  </div>
                  <button type="submit" disabled={applyCouponMutation.isPending} className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl transition-colors cursor-pointer border-0 outline-none">
                    {applyCouponMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                  </button>
                </form>
              )}

              <div className="border-t border-slate-100 dark:border-slate-700/80 pt-4 mb-4">
                <div className="flex justify-between font-extrabold text-lg text-slate-900 dark:text-white">
                  <span>Grand Total:</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                {shipping === 0 && (
                  <p className="text-[10px] text-emerald-500 font-semibold mt-1">🎉 Shipping is on us (Free above ₹1000)</p>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 text-left space-y-1 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-450 font-semibold uppercase">Estimated Delivery:</p>
                  <p className="text-xs text-slate-650 dark:text-slate-300 font-bold">{getDeliveryDateString()}</p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Checkout;
