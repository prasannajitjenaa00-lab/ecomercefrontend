import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiHeart, FiUser, FiSearch, FiMenu, FiX, FiSun, FiMoon, FiChevronDown } from 'react-icons/fi';
import { logout } from '../../store/slices/authSlice';
import { setCartOpen, setSearchOpen, toggleDarkMode, setMobileMenuOpen } from '../../store/slices/uiSlice';
import { fetchCart } from '../../store/slices/cartSlice';
import api from '../../utils/api';
import { debounce } from '../../utils/helpers';

const megaMenuItems = {
  Men: ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Jackets', 'Hoodies', 'Shoes', 'Watches', 'Sunglasses'],
  Women: ['Sarees', 'Kurtis', 'Dresses', 'Tops', 'Jeans', 'Handbags', 'Jewellery', 'Footwear'],
  Kids: ['Boys Wear', 'Girls Wear', 'School Wear', 'Shoes', 'Toys'],
};

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const { items } = useSelector(s => s.cart);
  const { darkMode, mobileMenuOpen } = useSelector(s => s.ui);
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchOpen, setSearchOpenLocal] = useState(false);

  const cartCount = useMemo(() => items.filter(i => !i.savedForLater).reduce((s, i) => s + i.quantity, 0), [items]);
  const isHero = useMemo(() => location.pathname === '/' && !scrolled, [location.pathname, scrolled]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCart());
  }, [isAuthenticated, dispatch]);

  const fetchSuggestions = useCallback(
    debounce(async (q) => {
      if (q.length < 2) { setSuggestions([]); return; }
      try {
        const { data } = await api.get(`/products/search/suggestions?q=${q}`);
        setSuggestions(data.suggestions);
      } catch { setSuggestions([]); }
    }, 300),
    []
  );

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchOpenLocal(false);
      setSuggestions([]);
    }
  }, [searchQuery, navigate]);

  const handleMenuClose = useCallback(() => {
    setSearchOpenLocal(false);
    setSuggestions([]);
  }, []);

  const handleMobileMenuToggle = useCallback(() => {
    dispatch(setMobileMenuOpen(!mobileMenuOpen));
  }, [mobileMenuOpen, dispatch]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    dispatch(setMobileMenuOpen(false));
  }, [dispatch]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || location.pathname !== '/' ? 'bg-white dark:bg-dark-950 shadow-sm border-b border-stone-100 dark:border-dark-800' : 'bg-transparent'}`}>
      {/* Top Bar */}
      <div className={`text-center py-2 text-xs tracking-widest font-body transition-all duration-300 ${isHero ? 'bg-dark-950/80 text-gold-400' : 'bg-gold-400 text-dark-950'}`}>
        FREE SHIPPING ON ORDERS ABOVE ₹999 &nbsp;|&nbsp; USE CODE <strong>FIRST10</strong> FOR 10% OFF
      </div>

      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src="/logo.png" alt="Logo" className="h-20 lg:h-28 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {Object.keys(megaMenuItems).map(cat => (
              <div key={cat} className="relative" onMouseEnter={() => setActiveMenu(cat)} onMouseLeave={() => setActiveMenu(null)}>
                <button className="flex items-center space-x-1 font-body font-500 text-sm tracking-widest uppercase transition-colors hover:text-gold-400 text-dark-700 dark:text-stone-300">
                  <span>{cat}</span><FiChevronDown className={`transition-transform ${activeMenu === cat ? 'rotate-180' : ''}`} size={14} />
                </button>
                <AnimatePresence>
                  {activeMenu === cat && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white dark:bg-dark-900 rounded-lg shadow-luxury border border-stone-100 dark:border-dark-700 p-6 grid grid-cols-2 gap-2">
                      <Link to={`/products?gender=${cat.toLowerCase()}`} className="col-span-2 font-heading text-sm font-semibold text-gold-400 border-b border-stone-100 dark:border-dark-700 pb-2 mb-2">
                        All {cat}
                      </Link>
                      {megaMenuItems[cat].map(sub => (
                        <Link key={sub} to={`/products?category=${sub.toLowerCase().replace(' ','-')}&gender=${cat.toLowerCase()}`}
                          className="text-xs font-body text-dark-600 dark:text-stone-400 hover:text-gold-400 transition-colors py-1 capitalize">
                          {sub}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            <Link to="/products?sale=true" className="font-body font-500 text-sm tracking-widest uppercase transition-colors hover:text-red-500 text-red-500 dark:text-red-400">
              SALE
            </Link>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-4 text-dark-700 dark:text-stone-300">
            <button onClick={() => setSearchOpenLocal(true)} className="hover:text-gold-400 transition-colors p-1">
              <FiSearch size={20} />
            </button>

            <button onClick={() => dispatch(toggleDarkMode())} className="hover:text-gold-400 transition-colors p-1 hidden lg:block">
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            {isAuthenticated ? (
              <div className="relative group hidden lg:block">
                <button className="hover:text-gold-400 transition-colors p-1 flex items-center space-x-1">
                  <FiUser size={20} />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-dark-900 rounded-lg shadow-luxury border border-stone-100 dark:border-dark-700 py-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all">
                  <div className="px-4 py-2 border-b border-stone-100 dark:border-dark-700">
                    <p className="font-body text-sm font-medium text-dark-900 dark:text-white">{user?.name}</p>
                    <p className="font-body text-xs text-dark-400">{user?.email}</p>
                  </div>
                  {[['Profile', '/profile'], ['Orders', '/orders'], ['Wishlist', '/wishlist'], ...(user?.role !== 'customer' ? [['Admin', '/admin']] : [])].map(([label, path]) => (
                    <Link key={label} to={path} className="block px-4 py-2 text-sm font-body text-dark-600 dark:text-stone-400 hover:text-gold-400 hover:bg-stone-50 dark:hover:bg-dark-800 transition-colors">{label}</Link>
                  ))}
                  <button onClick={() => dispatch(logout())} className="block w-full text-left px-4 py-2 text-sm font-body text-red-500 hover:bg-stone-50 dark:hover:bg-dark-800 transition-colors">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hover:text-gold-400 transition-colors p-1 hidden lg:block"><FiUser size={20} /></Link>
            )}

            <Link to="/wishlist" className="hover:text-gold-400 transition-colors p-1 hidden lg:block">
              <FiHeart size={20} />
            </Link>

            <button onClick={() => dispatch(setCartOpen(true))} className="hover:text-gold-400 transition-colors p-1 relative">
              <FiShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-400 text-dark-950 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold font-body">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            <button onClick={handleMobileMenuToggle} className="lg:hidden hover:text-gold-400 transition-colors p-1">
              {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 flex items-start justify-center pt-24"
            onClick={(e) => { if (e.target === e.currentTarget) handleMenuClose(); }}>
            <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}
              className="w-full max-w-2xl mx-4">
              <form onSubmit={handleSearch} className="relative">
                <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); fetchSuggestions(e.target.value); }}
                  placeholder="Search for products, brands..."
                  className="w-full bg-white dark:bg-dark-900 text-dark-950 dark:text-white font-body text-lg px-6 py-5 pr-16 rounded-lg border border-stone-200 dark:border-dark-700 focus:outline-none focus:border-gold-400"
                  autoFocus />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-400 hover:text-gold-300">
                  <FiSearch size={24} />
                </button>
              </form>
              {suggestions.length > 0 && (
                <div className="mt-2 bg-white dark:bg-dark-900 rounded-lg border border-stone-100 dark:border-dark-700 overflow-hidden">
                  {suggestions.map(p => (
                    <Link key={p._id} to={`/products/${p.slug}`} onClick={() => { setSearchOpenLocal(false); setSuggestions([]); }}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-dark-800 transition-colors">
                      <img src={p.images?.[0]?.url || '/placeholder.jpg'} alt={p.name} className="w-10 h-10 rounded object-cover" />
                      <div>
                        <p className="font-body text-sm font-medium text-dark-900 dark:text-white">{p.name}</p>
                        <p className="font-body text-xs text-dark-400">{p.category?.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <button onClick={handleMenuClose}
                className="mt-4 mx-auto block text-sm font-body text-stone-400 hover:text-white transition-colors">
                Press ESC to close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween' }}
            className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-dark-950 z-50 shadow-luxury p-6 overflow-y-auto lg:hidden">
            <div className="flex justify-between items-center mb-8">
              <img src="/logo.png" alt="Logo" className="h-16 w-auto object-contain" />
              <button onClick={() => dispatch(setMobileMenuOpen(false))} className="text-dark-400 hover:text-dark-900 dark:text-stone-400 dark:hover:text-white">
                <FiX size={24} />
              </button>
            </div>
            {isAuthenticated ? (
              <div className="mb-6 p-4 bg-stone-50 dark:bg-dark-900 rounded-lg">
                <p className="font-body font-medium text-dark-900 dark:text-white">{user?.name}</p>
                <p className="font-body text-sm text-dark-400">{user?.email}</p>
              </div>
            ) : (
              <div className="flex space-x-3 mb-6">
                <Link to="/login" onClick={() => dispatch(setMobileMenuOpen(false))} className="flex-1 btn-gold text-center rounded">Login</Link>
                <Link to="/register" onClick={() => dispatch(setMobileMenuOpen(false))} className="flex-1 border border-gold-400 text-gold-400 font-body text-sm px-4 py-3 text-center rounded tracking-wide uppercase">Register</Link>
              </div>
            )}
            {Object.keys(megaMenuItems).map(cat => (
              <div key={cat} className="border-b border-stone-100 dark:border-dark-800 py-3">
                <p className="font-body font-semibold text-sm tracking-widest uppercase text-dark-900 dark:text-white mb-2">{cat}</p>
                <div className="grid grid-cols-2 gap-1 pl-2">
                  {megaMenuItems[cat].map(sub => (
                    <Link key={sub} to={`/products?category=${sub.toLowerCase().replace(' ','-')}`}
                      onClick={() => dispatch(setMobileMenuOpen(false))}
                      className="text-xs font-body text-dark-500 dark:text-stone-400 hover:text-gold-400 py-1">{sub}</Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-4 space-y-2">
              {isAuthenticated && (
                <>
                  <Link to="/orders" onClick={() => dispatch(setMobileMenuOpen(false))} className="block font-body text-sm text-dark-600 dark:text-stone-400 py-2">My Orders</Link>
                  <Link to="/wishlist" onClick={() => dispatch(setMobileMenuOpen(false))} className="block font-body text-sm text-dark-600 dark:text-stone-400 py-2">Wishlist</Link>
                  <button onClick={handleLogout} className="block font-body text-sm text-red-500 py-2">Logout</button>
                </>
              )}
              <button onClick={() => dispatch(toggleDarkMode())} className="flex items-center space-x-2 font-body text-sm text-dark-600 dark:text-stone-400 py-2">
                {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
                <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default React.memo(Navbar);
