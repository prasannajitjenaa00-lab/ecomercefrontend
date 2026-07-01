import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiPlus, FiMinus, FiTag, FiX, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { removeFromCart, updateCartItem, applyCoupon, removeCoupon } from '../../store/slices/cartSlice';
import { formatCurrency, calculateCartTotals } from '../../utils/helpers';
import { toast } from 'react-toastify';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, coupon, couponDiscount } = useSelector(s => s.cart);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const activeItems = items.filter(i => !i.savedForLater);
  const savedItems = items.filter(i => i.savedForLater);
  const { subtotal, gst, shipping, total } = calculateCartTotals(items, couponDiscount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const result = await dispatch(applyCoupon(couponCode)).unwrap();
      toast.success(result.message);
      setCouponCode('');
    } catch (err) { toast.error(err); }
    finally { setCouponLoading(false); }
  };

  if (activeItems.length === 0 && savedItems.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-dark-950 pt-24 flex items-center justify-center">
        <div className="text-center space-y-6">
          <FiShoppingBag size={64} className="text-stone-300 mx-auto" />
          <h2 className="font-display text-4xl text-dark-950 dark:text-white">Your Cart is Empty</h2>
          <p className="font-body text-stone-400">Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn-gold rounded-sm inline-block">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-dark-950 pt-24">
      <div className="container mx-auto px-4 lg:px-8 py-10">
        <h1 className="font-display text-4xl text-dark-950 dark:text-white mb-10">
          Shopping Cart <span className="text-gold-400 font-body text-2xl font-normal">({activeItems.length} items)</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {activeItems.map(item => (
                <CartItem key={item._id} item={item} dispatch={dispatch} />
              ))}
            </AnimatePresence>

            {/* Saved for Later */}
            {savedItems.length > 0 && (
              <div className="mt-8">
                <h3 className="font-heading text-lg text-dark-950 dark:text-white mb-4">Saved for Later ({savedItems.length})</h3>
                <div className="space-y-4 opacity-70">
                  {savedItems.map(item => <CartItem key={item._id} item={item} dispatch={dispatch} saved />)}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-900 rounded-2xl p-6 border border-stone-100 dark:border-dark-800 sticky top-28 space-y-5">
              <h2 className="font-heading text-xl text-dark-950 dark:text-white">Order Summary</h2>

              {/* Coupon */}
              {coupon ? (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <FiTag size={16} className="text-green-500" />
                    <span className="font-body text-sm font-semibold text-green-600 dark:text-green-400">{coupon.code}</span>
                    <span className="font-body text-xs text-green-500">Applied!</span>
                  </div>
                  <button onClick={() => dispatch(removeCoupon())} className="text-green-400 hover:text-red-400 transition-colors"><FiX size={16} /></button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <input type="text" placeholder="Coupon code" value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                    className="flex-1 border border-stone-200 dark:border-dark-700 rounded-lg px-4 py-2.5 text-sm font-body bg-transparent dark:text-white focus:outline-none focus:border-gold-400 uppercase placeholder:normal-case placeholder:text-stone-400" />
                  <button onClick={handleApplyCoupon} disabled={couponLoading}
                    className="bg-dark-950 dark:bg-white text-white dark:text-dark-950 px-4 py-2.5 rounded-lg text-sm font-body font-semibold hover:bg-dark-800 transition-colors disabled:opacity-50 whitespace-nowrap">
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}

              <div className="space-y-3 text-sm font-body border-t border-stone-100 dark:border-dark-800 pt-4">
                <div className="flex justify-between text-dark-600 dark:text-stone-400">
                  <span>Subtotal ({activeItems.length} items)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-dark-600 dark:text-stone-400">
                  <span>GST (5%)</span>
                  <span>{formatCurrency(gst)}</span>
                </div>
                <div className="flex justify-between text-dark-600 dark:text-stone-400">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-500 font-medium' : ''}>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-500 font-medium">
                    <span>Coupon Discount</span>
                    <span>-{formatCurrency(couponDiscount)}</span>
                  </div>
                )}
                {shipping > 0 && (
                  <p className="text-xs text-stone-400 bg-stone-50 dark:bg-dark-800 px-3 py-2 rounded">
                    Add {formatCurrency(999 - subtotal)} more for free shipping!
                  </p>
                )}
              </div>

              <div className="flex justify-between font-body font-bold text-lg text-dark-950 dark:text-white border-t border-stone-100 dark:border-dark-800 pt-4">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              <button onClick={() => navigate('/checkout')}
                className="w-full btn-gold rounded-lg flex items-center justify-center space-x-2">
                <span>Proceed to Checkout</span>
                <FiArrowRight size={18} />
              </button>

              <div className="flex items-center justify-center space-x-3 pt-2">
                {['visa', 'mastercard', 'upi', 'cod'].map(m => (
                  <span key={m} className="text-xs font-body text-stone-400 border border-stone-200 dark:border-dark-700 px-2 py-1 rounded uppercase">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartItem({ item, dispatch, saved = false }) {
  const discountedPrice = item.product?.discount > 0
    ? Math.round(item.price - (item.price * item.product.discount) / 100)
    : item.price;

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}
      className="flex space-x-4 bg-white dark:bg-dark-900 rounded-2xl p-4 border border-stone-100 dark:border-dark-800">
      <Link to={`/products/${item.product?.slug}`}>
        <img src={item.product?.images?.[0]?.url || '/placeholder.jpg'} alt={item.product?.name}
          className="w-24 h-28 object-cover rounded-xl" />
      </Link>
      <div className="flex-1 min-w-0 space-y-2">
        <Link to={`/products/${item.product?.slug}`}>
          <h3 className="font-body font-medium text-dark-900 dark:text-white line-clamp-2 hover:text-gold-400 transition-colors">{item.product?.name}</h3>
        </Link>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {item.size && <span className="font-body text-xs text-stone-400">Size: <strong className="text-dark-600 dark:text-stone-300">{item.size}</strong></span>}
          {item.color && <span className="font-body text-xs text-stone-400">Color: <strong className="text-dark-600 dark:text-stone-300">{item.color}</strong></span>}
        </div>
        <div className="flex items-center justify-between">
          {saved ? (
            <button onClick={() => dispatch({ type: 'cart/saveForLater', payload: item._id })}
              className="font-body text-xs text-gold-400 underline">Move to Cart</button>
          ) : (
            <div className="flex items-center space-x-2 border border-stone-200 dark:border-dark-700 rounded-lg overflow-hidden">
              <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))}
                className="px-3 py-2 hover:bg-stone-100 dark:hover:bg-dark-800 transition-colors text-dark-600 dark:text-stone-400">
                <FiMinus size={12} />
              </button>
              <span className="font-body text-sm font-medium text-dark-900 dark:text-white px-2">{item.quantity}</span>
              <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))}
                className="px-3 py-2 hover:bg-stone-100 dark:hover:bg-dark-800 transition-colors text-dark-600 dark:text-stone-400">
                <FiPlus size={12} />
              </button>
            </div>
          )}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="font-body font-bold text-dark-950 dark:text-white">{formatCurrency(discountedPrice * item.quantity)}</p>
              {item.quantity > 1 && <p className="font-body text-xs text-stone-400">{formatCurrency(discountedPrice)} each</p>}
            </div>
            <button onClick={() => dispatch(removeFromCart(item._id))}
              className="text-stone-300 hover:text-red-400 transition-colors p-1">
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
