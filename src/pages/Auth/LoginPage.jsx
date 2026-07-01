// LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { if (isAuthenticated) navigate('/'); }, [isAuthenticated]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your Thankless Fashion account">
      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField icon={FiMail} type="email" placeholder="Email address" value={form.email}
          onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
        <InputField icon={FiLock} type={showPass ? 'text' : 'password'} placeholder="Password" value={form.password}
          onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required
          suffix={<button type="button" onClick={() => setShowPass(!showPass)} className="text-stone-400 hover:text-dark-700">{showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}</button>} />
        <div className="text-right">
          <Link to="/forgot-password" className="font-body text-sm text-gold-400 hover:underline">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} className="w-full btn-gold rounded-lg flex items-center justify-center space-x-2 disabled:opacity-60">
          {loading ? <><div className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" /><span>Signing in...</span></> : 'Sign In'}
        </button>
      </form>
      <p className="font-body text-sm text-center text-stone-400 mt-6">
        Don't have an account? <Link to="/register" className="text-gold-400 hover:underline font-medium">Create one</Link>
      </p>
    </AuthLayout>
  );
}

// RegisterPage.jsx
export function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    const result = await dispatch(require('../../store/slices/authSlice').registerUser(form));
    if (!result.error) {
      dispatch(require('../../store/slices/authSlice').setRegisterEmail(form.email));
      navigate('/verify-otp');
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join Thankless Fashion for exclusive fashion">
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField icon={require('react-icons/fi').FiUser} type="text" placeholder="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
        <InputField icon={FiMail} type="email" placeholder="Email address" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
        <InputField icon={require('react-icons/fi').FiPhone} type="tel" placeholder="Phone Number" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
        <InputField icon={FiLock} type={showPass ? 'text' : 'password'} placeholder="Password (min 6 chars)" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required
          suffix={<button type="button" onClick={() => setShowPass(!showPass)} className="text-stone-400">{showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}</button>} />
        <InputField icon={FiLock} type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
        <button type="submit" disabled={loading} className="w-full btn-gold rounded-lg disabled:opacity-60">
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      <p className="font-body text-sm text-center text-stone-400 mt-6">
        Already have an account? <Link to="/login" className="text-gold-400 hover:underline font-medium">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

// VerifyOTPPage.jsx
export function VerifyOTPPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { registerEmail, loading } = useSelector(s => s.auth);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = React.useRef([]);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { toast.warning('Enter complete 6-digit OTP'); return; }
    const result = await dispatch(require('../../store/slices/authSlice').verifyOTP({ email: registerEmail, otp: code }));
    if (!result.error) navigate('/');
    else toast.error('Invalid or expired OTP');
  };

  return (
    <AuthLayout title="Verify Email" subtitle={`Enter the 6-digit OTP sent to ${registerEmail}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center space-x-3">
          {otp.map((digit, i) => (
            <input key={i} ref={el => inputRefs.current[i] = el} type="text" maxLength={1} value={digit}
              onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-2xl font-body font-bold border-2 border-stone-200 dark:border-dark-700 rounded-xl bg-transparent dark:text-white focus:outline-none focus:border-gold-400 transition-colors" />
          ))}
        </div>
        <button type="submit" disabled={loading} className="w-full btn-gold rounded-lg disabled:opacity-60">
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
      <p className="font-body text-sm text-center text-stone-400 mt-6">
        Didn't receive? <button onClick={() => require('../../utils/api').default.post('/auth/resend-otp', { email: registerEmail }).then(() => toast.success('OTP resent!'))} className="text-gold-400 hover:underline">Resend OTP</button>
      </p>
    </AuthLayout>
  );
}

// ForgotPasswordPage.jsx
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await require('../../utils/api').default.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send email'); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Forgot Password" subtitle="We'll send you a reset link">
      {sent ? (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <FiMail size={28} className="text-green-500" />
          </div>
          <p className="font-body text-dark-700 dark:text-stone-300">Reset link sent to <strong>{email}</strong>. Check your inbox.</p>
          <Link to="/login" className="block btn-gold rounded-lg text-center mt-4">Back to Login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField icon={FiMail} type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required />
          <button type="submit" disabled={loading} className="w-full btn-gold rounded-lg disabled:opacity-60">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <Link to="/login" className="block text-center font-body text-sm text-stone-400 hover:text-gold-400">Back to Login</Link>
        </form>
      )}
    </AuthLayout>
  );
}

// ResetPasswordPage.jsx
export function ResetPasswordPage() {
  const { token } = require('react-router-dom').useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await require('../../utils/api').default.put(`/auth/reset-password/${token}`, { password: form.password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) { toast.error(err.response?.data?.message || 'Reset failed'); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password">
      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField icon={FiLock} type="password" placeholder="New Password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
        <InputField icon={FiLock} type="password" placeholder="Confirm New Password" value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} required />
        <button type="submit" disabled={loading} className="w-full btn-gold rounded-lg disabled:opacity-60">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </AuthLayout>
  );
}

// Shared Components
function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-dark-950 flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="bg-white dark:bg-dark-900 rounded-2xl shadow-card border border-stone-100 dark:border-dark-800 p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <img src="/logo.png" alt="Logo" className="h-16 w-auto object-contain mx-auto" />
            </Link>
            <h2 className="font-heading text-2xl text-dark-950 dark:text-white mb-2">{title}</h2>
            <p className="font-body text-sm text-stone-400">{subtitle}</p>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}

function InputField({ icon: Icon, suffix, ...props }) {
  return (
    <div className="relative">
      <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
      <input {...props} className="w-full bg-stone-50 dark:bg-dark-800 border border-stone-200 dark:border-dark-700 rounded-xl pl-11 pr-10 py-3.5 text-sm font-body text-dark-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:border-gold-400 focus:bg-white dark:focus:bg-dark-700 transition-all" />
      {suffix && <div className="absolute right-4 top-1/2 -translate-y-1/2">{suffix}</div>}
    </div>
  );
}

export default LoginPage;
