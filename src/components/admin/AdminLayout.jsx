import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiShoppingBag, FiPackage, FiUsers, FiTag, FiList, FiGlobe, FiImage, FiMenu, FiX, FiLogOut, FiBell, FiChevronRight } from 'react-icons/fi';
import { logout } from '../../store/slices/authSlice';

const navItems = [
  { path: '/admin', icon: FiHome, label: 'Dashboard' },
  { path: '/admin/products', icon: FiShoppingBag, label: 'Products' },
  { path: '/admin/orders', icon: FiPackage, label: 'Orders' },
  { path: '/admin/users', icon: FiUsers, label: 'Customers' },
  { path: '/admin/categories', icon: FiList, label: 'Categories' },
  { path: '/admin/brands', icon: FiGlobe, label: 'Brands' },
  { path: '/admin/coupons', icon: FiTag, label: 'Coupons' },
  { path: '/admin/banners', icon: FiImage, label: 'Banners' },
];

export default function AdminLayout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (path) => path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-dark-950 text-white flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'tween', duration: 0.25 }}
            className="fixed inset-y-0 left-0 w-64 bg-dark-900 border-r border-dark-800 z-40 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-dark-800">
              <Link to="/" className="block">
                <h1 className="font-display text-xl font-bold text-white">OVER<span className="text-gold-400">RATED</span></h1>
                <p className="font-body text-xs text-stone-500 mt-0.5">Admin Dashboard</p>
              </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link key={path} to={path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-body text-sm ${isActive(path) ? 'bg-gold-400/15 text-gold-400 font-medium border border-gold-400/20' : 'text-stone-400 hover:text-white hover:bg-dark-800'}`}>
                  <Icon size={18} />
                  <span>{label}</span>
                  {isActive(path) && <FiChevronRight size={14} className="ml-auto" />}
                </Link>
              ))}
            </nav>

            {/* User */}
            <div className="p-4 border-t border-dark-800">
              <div className="flex items-center space-x-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-gold-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-body text-sm font-bold text-gold-400">{user?.name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium text-white truncate">{user?.name}</p>
                  <p className="font-body text-xs text-stone-500 capitalize">{user?.role}</p>
                </div>
                <button onClick={() => { dispatch(logout()); navigate('/login'); }} className="text-stone-400 hover:text-red-400 transition-colors p-1">
                  <FiLogOut size={16} />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-dark-950 border-b border-dark-800 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-stone-400 hover:text-white transition-colors">
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <div className="flex items-center space-x-4">
            <button className="relative text-stone-400 hover:text-white transition-colors">
              <FiBell size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-gold-400 rounded-full" />
            </button>
            <Link to="/" className="font-body text-xs text-stone-400 hover:text-gold-400 border border-dark-700 px-3 py-1.5 rounded-lg transition-colors">
              View Store
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
