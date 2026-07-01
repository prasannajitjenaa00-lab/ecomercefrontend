import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiCheck, FiPlus, FiCreditCard, FiSmartphone, FiTruck } from 'react-icons/fi';
import api from '../../utils/api';
import { cartActions } from '../../store/slices/cartSlice';
import { formatCurrency, calculateCartTotals } from '../../utils/helpers';
import { toast } from 'react-toastify';

const STEPS = ['Address', 'Shipping', 'Payment', 'Review'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { items, coupon, couponDiscount } = useSelector(s => s.cart);
  const activeItems = items.filter(i => !i.savedForLater);

  const [step, setStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0] || null);
  const [showAddressForm, setShowAddressForm] = useState(!user?.addresses?.length);
  const [newAddress, setNewAddress] = useState({ name: user?.name || '', phone: user?.phone || '', street: '', city: '', state: '', pincode: '', type: 'home' });
  const [shippingOption, setShippingOption] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [processing, setProcessing] = useState(false);

  const shippingCost = shippingOption === 'express' ? 149 : calculateCartTotals(items).shipping;
  const { subtotal, gst } = calculateCartTotals(items);
  const total = subtotal + gst + shippingCost - couponDiscount;

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/users/address', newAddress);
      const added = data.addresses[data.addresses.length - 1];
      setSelectedAddress(added);
      setShowAddressForm(false);
      toast.success('Address added');
    } catch { toast.error('Failed to save address'); }
  };

  const loadRazorpay = () => new Promise(res => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => res(true);
    script.onerror = () => res(false);
    document.body.appendChild(script);
  });

  const handleRazorpay = async () => {
    const ok = await loadRazorpay();
    if (!ok) { toast.error('Razorpay failed to load'); return; }
    const { data: rzpOrder } = await api.post('/payment/razorpay/order', { amount: total });
    return new Promise((resolve, reject) => {
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: rzpOrder.order.amount,
        currency: 'INR',
        name: 'Overrated',
        description: 'Fashion Purchase',
        order_id: rzpOrder.order.id,
        handler: resolve,
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: '#d4af37' },
        modal: { ondismiss: reject }
      };
      new window.Razorpay(options).open();
    });
  };

  const handleStripe = async () => {
    const { data } = await api.post('/payment/stripe/intent', { amount: total });
    return { stripePaymentIntentId: data.clientSecret.split('_secret')[0], stripeClientSecret: data.clientSecret };
  };

  const placeOrder = async () => {
    if (!selectedAddress) { toast.warning('Please select a delivery address'); return; }
    setProcessing(true);
    try {
      let paymentDetails = {};
      if (paymentMethod === 'razorpay') {
        try {
          const rzpResult = await handleRazorpay();
          await api.post('/payment/razorpay/verify', rzpResult);
          paymentDetails = { razorpayOrderId: rzpResult.razorpay_order_id, razorpayPaymentId: rzpResult.razorpay_payment_id, razorpaySignature: rzpResult.razorpay_signature };
        } catch { toast.error('Payment cancelled or failed'); setProcessing(false); return; }
      } else if (paymentMethod === 'stripe') {
        paymentDetails = await handleStripe();
      }

      const orderData = {
        items: activeItems.map(i => ({ product: i.product._id, name: i.product.name, image: i.product.images?.[0]?.url, price: i.price, quantity: i.quantity, size: i.size, color: i.color })),
        shippingAddress: selectedAddress,
        paymentMethod,
        paymentDetails,
        subtotal,
        shippingCost,
        gstAmount: gst,
        discountAmount: 0,
        couponDiscount,
        totalAmount: total,
        couponId: coupon?._id
      };

      const { data } = await api.post('/orders', orderData);
      dispatch(cartActions.clearCart());
      navigate(`/order-success/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order placement failed');
    } finally { setProcessing(false); }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-dark-950 pt-24">
      <div className="container mx-auto px-4 lg:px-8 py-10 max-w-5xl">
        <h1 className="font-display text-4xl text-dark-950 dark:text-white mb-10">Checkout</h1>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-12">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <button onClick={() => i < step && setStep(i)}
                className={`flex flex-col items-center ${i <= step ? 'cursor-pointer' : 'cursor-default'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-body font-bold text-sm transition-all ${i < step ? 'bg-gold-400 text-dark-950' : i === step ? 'bg-dark-950 dark:bg-white text-white dark:text-dark-950 ring-2 ring-gold-400 ring-offset-2' : 'bg-stone-200 dark:bg-dark-700 text-stone-400'}`}>
                  {i < step ? <FiCheck size={18} /> : i + 1}
                </div>
                <span className={`mt-2 font-body text-xs font-medium ${i === step ? 'text-dark-950 dark:text-white' : 'text-stone-400'}`}>{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 mb-5 transition-colors ${i < step ? 'bg-gold-400' : 'bg-stone-200 dark:bg-dark-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 0: Address */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h2 className="font-heading text-xl text-dark-950 dark:text-white">Delivery Address</h2>
                {user?.addresses?.map(addr => (
                  <div key={addr._id} onClick={() => setSelectedAddress(addr)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress?._id === addr._id ? 'border-gold-400 bg-gold-50 dark:bg-gold-900/10' : 'border-stone-200 dark:border-dark-700 hover:border-gold-300 bg-white dark:bg-dark-900'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-body font-semibold text-dark-900 dark:text-white">{addr.name}</span>
                          <span className="font-body text-xs border border-stone-300 dark:border-dark-600 px-2 py-0.5 rounded capitalize text-stone-500">{addr.type}</span>
                          {addr.isDefault && <span className="font-body text-xs text-gold-400 border border-gold-300 px-2 py-0.5 rounded">Default</span>}
                        </div>
                        <p className="font-body text-sm text-stone-500 dark:text-stone-400">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="font-body text-sm text-stone-500 dark:text-stone-400 mt-0.5">📞 {addr.phone}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 mt-1 ${selectedAddress?._id === addr._id ? 'border-gold-400 bg-gold-400' : 'border-stone-300'}`} />
                    </div>
                  </div>
                ))}

                {showAddressForm ? (
                  <form onSubmit={handleAddAddress} className="bg-white dark:bg-dark-900 rounded-xl p-6 border border-stone-200 dark:border-dark-700 space-y-4">
                    <h3 className="font-heading text-base text-dark-950 dark:text-white">New Address</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[['name', 'Full Name'], ['phone', 'Phone Number'], ['street', 'Street Address'], ['city', 'City'], ['state', 'State'], ['pincode', 'Pincode']].map(([field, label]) => (
                        <input key={field} type="text" placeholder={label} value={newAddress[field]} required
                          onChange={e => setNewAddress(p => ({ ...p, [field]: e.target.value }))}
                          className={`border border-stone-200 dark:border-dark-700 rounded-lg px-4 py-3 text-sm font-body bg-transparent dark:text-white focus:outline-none focus:border-gold-400 ${field === 'street' ? 'col-span-2' : ''}`} />
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      {['home', 'work', 'other'].map(t => (
                        <button key={t} type="button" onClick={() => setNewAddress(p => ({ ...p, type: t }))}
                          className={`px-4 py-2 text-xs font-body rounded-lg border transition-colors capitalize ${newAddress.type === t ? 'border-gold-400 bg-gold-400/10 text-gold-400' : 'border-stone-200 dark:border-dark-700 text-stone-400'}`}>{t}</button>
                      ))}
                    </div>
                    <div className="flex space-x-3">
                      <button type="submit" className="btn-gold rounded-lg text-sm">Save Address</button>
                      {user?.addresses?.length > 0 && <button type="button" onClick={() => setShowAddressForm(false)} className="font-body text-sm text-stone-400 hover:text-dark-700 px-4">Cancel</button>}
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setShowAddressForm(true)} className="flex items-center space-x-2 text-gold-400 font-body text-sm hover:underline">
                    <FiPlus size={16} /><span>Add New Address</span>
                  </button>
                )}
                <button disabled={!selectedAddress} onClick={() => setStep(1)} className="mt-4 btn-gold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed">
                  Continue to Shipping
                </button>
              </motion.div>
            )}

            {/* Step 1: Shipping */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h2 className="font-heading text-xl text-dark-950 dark:text-white">Shipping Method</h2>
                {[
                  { value: 'standard', icon: FiTruck, label: 'Standard Delivery', desc: '5–7 business days', cost: subtotal >= 999 ? 0 : 79 },
                  { value: 'express', icon: FiSmartphone, label: 'Express Delivery', desc: '1–3 business days', cost: 149 },
                ].map(opt => (
                  <div key={opt.value} onClick={() => setShippingOption(opt.value)}
                    className={`flex items-center justify-between p-5 rounded-xl border-2 cursor-pointer transition-all ${shippingOption === opt.value ? 'border-gold-400 bg-gold-50 dark:bg-gold-900/10' : 'border-stone-200 dark:border-dark-700 bg-white dark:bg-dark-900 hover:border-gold-300'}`}>
                    <div className="flex items-center space-x-4">
                      <opt.icon size={24} className={shippingOption === opt.value ? 'text-gold-400' : 'text-stone-400'} />
                      <div>
                        <p className="font-body font-semibold text-dark-900 dark:text-white">{opt.label}</p>
                        <p className="font-body text-sm text-stone-400">{opt.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-body font-bold ${opt.cost === 0 ? 'text-green-500' : 'text-dark-900 dark:text-white'}`}>
                        {opt.cost === 0 ? 'FREE' : formatCurrency(opt.cost)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex space-x-3 mt-4">
                  <button onClick={() => setStep(0)} className="px-6 py-3 border border-stone-200 dark:border-dark-700 rounded-lg font-body text-sm text-dark-600 dark:text-stone-400 hover:border-gold-400 transition-colors">Back</button>
                  <button onClick={() => setStep(2)} className="btn-gold rounded-lg">Continue to Payment</button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h2 className="font-heading text-xl text-dark-950 dark:text-white">Payment Method</h2>
                {[
                  { value: 'razorpay', label: 'Razorpay', desc: 'UPI, Cards, Netbanking & More', icon: '💳' },
                  { value: 'stripe', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Amex', icon: '🏦' },
                  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive', icon: '💵' },
                ].map(opt => (
                  <div key={opt.value} onClick={() => setPaymentMethod(opt.value)}
                    className={`flex items-center justify-between p-5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === opt.value ? 'border-gold-400 bg-gold-50 dark:bg-gold-900/10' : 'border-stone-200 dark:border-dark-700 bg-white dark:bg-dark-900 hover:border-gold-300'}`}>
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <p className="font-body font-semibold text-dark-900 dark:text-white">{opt.label}</p>
                        <p className="font-body text-sm text-stone-400">{opt.desc}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === opt.value ? 'border-gold-400 bg-gold-400' : 'border-stone-300'}`} />
                  </div>
                ))}
                <div className="flex space-x-3 mt-4">
                  <button onClick={() => setStep(1)} className="px-6 py-3 border border-stone-200 dark:border-dark-700 rounded-lg font-body text-sm text-dark-600 dark:text-stone-400 hover:border-gold-400 transition-colors">Back</button>
                  <button onClick={() => setStep(3)} className="btn-gold rounded-lg">Review Order</button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h2 className="font-heading text-xl text-dark-950 dark:text-white">Review Your Order</h2>
                <div className="bg-white dark:bg-dark-900 rounded-xl border border-stone-100 dark:border-dark-800 divide-y divide-stone-100 dark:divide-dark-800">
                  {activeItems.map(item => (
                    <div key={item._id} className="flex space-x-4 p-4">
                      <img src={item.product?.images?.[0]?.url} alt="" className="w-16 h-20 object-cover rounded-lg" />
                      <div className="flex-1">
                        <p className="font-body text-sm font-medium text-dark-900 dark:text-white line-clamp-2">{item.product?.name}</p>
                        <p className="font-body text-xs text-stone-400 mt-1">{item.size && `Size: ${item.size}`}{item.color && ` • Color: ${item.color}`}</p>
                        <div className="flex justify-between mt-2">
                          <span className="font-body text-xs text-stone-400">Qty: {item.quantity}</span>
                          <span className="font-body font-semibold text-sm text-dark-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => setStep(2)} className="px-6 py-3 border border-stone-200 dark:border-dark-700 rounded-lg font-body text-sm text-dark-600 dark:text-stone-400 hover:border-gold-400 transition-colors">Back</button>
                  <button onClick={placeOrder} disabled={processing}
                    className="flex-1 btn-gold rounded-lg flex items-center justify-center space-x-2 disabled:opacity-60">
                    {processing ? (
                      <><div className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" /><span>Processing...</span></>
                    ) : (
                      <><FiCheck size={18} /><span>Place Order — {formatCurrency(total)}</span></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-stone-100 dark:border-dark-800 space-y-4 sticky top-28">
              <h3 className="font-heading text-base text-dark-950 dark:text-white">Order Summary</h3>
              <div className="space-y-2 text-sm font-body">
                <div className="flex justify-between text-stone-500"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between text-stone-500"><span>GST (5%)</span><span>{formatCurrency(gst)}</span></div>
                <div className="flex justify-between text-stone-500"><span>Shipping</span><span className={shippingCost === 0 ? 'text-green-500' : ''}>{shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}</span></div>
                {couponDiscount > 0 && <div className="flex justify-between text-green-500"><span>Coupon</span><span>-{formatCurrency(couponDiscount)}</span></div>}
                <div className="flex justify-between font-bold text-base text-dark-950 dark:text-white pt-2 border-t border-stone-100 dark:border-dark-700">
                  <span>Total</span><span>{formatCurrency(total)}</span>
                </div>
              </div>
              {selectedAddress && (
                <div className="text-xs font-body text-stone-400 bg-stone-50 dark:bg-dark-800 p-3 rounded-lg">
                  <p className="font-semibold text-dark-700 dark:text-stone-300 mb-1">Delivering to:</p>
                  <p>{selectedAddress.name} • {selectedAddress.phone}</p>
                  <p>{selectedAddress.street}, {selectedAddress.city}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
