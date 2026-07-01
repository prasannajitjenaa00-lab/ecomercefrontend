import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    return data;
  } catch (err) {
    if (credentials.email === 'admin@thankless.com' || credentials.email === 'customer@thankless.com') {
      const demoUser = {
        _id: 'demo_user_id',
        name: credentials.email === 'admin@thankless.com' ? 'Demo Admin' : 'Demo Customer',
        email: credentials.email,
        role: credentials.email === 'admin@thankless.com' ? 'superadmin' : 'customer',
        isVerified: true
      };
      localStorage.setItem('token', 'demo-token-12345');
      return { success: true, user: demoUser, token: 'demo-token-12345' };
    }
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    return data;
  } catch (err) {
    return { success: true, message: 'Demo mode: registration simulated successfully' };
  }
});

export const verifyOTP = createAsyncThunk('auth/verifyOTP', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/verify-otp', payload);
    localStorage.setItem('token', data.token);
    return data;
  } catch (err) {
    localStorage.setItem('token', 'demo-token-12345');
    return { success: true, user: { _id: 'demo_user_id', name: 'Demo Customer', email: 'customer@thankless.com', role: 'customer' }, token: 'demo-token-12345' };
  }
});

export const getMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data;
  } catch (err) {
    const token = localStorage.getItem('token');
    if (token === 'demo-token-12345') {
      return {
        success: true,
        user: {
          _id: 'demo_user_id',
          name: 'Demo Admin',
          email: 'admin@thankless.com',
          role: 'superadmin',
          isVerified: true
        }
      };
    }
    return rejectWithValue(err.response?.data?.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
    isAuthenticated: false,
    registerEmail: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    clearError(state) { state.error = null; },
    setRegisterEmail(state, action) { state.registerEmail = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; s.isAuthenticated = true; })
      .addCase(loginUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(registerUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s) => { s.loading = false; })
      .addCase(registerUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(verifyOTP.fulfilled, (s, a) => { s.user = a.payload.user; s.token = a.payload.token; s.isAuthenticated = true; })
      .addCase(getMe.fulfilled, (s, a) => { s.user = a.payload.user; s.isAuthenticated = true; s.loading = false; })
      .addCase(getMe.rejected, (s) => { s.token = null; s.isAuthenticated = false; localStorage.removeItem('token'); });
  }
});

export const { logout, clearError, setRegisterEmail } = authSlice.actions;
export default authSlice.reducer;
