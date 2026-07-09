import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiStar, FiEye } from 'react-icons/fi';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleItem } from '../../store/slices/wishlistSlice';
import { formatCurrency, resolveImage } from '../../utils/helpers';
import api from '../../utils/api';
import { toast } from 'react-toastify';

export default function ProductCard({ product, dark = false }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(s => s.auth);
  const { items: wishlist } = useSelector(s => s.wishlist);
  const [isWishlisted, setIsWishlisted] = useState(
    wishlist.some(i => (i._id || i) === product._id)
  );
  const [addingCart, setAddingCart] = useState(false);

  const discountedPrice = product.discount > 0
    ? Math.round(product.price - (product.price * product.discount) / 100)
    : product.price;

  const mainImage = resolveImage(product.images?.[0]?.url);
  const hoverImage = resolveImage(product.images?.[1]?.url || product.images?.[0]?.url);

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.info('Please login to add to wishlist'); return; }
    try {
      await api.post(`/wishlist/toggle/${product._id}`);
      setIsWishlisted(!isWishlisted);
      dispatch(toggleItem(product._id));
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch { toast.error('Failed to update wishlist'); }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.info('Please login to add to cart'); return; }
    setAddingCart(true);
    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      toast.success('Added to cart!');
    } catch (err) { toast.error(err || 'Failed to add to cart'); }
    finally { setAddingCart(false); }
  };

  return (
    <Link to={`/products/${product.slug}`} className="block group product-card">
      <div className={`rounded-xl overflow-hidden ${dark ? 'bg-dark-800' : 'bg-white dark:bg-dark-900'} border border-stone-100 dark:border-dark-800`}>
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-[3/4] bg-stone-100 dark:bg-dark-800">
          <img src={mainImage} alt={product.name} data-src={mainImage}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/400x500/1a1a1a/d4af37?text=No+Image'; console.warn('Product image failed to load:', e.currentTarget.dataset.src, 'product:', product._id); }}
            className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0 absolute inset-0" />
          <img src={hoverImage} alt={product.name} data-src={hoverImage}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/400x500/1a1a1a/d4af37?text=No+Image'; }}
            className="w-full h-full object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100 absolute inset-0" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNewArrival && (
              <span className="bg-dark-950 text-gold-400 font-body text-xs px-2 py-0.5 rounded tracking-wider">NEW</span>
            )}
            {product.discount > 0 && (
              <span className="bg-red-500 text-white font-body text-xs px-2 py-0.5 rounded font-semibold">
                -{product.discount}%
              </span>
            )}
            {product.isFlashSale && (
              <span className="bg-gold-400 text-dark-950 font-body text-xs px-2 py-0.5 rounded font-bold">⚡ SALE</span>
            )}
          </div>

          {/* Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleWishlist}
              className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-stone-400 hover:bg-red-50 hover:text-red-500'}`}>
              <FiHeart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleAddToCart} disabled={addingCart || product.stock === 0}
              className="w-9 h-9 rounded-full bg-dark-950 text-white flex items-center justify-center shadow-md hover:bg-gold-400 hover:text-dark-950 transition-colors disabled:opacity-50">
              <FiShoppingBag size={16} />
            </motion.button>
          </div>

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-dark-950/60 flex items-center justify-center">
              <span className="font-body text-white text-sm tracking-widest uppercase bg-dark-950/80 px-4 py-2 rounded">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 lg:p-4">
          {product.brand && (
            <p className="font-body text-xs text-stone-400 dark:text-stone-500 tracking-widest uppercase mb-1">
              {product.brand?.name || product.brand}
            </p>
          )}
          <h3 className="font-body text-sm font-medium text-dark-900 dark:text-white line-clamp-2 group-hover:text-gold-400 transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center space-x-1 mt-1.5">
              <FiStar size={12} className="text-gold-400 fill-gold-400" />
              <span className="font-body text-xs text-dark-600 dark:text-stone-400">
                {product.ratings?.toFixed(1)} <span className="text-stone-400">({product.numReviews})</span>
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center space-x-2 mt-2">
            <span className="font-body font-bold text-dark-950 dark:text-white text-sm lg:text-base">
              {formatCurrency(discountedPrice)}
            </span>
            {product.discount > 0 && (
              <span className="font-body text-xs text-stone-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
