import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { MOCK_PRODUCTS } from '../../utils/mockData';

// Helper to get local cart
const getLocalCart = () => {
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : { items: [], coupon: null, couponDiscount: 0 };
  } catch (e) {
    return { items: [], coupon: null, couponDiscount: 0 };
  }
};

// Helper to set local cart
const setLocalCart = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

// ─── Cart Slice ───────────────────────────────────────────────────────────────
export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try { 
    const { data } = await api.get('/cart'); 
    return data.cart; 
  } catch (err) { 
    return getLocalCart();
  }
});

export const addToCart = createAsyncThunk('cart/add', async (payload, { rejectWithValue }) => {
  try { 
    const { data } = await api.post('/cart/add', payload); 
    return data.cart; 
  } catch (err) { 
    const cart = getLocalCart();
    const existingItem = cart.items.find(i => (i.product?._id || i.product) === payload.productId);
    if (existingItem) {
      existingItem.quantity += payload.quantity || 1;
    } else {
      const productObj = MOCK_PRODUCTS.find(p => p._id === payload.productId);
      cart.items.push({
        _id: 'cart_item_' + Math.random().toString(36).substring(2, 9),
        product: productObj || { _id: payload.productId, price: 999, name: 'Product' },
        quantity: payload.quantity || 1
      });
    }
    setLocalCart(cart);
    return cart;
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try { 
    const { data } = await api.put(`/cart/update/${itemId}`, { quantity }); 
    return data.cart; 
  } catch (err) { 
    const cart = getLocalCart();
    const item = cart.items.find(i => i._id === itemId || i.product?._id === itemId || i.product === itemId);
    if (item) {
      item.quantity = quantity;
    }
    setLocalCart(cart);
    return cart;
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try { 
    const { data } = await api.delete(`/cart/remove/${itemId}`); 
    return data.cart; 
  } catch (err) { 
    const cart = getLocalCart();
    cart.items = cart.items.filter(i => i._id !== itemId && i.product?._id !== itemId && i.product !== itemId);
    setLocalCart(cart);
    return cart;
  }
});

export const applyCoupon = createAsyncThunk('cart/coupon', async (code, { rejectWithValue }) => {
  try { 
    const { data } = await api.post('/cart/apply-coupon', { code }); 
    return data; 
  } catch (err) { 
    const cart = getLocalCart();
    const upperCode = code.toUpperCase();
    if (upperCode === 'DISCOUNT30' || upperCode === 'THANKLESS30') {
      cart.coupon = upperCode;
      cart.couponDiscount = 30; // 30% discount
      setLocalCart(cart);
      return { success: true, message: 'Coupon applied!', cart };
    }
    return rejectWithValue('Invalid coupon code');
  }
});

export const removeCoupon = createAsyncThunk('cart/removeCoupon', async (_, { rejectWithValue }) => {
  try { 
    const { data } = await api.delete('/cart/remove-coupon'); 
    return data.cart; 
  } catch (err) { 
    const cart = getLocalCart();
    cart.coupon = null;
    cart.couponDiscount = 0;
    setLocalCart(cart);
    return cart;
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], coupon: null, couponDiscount: 0, loading: false, error: null },
  reducers: { clearCart(state) { state.items = []; state.coupon = null; state.couponDiscount = 0; } },
  extraReducers: (builder) => {
    const setCart = (s, a) => { const c = a.payload; s.items = c.items; s.coupon = c.coupon; s.couponDiscount = c.couponDiscount; s.loading = false; };
    builder
      .addCase(fetchCart.pending, (s) => { s.loading = true; })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(addToCart.fulfilled, setCart)
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeFromCart.fulfilled, setCart)
      .addCase(applyCoupon.fulfilled, (s, a) => { const c = a.payload.cart; s.items = c.items; s.coupon = c.coupon; s.couponDiscount = c.couponDiscount; })
      .addCase(removeCoupon.fulfilled, setCart);
  }
});

// ─── Wishlist Slice ───────────────────────────────────────────────────────────
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false },
  reducers: {
    setWishlist(state, action) { state.items = action.payload; },
    toggleItem(state, action) {
      const id = action.payload;
      const idx = state.items.findIndex(i => (i._id || i) === id);
      if (idx > -1) state.items.splice(idx, 1);
      else {
        const productObj = MOCK_PRODUCTS.find(p => p._id === id);
        state.items.push(productObj || id);
      }
    }
  }
});

// ─── Product Slice ────────────────────────────────────────────────────────────
export const fetchProducts = createAsyncThunk('products/fetch', async (params, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const { data } = await api.get(`/products?${query}`);
    return data;
  } catch (err) {
    let products = [...MOCK_PRODUCTS];
    if (params?.gender && params.gender !== 'unisex') {
      products = products.filter(p => p.category?.gender === params.gender || p.category?.slug === params.gender);
    }
    if (params?.category) {
      products = products.filter(p => p.category?.slug === params.category || p.category?._id === params.category);
    }
    if (params?.sale === 'true' || params?.isFlashSale === 'true') {
      products = products.filter(p => p.discount > 0);
    }
    if (params?.isNewArrival === 'true') {
      products = products.filter(p => p.isNewArrival);
    }
    if (params?.isBestSeller === 'true') {
      products = products.filter(p => p.isBestSeller);
    }
    if (params?.isFeatured === 'true') {
      products = products.filter(p => p.isFeatured);
    }
    return {
      products,
      pagination: { page: 1, pages: 1, total: products.length }
    };
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: { items: [], pagination: null, loading: false, error: null, filters: {} },
  reducers: { setFilters(state, action) { state.filters = action.payload; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchProducts.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.products; s.pagination = a.payload.pagination; })
      .addCase(fetchProducts.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  }
});

// ─── UI Slice ─────────────────────────────────────────────────────────────────
const uiSlice = createSlice({
  name: 'ui',
  initialState: { darkMode: false, cartOpen: false, searchOpen: false, mobileMenuOpen: false },
  reducers: {
    toggleDarkMode(state) { state.darkMode = !state.darkMode; },
    setCartOpen(state, action) { state.cartOpen = action.payload; },
    setSearchOpen(state, action) { state.searchOpen = action.payload; },
    setMobileMenuOpen(state, action) { state.mobileMenuOpen = action.payload; },
  }
});

export const cartActions = cartSlice.actions;
export const { setWishlist, toggleItem } = wishlistSlice.actions;
export const { setFilters } = productSlice.actions;
export const { toggleDarkMode, setCartOpen, setSearchOpen, setMobileMenuOpen } = uiSlice.actions;

export { cartSlice as default };

// Named exports for individual slice reducers
export const cartReducer = cartSlice.reducer;
export const wishlistReducer = wishlistSlice.reducer;
export const productReducer = productSlice.reducer;
export const uiReducer = uiSlice.reducer;
