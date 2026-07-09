// Format currency in Indian Rupees
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
};

// Format date
export const formatDate = (date, options = {}) => {
  const defaults = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Intl.DateTimeFormat('en-IN', { ...defaults, ...options }).format(new Date(date));
};

// Generate slug from name
export const generateSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Calculate discounted price
export const getDiscountedPrice = (price, discount) => Math.round(price - (price * discount) / 100);

// Cart totals
export const calculateCartTotals = (items, couponDiscount = 0) => {
  const activeItems = items.filter(i => !i.savedForLater);
  const subtotal = activeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gst = Math.round(subtotal * 0.05);
  const shipping = subtotal >= 999 ? 0 : 79;
  const total = subtotal + gst + shipping - couponDiscount;
  return { subtotal, gst, shipping, total: Math.max(total, 0), itemCount: activeItems.reduce((s, i) => s + i.quantity, 0) };
};

// Truncate text
export const truncate = (text, maxLength) => text?.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

// Get rating stars
export const getRatingStars = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return { full, half, empty };
};

// Debounce
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func(...args), wait); };
};

// Order status colors
export const orderStatusColor = (status) => ({
  pending: 'text-yellow-600 bg-yellow-50',
  processing: 'text-blue-600 bg-blue-50',
  shipped: 'text-purple-600 bg-purple-50',
  out_for_delivery: 'text-orange-600 bg-orange-50',
  delivered: 'text-green-600 bg-green-50',
  cancelled: 'text-red-600 bg-red-50',
  refunded: 'text-gray-600 bg-gray-50',
}[status] || 'text-gray-600 bg-gray-50');

// Resolve image URLs to absolute paths. If `url` is already absolute, return as-is.
export const resolveImage = (url) => {
  const placeholder = 'https://via.placeholder.com/400x500/1a1a1a/d4af37?text=No+Image';
  if (!url) return placeholder;
  if (/^https?:\/\//i.test(url)) return url;
  const base = (process.env.REACT_APP_API_URL || window.location.origin).replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};
