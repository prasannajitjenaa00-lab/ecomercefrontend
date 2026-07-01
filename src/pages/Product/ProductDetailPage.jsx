import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiStar, FiTruck, FiRefreshCw, FiShield, FiZoomIn, FiShare2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { addToCart } from '../../store/slices/cartSlice';
import { formatCurrency } from '../../utils/helpers';
import ProductCard from '../../components/product/ProductCard';
import api from '../../utils/api';
import { toast } from 'react-toastify';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(s => s.auth);

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingCart, setAddingCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [zoomOpen, setZoomOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data.product);
        setSimilar(data.similar);
        setReviews(data.reviews);
        if (data.product.colors?.length) setSelectedColor(data.product.colors[0].name);
        if (data.product.sizes?.length) setSelectedSize(data.product.sizes[0]);
      } catch {
        const { MOCK_PRODUCTS } = require('../../utils/mockData');
        const mockProduct = MOCK_PRODUCTS.find(p => p.slug === slug || p._id === slug);
        if (mockProduct) {
          setProduct(mockProduct);
          const similarProducts = MOCK_PRODUCTS.filter(p => p.category?.slug === mockProduct.category?.slug && p._id !== mockProduct._id);
          setSimilar(similarProducts);
          setReviews([
            {
              _id: 'r1',
              rating: 5,
              title: 'Superb quality!',
              comment: 'Feels amazing and fits like a glove. Highly recommended!',
              user: { name: 'Satyajit Jena' },
              isVerifiedPurchase: true
            }
          ]);
          if (mockProduct.colors?.length) setSelectedColor(mockProduct.colors[0].name);
          if (mockProduct.sizes?.length) setSelectedSize(mockProduct.sizes[0]);
        } else {
          navigate('/404');
        }
      }
      finally { setLoading(false); }
    };
    fetch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const discountedPrice = product?.discount > 0
    ? Math.round(product.price - (product.price * product.discount) / 100)
    : product?.price;

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.info('Please login first'); navigate('/login'); return; }
    if (product.sizes?.length && !selectedSize) { toast.warning('Please select a size'); return; }
    setAddingCart(true);
    try {
      await dispatch(addToCart({ productId: product._id, quantity, size: selectedSize, color: selectedColor })).unwrap();
      toast.success('Added to cart!');
    } catch (err) { toast.error(err || 'Failed to add to cart'); }
    finally { setAddingCart(false); }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/checkout');
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.info('Please login first'); return; }
    try {
      await api.post(`/wishlist/toggle/${product._id}`);
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch { toast.error('Failed'); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.info('Please login to review'); return; }
    try {
      const { data } = await api.post('/reviews', { ...newReview, product: product._id });
      setReviews(prev => [{ ...data.review, user: { name: 'You' } }, ...prev]);
      setNewReview({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit review'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-stone-50 dark:bg-dark-950 pt-24">
      <div className="container mx-auto px-4 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="flex space-x-2">{[...Array(4)].map((_,i)=><div key={i} className="skeleton w-20 h-20 rounded-lg"/>)}</div>
          </div>
          <div className="space-y-4">{[...Array(6)].map((_,i)=><div key={i} className={`skeleton h-${[8,4,4,10,12,10][i]} rounded`}/>)}</div>
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const images = product.images || [];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-dark-950 pt-24">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs font-body text-stone-400 mb-8">
          {['Home', product.category?.name, product.name].map((crumb, i, arr) => (
            <React.Fragment key={i}>
              <span className={i === arr.length - 1 ? 'text-dark-700 dark:text-stone-300 truncate max-w-xs' : 'hover:text-gold-400 cursor-pointer'}>{crumb}</span>
              {i < arr.length - 1 && <span>/</span>}
            </React.Fragment>
          ))}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white dark:bg-dark-900 rounded-2xl overflow-hidden group cursor-zoom-in" onClick={() => setZoomOpen(true)}>
              <AnimatePresence mode="wait">
                <motion.img key={activeImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  src={images[activeImage]?.url || 'https://via.placeholder.com/600'} alt={product.name}
                  className="w-full h-full object-cover" />
              </AnimatePresence>
              <button className="absolute top-4 right-4 w-10 h-10 bg-white/80 dark:bg-dark-800/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <FiZoomIn size={18} className="text-dark-700" />
              </button>
              {images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setActiveImage(p => Math.max(0, p-1)); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 dark:bg-dark-800/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiChevronLeft size={18} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setActiveImage(p => Math.min(images.length-1, p+1)); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 dark:bg-dark-800/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiChevronRight size={18} />
                  </button>
                </>
              )}
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white font-body text-sm font-bold px-3 py-1 rounded">
                  -{product.discount}% OFF
                </div>
              )}
            </div>
            {/* Thumbnails */}
            <div className="flex space-x-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === i ? 'border-gold-400' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {product.brand && <p className="font-body text-sm tracking-widest uppercase text-stone-400">{product.brand?.name}</p>}
            <h1 className="font-display text-3xl lg:text-4xl text-dark-950 dark:text-white leading-tight">{product.name}</h1>

            {/* Rating */}
            {product.numReviews > 0 && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={16} className={i < Math.round(product.ratings) ? 'text-gold-400 fill-gold-400' : 'text-stone-300'} />
                  ))}
                </div>
                <span className="font-body text-sm text-stone-500">{product.ratings?.toFixed(1)} ({product.numReviews} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end space-x-4">
              <span className="font-display text-4xl font-bold text-dark-950 dark:text-white">{formatCurrency(discountedPrice)}</span>
              {product.discount > 0 && (
                <>
                  <span className="font-body text-xl text-stone-400 line-through">{formatCurrency(product.price)}</span>
                  <span className="font-body text-sm text-green-500 font-semibold">You save {formatCurrency(product.price - discountedPrice)}</span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`font-body text-sm ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of Stock'}
              </span>
            </div>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div>
                <p className="font-body text-sm font-semibold text-dark-700 dark:text-stone-300 mb-3">
                  Color: <span className="font-normal text-dark-400">{selectedColor}</span>
                </p>
                <div className="flex space-x-3">
                  {product.colors.map(c => (
                    <button key={c.name} onClick={() => setSelectedColor(c.name)}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${selectedColor === c.name ? 'border-gold-400 scale-110' : 'border-transparent hover:border-stone-300'}`}
                      style={{ backgroundColor: c.hex || '#ccc' }} title={c.name} />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-body text-sm font-semibold text-dark-700 dark:text-stone-300">
                    Size: <span className="font-normal text-dark-400">{selectedSize}</span>
                  </p>
                  <button className="font-body text-xs text-gold-400 underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] h-11 px-3 rounded border font-body text-sm font-medium transition-all ${selectedSize === size ? 'border-gold-400 bg-gold-400 text-dark-950' : 'border-stone-200 dark:border-dark-700 text-dark-700 dark:text-stone-300 hover:border-gold-400'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center space-x-4">
              <p className="font-body text-sm font-semibold text-dark-700 dark:text-stone-300">Qty:</p>
              <div className="flex items-center border border-stone-200 dark:border-dark-700 rounded overflow-hidden">
                <button onClick={() => setQuantity(p => Math.max(1, p-1))} className="px-4 py-2.5 text-dark-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-dark-800 transition-colors font-body text-lg">-</button>
                <span className="px-4 py-2.5 font-body font-medium text-dark-900 dark:text-white min-w-[44px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(p => Math.min(product.stock, p+1))} className="px-4 py-2.5 text-dark-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-dark-800 transition-colors font-body text-lg">+</button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <button onClick={handleAddToCart} disabled={addingCart || product.stock === 0}
                className="flex-1 flex items-center justify-center space-x-2 btn-gold rounded disabled:opacity-50 disabled:cursor-not-allowed">
                <FiShoppingBag size={18} />
                <span>{addingCart ? 'Adding...' : 'Add to Cart'}</span>
              </button>
              <button onClick={handleBuyNow} disabled={product.stock === 0}
                className="flex-1 bg-dark-950 dark:bg-white text-white dark:text-dark-950 font-body font-semibold px-6 py-3 rounded tracking-widest text-sm uppercase hover:bg-dark-800 dark:hover:bg-stone-100 transition-colors disabled:opacity-50">
                Buy Now
              </button>
              <button onClick={handleWishlist}
                className={`w-12 h-12 rounded border transition-all ${isWishlisted ? 'border-red-400 bg-red-50 text-red-500' : 'border-stone-200 dark:border-dark-700 text-stone-400 hover:border-red-400 hover:text-red-500'}`}>
                <FiHeart size={20} className="mx-auto" fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[[FiTruck, 'Free Delivery', 'On ₹999+'], [FiRefreshCw, 'Easy Returns', '30 days'], [FiShield, 'Secure Pay', '100% Safe']].map(([Icon, t, s], i) => (
                <div key={i} className="flex flex-col items-center text-center p-3 bg-stone-100 dark:bg-dark-900 rounded-lg">
                  <Icon size={18} className="text-gold-400 mb-1" />
                  <p className="font-body text-xs font-semibold text-dark-700 dark:text-stone-300">{t}</p>
                  <p className="font-body text-xs text-stone-400">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex border-b border-stone-200 dark:border-dark-800 space-x-8 mb-8">
            {[['description', 'Description'], ['specifications', 'Specifications'], ['reviews', `Reviews (${reviews.length})`]].map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`pb-4 font-body text-sm font-medium tracking-wide transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-gold-400 text-gold-400' : 'border-transparent text-stone-400 hover:text-dark-700 dark:hover:text-stone-300'}`}>
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="prose dark:prose-invert max-w-3xl font-body text-dark-600 dark:text-stone-400 leading-relaxed">
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === 'specifications' && product.specifications?.length > 0 && (
            <div className="max-w-2xl">
              <table className="w-full">
                <tbody>
                  {product.specifications.map((spec, i) => (
                    <tr key={i} className={`${i % 2 === 0 ? 'bg-stone-50 dark:bg-dark-900' : ''}`}>
                      <td className="py-3 px-4 font-body text-sm font-semibold text-dark-700 dark:text-stone-300 w-1/3">{spec.key}</td>
                      <td className="py-3 px-4 font-body text-sm text-dark-500 dark:text-stone-400">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8 max-w-3xl">
              {reviews.map(review => (
                <div key={review._id} className="border-b border-stone-100 dark:border-dark-800 pb-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gold-400/20 flex items-center justify-center">
                        <span className="font-body text-sm font-bold text-gold-400">{review.user?.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-body font-semibold text-dark-900 dark:text-white text-sm">{review.user?.name}</p>
                        {review.isVerifiedPurchase && <span className="text-xs font-body text-green-500">✓ Verified Purchase</span>}
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} size={14} className={i < review.rating ? 'text-gold-400 fill-gold-400' : 'text-stone-300'} />
                      ))}
                    </div>
                  </div>
                  {review.title && <p className="font-body text-sm font-semibold text-dark-800 dark:text-white mb-1">{review.title}</p>}
                  <p className="font-body text-sm text-dark-600 dark:text-stone-400 leading-relaxed">{review.comment}</p>
                </div>
              ))}

              {/* Write Review */}
              {isAuthenticated && (
                <form onSubmit={handleReviewSubmit} className="bg-stone-50 dark:bg-dark-900 rounded-xl p-6 space-y-4">
                  <h3 className="font-heading text-lg text-dark-950 dark:text-white">Write a Review</h3>
                  <div>
                    <p className="font-body text-sm text-dark-600 dark:text-stone-400 mb-2">Rating:</p>
                    <div className="flex space-x-2">
                      {[1,2,3,4,5].map(r => (
                        <button key={r} type="button" onClick={() => setNewReview(p => ({ ...p, rating: r }))}>
                          <FiStar size={24} className={r <= newReview.rating ? 'text-gold-400 fill-gold-400' : 'text-stone-300'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <input type="text" placeholder="Review title" value={newReview.title}
                    onChange={e => setNewReview(p => ({ ...p, title: e.target.value }))}
                    className="w-full border border-stone-200 dark:border-dark-700 rounded px-4 py-3 text-sm font-body bg-transparent dark:text-white focus:outline-none focus:border-gold-400" />
                  <textarea placeholder="Share your experience..." value={newReview.comment} required
                    onChange={e => setNewReview(p => ({ ...p, comment: e.target.value }))}
                    rows={4} className="w-full border border-stone-200 dark:border-dark-700 rounded px-4 py-3 text-sm font-body bg-transparent dark:text-white focus:outline-none focus:border-gold-400 resize-none" />
                  <button type="submit" className="btn-gold rounded-sm text-sm">Submit Review</button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Similar Products */}
        {similar.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-3xl text-dark-950 dark:text-white mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {similar.slice(0,8).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
