import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { FiArrowRight, FiTruck, FiRefreshCw, FiShield, FiHeadphones } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi';
import api from '../../utils/api';
import ProductCard from '../../components/product/ProductCard';
import { MOCK_PRODUCTS } from '../../utils/mockData';

const heroSlides = [
  { bg: 'from-gold-50 to-stone-100 dark:from-dark-950 dark:to-dark-900', title: 'New Season Arrivals', sub: "Shop Men's Collection", cta: 'Shop Men', link: '/products?gender=men', accent: '#d4af37', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&h=800&fit=crop' },
  { bg: 'from-stone-100 to-gold-50 dark:from-stone-900 dark:to-dark-950', title: 'Elegance Redefined', sub: "Explore Women's Fashion", cta: 'Shop Women', link: '/products?gender=women', accent: '#d4af37', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop' },
  { bg: 'from-stone-50 to-stone-100 dark:from-dark-900 dark:to-stone-900', title: 'Festival Season Sale', sub: 'Up to 50% Off Everything', cta: 'Shop Sale', link: '/products?sale=true', accent: '#ef4444', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=800&fit=crop' },
];

const categories = [
  { name: 'Men', slug: 'men', emoji: '👔', desc: 'Classic to Contemporary', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&h=500&fit=crop' },
  { name: 'Women', slug: 'women', emoji: '👗', desc: 'Timeless Elegance', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop' },
  { name: 'Kids', slug: 'kids', emoji: '🧒', desc: 'Fun & Vibrant Styles', image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500&h=500&fit=crop' },
];

const features = [
  { icon: FiTruck, title: 'Free Shipping', desc: 'On orders above ₹999' },
  { icon: FiRefreshCw, title: 'Easy Returns', desc: '30-day hassle-free returns' },
  { icon: FiShield, title: 'Secure Payments', desc: '100% secure transactions' },
  { icon: FiHeadphones, title: '24/7 Support', desc: 'Always here to help' },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } }) };

export default function HomePage() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [trending, setTrending] = useState([]);
  const [flashSale, setFlashSale] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [na, tr, fs] = await Promise.all([
          api.get('/products?isNewArrival=true&limit=8'),
          api.get('/products?isBestSeller=true&limit=8'),
          api.get('/products?isFlashSale=true&limit=6'),
        ]);
        setNewArrivals(na?.data?.products || []);
        setTrending(tr?.data?.products || []);
        setFlashSale(fs?.data?.products || []);
      } catch (err) {
        console.warn('Backend offline, loading mock products on homepage.');
        setNewArrivals(MOCK_PRODUCTS.filter(p => p.isNewArrival).slice(0, 8));
        setTrending(MOCK_PRODUCTS.filter(p => p.isBestSeller).slice(0, 8));
        setFlashSale(MOCK_PRODUCTS.filter(p => p.isFlashSale).slice(0, 6));
      }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* Hero Slider */}
      <section className="relative h-[500px] md:h-[600px] lg:h-screen min-h-[450px]">
        <Swiper modules={[Autoplay, Pagination, EffectFade]} effect="fade" autoplay={{ delay: 5000, disableOnInteraction: false }} pagination={{ clickable: true }} loop className="h-full">
          {heroSlides.map((slide, i) => (
            <SwiperSlide key={i}>
              <div className={`h-full bg-gradient-to-br ${slide.bg} flex items-center relative overflow-hidden`}>
                {/* Decorative */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
                  <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gold-400/5 rounded-full blur-2xl" />
                  <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(212,175,55,0.08) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                </div>
                <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-12 md:pt-16 lg:pt-24">
                  <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                    <div className="flex items-center space-x-2 mb-4">
                      <HiOutlineSparkles className="text-gold-500 dark:text-gold-400" size={20} />
                      <span className="text-gold-500 dark:text-gold-400 font-body text-sm tracking-widest uppercase">Thankless Fashion Exclusive</span>
                    </div>
                    <h1 className="font-display text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold text-dark-950 dark:text-white leading-none mb-4">
                      {slide.title.split(' ').map((word, wi) => (
                        <span key={wi} className={wi % 3 === 1 ? 'gold-text block' : 'block'}>{word}</span>
                      ))}
                    </h1>
                    <p className="font-body text-stone-600 dark:text-stone-300 text-lg md:text-xl mt-6 mb-8 max-w-lg">{slide.sub}</p>
                    <div className="flex flex-wrap gap-4">
                      <Link to={slide.link} className="btn-gold rounded-sm inline-block">
                        {slide.cta}
                      </Link>
                      <Link to="/products" className="border border-dark-950/20 text-dark-950 dark:border-white/30 dark:text-white font-body text-sm px-6 py-3 rounded-sm tracking-widest uppercase hover:border-gold-500 hover:text-gold-500 dark:hover:border-gold-400 dark:hover:text-gold-400 transition-all">
                        Explore All
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-dark-950/30 dark:border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-gold-500 dark:bg-gold-400 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-dark-950 py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="flex items-center space-x-3 p-4">
                <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-gold-400" />
                </div>
                <div>
                  <p className="font-body font-semibold text-white text-sm">{title}</p>
                  <p className="font-body text-xs text-stone-500">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-stone-50 dark:bg-dark-950">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <p className="text-gold-400 font-body text-sm tracking-widest uppercase mb-2">Explore</p>
            <h2 className="font-display text-4xl lg:text-5xl text-dark-950 dark:text-white">Shop by Category</h2>
          </motion.div>
          {/* Desktop/Tablet Categories */}
          <div className="hidden md:grid grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <motion.div key={cat.slug} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Link to={`/products?gender=${cat.slug}`}
                  className="group relative h-80 bg-dark-950 rounded-2xl overflow-hidden flex flex-col justify-end p-8 block hover:shadow-luxury transition-shadow duration-300">
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-900/70 to-transparent" />
                  <div className="absolute top-8 right-8 text-6xl opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500">
                    {cat.emoji}
                  </div>
                  <div className="relative z-10">
                    <p className="font-body text-stone-400 text-sm mb-1">{cat.desc}</p>
                    <h3 className="font-display text-3xl font-bold text-white mb-3">{cat.name}</h3>
                    <span className="inline-flex items-center space-x-2 text-gold-400 font-body text-sm group-hover:space-x-3 transition-all">
                      <span>Explore</span><FiArrowRight size={16} />
                    </span>
                  </div>
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold-400/30 rounded-2xl transition-colors duration-300" />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Mobile Categories (Circular icons with images and text inside) */}
          <div className="grid grid-cols-3 gap-4 md:hidden px-2 max-w-sm mx-auto">
            {categories.map((cat, i) => (
              <motion.div key={cat.slug} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex justify-center">
                <Link to={`/products?gender=${cat.slug}`} className="flex flex-col items-center group">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-[3px] border-dark-950 dark:border-white shadow-md transition-transform duration-300 group-hover:scale-105">
                    {/* Image */}
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-dark-950/40 group-hover:bg-dark-950/50 transition-colors" />
                    {/* Text Centered Inside */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display font-bold text-white text-xs tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {cat.name}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale */}
      {flashSale.length > 0 && (
        <section className="py-20 bg-dark-950">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <p className="text-red-400 font-body text-sm tracking-widest uppercase mb-1">⚡ Limited Time</p>
                <h2 className="font-display text-4xl text-white">Flash Sale</h2>
              </motion.div>
              <Link to="/products?isFlashSale=true" className="text-gold-400 font-body text-sm hover:underline flex items-center space-x-1">
                <span>View All</span><FiArrowRight size={14} />
              </Link>
            </div>
            <Swiper modules={[Autoplay]} autoplay={{ delay: 3000 }} spaceBetween={20} slidesPerView={2}
              breakpoints={{ 640: { slidesPerView: 3 }, 1024: { slidesPerView: 4 }, 1280: { slidesPerView: 5 } }}>
              {flashSale.map(product => (
                <SwiperSlide key={product._id}>
                  <ProductCard product={product} dark />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <ProductSection title="New Arrivals" subtitle="Fresh off the runway" products={newArrivals} link="/products?isNewArrival=true" loading={loading} />

      {/* Best Sellers */}
      <ProductSection title="Best Sellers" subtitle="What everyone's loving" products={trending} link="/products?isBestSeller=true" loading={loading} dark />

      {/* Brand Banner */}
      <section className="py-24 bg-gradient-to-r from-dark-950 via-dark-900 to-dark-950 relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 70%)' }} />
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-gold-400 font-body text-sm tracking-widest uppercase mb-4">The Thankless Fashion Promise</p>
            <h2 className="font-display text-5xl lg:text-7xl text-white font-bold mb-6 leading-none">
              Fashion That<br /><span className="gold-text">Tells Your Story</span>
            </h2>
            <p className="font-body text-stone-400 text-lg max-w-xl mx-auto mb-10">
              Curated collections celebrating Indian craftsmanship with modern aesthetics. Every piece is chosen for quality, style, and soul.
            </p>
            <Link to="/products" className="btn-gold rounded-sm inline-block">
              Discover Our Collections
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function ProductSection({ title, subtitle, products = [], link, loading, dark = false }) {
  return (
    <section className={`py-20 ${dark ? 'bg-stone-100 dark:bg-dark-900' : 'bg-white dark:bg-dark-950'}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-gold-400 font-body text-xs tracking-widest uppercase mb-1">{subtitle}</p>
            <h2 className="font-display text-4xl text-dark-950 dark:text-white">{title}</h2>
          </motion.div>
          <Link to={link} className="text-gold-400 font-body text-sm hover:underline hidden md:flex items-center space-x-1">
            <span>View All</span><FiArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {products?.map((product, i) => (
              <motion.div key={product._id} custom={i % 4} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ProductSkeleton() {
  return (
    <div className="space-y-3">
      <div className="skeleton h-64 rounded-xl" />
      <div className="skeleton h-4 rounded w-3/4" />
      <div className="skeleton h-4 rounded w-1/2" />
    </div>
  );
}
