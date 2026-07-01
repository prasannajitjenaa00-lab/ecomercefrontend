import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getMe } from './store/slices/authSlice';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import SearchOverlay from './components/common/SearchOverlay';

// Pages
import HomePage from './pages/Home/HomePage';
import ProductsPage from './pages/Product/ProductsPage';
import ProductDetailPage from './pages/Product/ProductDetailPage';
import CartPage from './pages/Cart/CartPage';
import CheckoutPage from './pages/Cart/CheckoutPage';
import OrderSuccessPage from './pages/Cart/OrderSuccessPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import VerifyOTPPage from './pages/Auth/VerifyOTPPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import ProfilePage from './pages/Profile/ProfilePage';
import OrdersPage from './pages/Profile/OrdersPage';
import OrderDetailPage from './pages/Profile/OrderDetailPage';
import WishlistPage from './pages/Profile/WishlistPage';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminCoupons from './pages/Admin/AdminCoupons';
import AdminCategories from './pages/Admin/AdminCategories';
import AdminBrands from './pages/Admin/AdminBrands';
import AdminBanners from './pages/Admin/AdminBanners';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useSelector(s => s.auth);
  if (!token && !isAuthenticated) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector(s => s.auth);
  if (!isAuthenticated || !['admin', 'superadmin'].includes(user?.role)) return <Navigate to="/" />;
  return children;
};

function App() {
  const dispatch = useDispatch();
  const { darkMode } = useSelector(s => s.ui);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) dispatch(getMe());
  }, [dispatch, token]);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Router>
        <div className="min-h-screen bg-stone-50 dark:bg-dark-950 transition-colors duration-300">
          <Navbar />
          <CartDrawer />
          <SearchOverlay />
          <main>
            <Routes>
              {/* Public */}
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/category/:slug" element={<ProductsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-otp" element={<VerifyOTPPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              {/* Protected */}
              <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
              {/* Admin */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="brands" element={<AdminBrands />} />
                <Route path="banners" element={<AdminBanners />} />
              </Route>
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="top-right" autoClose={3000} theme={darkMode ? 'dark' : 'light'} />
        </div>
      </Router>
    </div>
  );
}

export default App;
