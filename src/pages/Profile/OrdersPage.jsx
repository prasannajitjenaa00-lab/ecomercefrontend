// OrdersPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import api from '../../utils/api';
import { formatCurrency, formatDate, orderStatusColor } from '../../utils/helpers';
import ProductCard from '../../components/product/ProductCard';


export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my-orders').then(({ data }) => setOrders(data.orders)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-dark-950 pt-24">
      <div className="container mx-auto px-4 lg:px-8 py-10 max-w-4xl">
        <h1 className="font-display text-4xl text-dark-950 dark:text-white mb-10">My Orders</h1>
        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <FiPackage size={48} className="text-stone-300 mx-auto mb-4" />
            <h2 className="font-display text-3xl text-dark-300 dark:text-dark-600 mb-2">No Orders Yet</h2>
            <Link to="/products" className="btn-gold rounded-sm mt-4 inline-block">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/orders/${order._id}`} className="block bg-white dark:bg-dark-900 rounded-2xl border border-stone-100 dark:border-dark-800 p-5 hover:border-gold-300 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-body text-xs text-stone-400 mb-1">Order #{order.orderNumber}</p>
                      <p className="font-body text-sm text-stone-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`font-body text-xs px-3 py-1 rounded-full capitalize font-medium ${orderStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.replace('_', ' ')}
                      </span>
                      <FiChevronRight size={18} className="text-stone-300 group-hover:text-gold-400 transition-colors" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {order.items.slice(0, 3).map((item, j) => (
                      <img key={j} src={item.image} alt={item.name} className="w-14 h-16 object-cover rounded-lg" />
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-14 h-16 bg-stone-100 dark:bg-dark-800 rounded-lg flex items-center justify-center">
                        <span className="font-body text-xs text-stone-500">+{order.items.length - 3}</span>
                      </div>
                    )}
                    <div className="ml-auto text-right">
                      <p className="font-body text-xs text-stone-400">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                      <p className="font-body font-bold text-dark-950 dark:text-white">{formatCurrency(order.totalAmount)}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// OrderDetailPage.jsx
export function OrderDetailPage() {
  const { id } = require('react-router-dom').useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const cancelOrder = async () => {
    const reason = prompt('Reason for cancellation:');
    if (!reason) return;
    try {
      await api.put(`/orders/${id}/cancel`, { reason });
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.order);
      require('react-toastify').toast.success('Order cancelled');
    } catch (err) { require('react-toastify').toast.error(err.response?.data?.message || 'Cannot cancel'); }
  };

  if (loading) return <div className="min-h-screen pt-28 flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" /></div>;
  if (!order) return null;

  const steps = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
  const currentStep = steps.indexOf(order.orderStatus);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-dark-950 pt-24">
      <div className="container mx-auto px-4 lg:px-8 py-10 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl text-dark-950 dark:text-white">Order #{order.orderNumber}</h1>
          <span className={`font-body text-sm px-4 py-1.5 rounded-full font-medium ${orderStatusColor(order.orderStatus)}`}>
            {order.orderStatus.replace('_', ' ')}
          </span>
        </div>

        {/* Tracking Stepper */}
        {!['cancelled', 'refunded'].includes(order.orderStatus) && (
          <div className="bg-white dark:bg-dark-900 rounded-2xl p-6 border border-stone-100 dark:border-dark-800 mb-6">
            <h2 className="font-heading text-lg text-dark-950 dark:text-white mb-6">Order Tracking</h2>
            <div className="flex items-center">
              {steps.map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= currentStep ? 'bg-gold-400 text-dark-950' : 'bg-stone-200 dark:bg-dark-700 text-stone-400'}`}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <span className={`mt-2 text-xs font-body text-center capitalize w-16 ${i <= currentStep ? 'text-gold-400' : 'text-stone-400'}`}>
                      {step.replace('_', ' ')}
                    </span>
                  </div>
                  {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-1 mb-5 ${i < currentStep ? 'bg-gold-400' : 'bg-stone-200 dark:bg-dark-700'}`} />}
                </React.Fragment>
              ))}
            </div>
            {order.trackingNumber && <p className="font-body text-sm text-stone-500 mt-4">Tracking: <strong className="text-dark-700 dark:text-stone-300">{order.trackingNumber}</strong></p>}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-dark-900 rounded-2xl border border-stone-100 dark:border-dark-800 divide-y divide-stone-100 dark:divide-dark-800">
              {order.items.map((item, i) => (
                <div key={i} className="flex space-x-4 p-4">
                  <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="font-body text-sm font-medium text-dark-900 dark:text-white">{item.name}</p>
                    <p className="font-body text-xs text-stone-400 mt-1">{item.size && `Size: ${item.size}`}{item.color && ` • ${item.color}`}</p>
                    <div className="flex justify-between mt-2">
                      <span className="font-body text-xs text-stone-400">Qty: {item.quantity}</span>
                      <span className="font-body font-semibold text-sm">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {['pending', 'processing'].includes(order.orderStatus) && (
              <button onClick={cancelOrder} className="font-body text-sm text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                Cancel Order
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-stone-100 dark:border-dark-800 space-y-3 text-sm font-body">
              <h3 className="font-heading text-base text-dark-950 dark:text-white mb-3">Payment Details</h3>
              <div className="flex justify-between text-stone-500"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="flex justify-between text-stone-500"><span>GST</span><span>{formatCurrency(order.gstAmount)}</span></div>
              <div className="flex justify-between text-stone-500"><span>Shipping</span><span>{order.shippingCost === 0 ? 'FREE' : formatCurrency(order.shippingCost)}</span></div>
              {order.couponDiscount > 0 && <div className="flex justify-between text-green-500"><span>Discount</span><span>-{formatCurrency(order.couponDiscount)}</span></div>}
              <div className="flex justify-between font-bold text-dark-950 dark:text-white border-t border-stone-100 dark:border-dark-700 pt-3">
                <span>Total</span><span>{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="pt-1">
                <p className="text-xs text-stone-400">Payment: <span className="text-dark-600 dark:text-stone-300 capitalize">{order.paymentMethod.replace('_', ' ')}</span></p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
            <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-stone-100 dark:border-dark-800">
              <h3 className="font-heading text-base text-dark-950 dark:text-white mb-3">Delivery Address</h3>
              <p className="font-body text-sm font-semibold text-dark-800 dark:text-white">{order.shippingAddress.name}</p>
              <p className="font-body text-sm text-stone-500">{order.shippingAddress.street}</p>
              <p className="font-body text-sm text-stone-500">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p className="font-body text-sm text-stone-500 mt-1">📞 {order.shippingAddress.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// WishlistPage.jsx
export function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist').then(({ data }) => setWishlist(data.wishlist)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const removeFromWishlist = async (productId) => {
    await api.post(`/wishlist/toggle/${productId}`);
    setWishlist(prev => prev.filter(p => p._id !== productId));
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-dark-950 pt-24">
      <div className="container mx-auto px-4 lg:px-8 py-10">
        <h1 className="font-display text-4xl text-dark-950 dark:text-white mb-10">My Wishlist ({wishlist.length})</h1>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <div key={i} className="skeleton aspect-[3/4] rounded-xl" />)}</div>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-3xl text-dark-300 dark:text-dark-600 mb-4">Your wishlist is empty</p>
            <Link to="/products" className="btn-gold rounded-sm inline-block">Explore Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {wishlist.map(product => (
              <div key={product._id} className="relative">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
