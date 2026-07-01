import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiPackage, FiArrowRight } from 'react-icons/fi';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).catch(console.error);
  }, [id]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-dark-950 pt-24 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl py-10">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.6 }}
          className="text-center mb-10">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck size={48} className="text-green-500" />
          </div>
          <h1 className="font-display text-4xl text-dark-950 dark:text-white mb-3">Order Placed!</h1>
          <p className="font-body text-stone-500">Thank you for shopping with Overrated</p>
          {order && <p className="font-body text-sm text-gold-400 font-mono mt-2">Order #{order.orderNumber}</p>}
        </motion.div>

        {order && (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-white dark:bg-dark-900 rounded-2xl border border-stone-100 dark:border-dark-800 overflow-hidden">
            {/* Order items */}
            <div className="p-6 space-y-3 border-b border-stone-100 dark:border-dark-800">
              <h2 className="font-heading text-lg text-dark-950 dark:text-white mb-4">Items Ordered</h2>
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <img src={item.image} alt={item.name} className="w-14 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="font-body text-sm font-medium text-dark-900 dark:text-white">{item.name}</p>
                    <p className="font-body text-xs text-stone-400">Qty: {item.quantity}{item.size && ` • ${item.size}`}</p>
                  </div>
                  <p className="font-body font-semibold text-dark-950 dark:text-white text-sm">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            {/* Details */}
            <div className="p-6 grid grid-cols-2 gap-6 border-b border-stone-100 dark:border-dark-800">
              <div>
                <h3 className="font-body text-xs tracking-widest uppercase text-stone-400 mb-2">Delivery Address</h3>
                <p className="font-body text-sm text-dark-700 dark:text-stone-300">{order.shippingAddress.name}</p>
                <p className="font-body text-sm text-stone-500">{order.shippingAddress.street}</p>
                <p className="font-body text-sm text-stone-500">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              </div>
              <div>
                <h3 className="font-body text-xs tracking-widest uppercase text-stone-400 mb-2">Payment</h3>
                <p className="font-body text-sm text-dark-700 dark:text-stone-300 capitalize">{order.paymentMethod.replace('_', ' ')}</p>
                <span className={`inline-block font-body text-xs px-2 py-1 rounded-full mt-1 ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
            </div>

            {/* Totals */}
            <div className="p-6 space-y-2 text-sm font-body">
              <div className="flex justify-between text-stone-500"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="flex justify-between text-stone-500"><span>GST</span><span>{formatCurrency(order.gstAmount)}</span></div>
              <div className="flex justify-between text-stone-500"><span>Shipping</span><span>{order.shippingCost === 0 ? 'FREE' : formatCurrency(order.shippingCost)}</span></div>
              {order.couponDiscount > 0 && <div className="flex justify-between text-green-500"><span>Discount</span><span>-{formatCurrency(order.couponDiscount)}</span></div>}
              <div className="flex justify-between font-bold text-base text-dark-950 dark:text-white pt-2 border-t border-stone-100 dark:border-dark-700">
                <span>Total Paid</span><span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link to="/orders" className="flex-1 flex items-center justify-center space-x-2 border-2 border-gold-400 text-gold-400 font-body font-semibold py-3 rounded-lg hover:bg-gold-50 dark:hover:bg-gold-900/10 transition-colors">
            <FiPackage size={18} /><span>Track Order</span>
          </Link>
          <Link to="/products" className="flex-1 btn-gold rounded-lg flex items-center justify-center space-x-2">
            <span>Continue Shopping</span><FiArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
