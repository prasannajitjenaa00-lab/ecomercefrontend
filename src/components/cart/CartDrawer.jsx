import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingBag, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { setCartOpen } from '../../store/slices/uiSlice';
import { removeFromCart, updateCartItem } from '../../store/slices/cartSlice';
import { formatCurrency, calculateCartTotals } from '../../utils/helpers';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartOpen } = useSelector(s => s.ui);
  const { items, couponDiscount } = useSelector(s => s.cart);
  const activeItems = items.filter(i => !i.savedForLater);
  const { subtotal, gst, shipping, total } = calculateCartTotals(items, couponDiscount);

  const handleCheckout = () => { dispatch(setCartOpen(false)); navigate('/checkout'); };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark-950/60 backdrop-blur-sm z-50"
            onClick={() => dispatch(setCartOpen(false))} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 inset-y-0 w-full max-w-md bg-white dark:bg-dark-950 z-50 flex flex-col shadow-luxury">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-dark-800">
              <div className="flex items-center space-x-2">
                <FiShoppingBag size={20} className="text-gold-400" />
                <h2 className="font-heading text-lg text-dark-950 dark:text-white">Your Cart <span className="text-gold-400">({activeItems.length})</span></h2>
              </div>
              <button onClick={() => dispatch(setCartOpen(false))} className="p-2 hover:bg-stone-100 dark:hover:bg-dark-800 rounded-full transition-colors">
                <FiX size={20} className="text-dark-600 dark:text-stone-400" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <FiShoppingBag size={48} className="text-stone-300" />
                  <p className="font-body text-dark-400">Your cart is empty</p>
                  <button onClick={() => { dispatch(setCartOpen(false)); navigate('/products'); }}
                    className="btn-gold rounded-sm text-sm">
                    Continue Shopping
                  </button>
                </div>
              ) : activeItems.map(item => (
                <motion.div key={item._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex space-x-4 p-3 bg-stone-50 dark:bg-dark-900 rounded-lg">
                  <Link to={`/products/${item.product?.slug}`} onClick={() => dispatch(setCartOpen(false))}>
                    <img src={item.product?.images?.[0]?.url || '/placeholder.jpg'} alt={item.product?.name}
                      className="w-20 h-24 object-cover rounded" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product?.slug}`} onClick={() => dispatch(setCartOpen(false))}>
                      <h3 className="font-body text-sm font-medium text-dark-900 dark:text-white line-clamp-2 hover:text-gold-400 transition-colors">
                        {item.product?.name}
                      </h3>
                    </Link>
                    {(item.size || item.color) && (
                      <p className="text-xs text-dark-400 font-body mt-1">
                        {item.size && `Size: ${item.size}`}{item.size && item.color && ' · '}{item.color && `Color: ${item.color}`}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))}
                          className="w-7 h-7 flex items-center justify-center border border-stone-200 dark:border-dark-700 rounded hover:border-gold-400 transition-colors">
                          <FiMinus size={12} />
                        </button>
                        <span className="font-body text-sm w-6 text-center">{item.quantity}</span>
                        <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))}
                          className="w-7 h-7 flex items-center justify-center border border-stone-200 dark:border-dark-700 rounded hover:border-gold-400 transition-colors">
                          <FiPlus size={12} />
                        </button>
                      </div>
                      <p className="font-body font-semibold text-dark-900 dark:text-white text-sm">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => dispatch(removeFromCart(item._id))} className="text-stone-300 hover:text-red-400 transition-colors self-start mt-1">
                    <FiTrash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            {activeItems.length > 0 && (
              <div className="p-6 border-t border-stone-100 dark:border-dark-800 space-y-4">
                <div className="space-y-2 text-sm font-body">
                  <div className="flex justify-between text-dark-600 dark:text-stone-400">
                    <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-dark-600 dark:text-stone-400">
                    <span>GST (5%)</span><span>{formatCurrency(gst)}</span>
                  </div>
                  <div className="flex justify-between text-dark-600 dark:text-stone-400">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-500' : ''}>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-500">
                      <span>Coupon Discount</span><span>-{formatCurrency(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-dark-950 dark:text-white text-base pt-2 border-t border-stone-100 dark:border-dark-800">
                    <span>Total</span><span>{formatCurrency(total)}</span>
                  </div>
                </div>
                <button onClick={handleCheckout} className="w-full btn-gold rounded text-center block">
                  Proceed to Checkout
                </button>
                <Link to="/cart" onClick={() => dispatch(setCartOpen(false))} className="block text-center text-sm font-body text-dark-400 hover:text-gold-400 transition-colors">
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
