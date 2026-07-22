import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { getApiErrorMessage } from '../../services/apiError';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    const entity = data.entityType === 'college' ? data.college : data.user;
    localStorage.setItem('user', JSON.stringify({ ...entity, entityType: data.entityType }));
    return { ...data, entity };
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Login failed'));
  }
});

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify({ ...res.data.user, entityType: 'user' }));
    return res.data;
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Registration failed'));
  }
});

export const registerCollege = createAsyncThunk('auth/registerCollege', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register-college', data);
    const normalizedResponse = { ...res.data, entityType: res.data.entityType || 'college' };
    localStorage.setItem('token', normalizedResponse.token);
    localStorage.setItem('user', JSON.stringify({ ...normalizedResponse.college, entityType: 'college' }));
    return normalizedResponse;
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Registration failed'));
  }
});

const storedUser = localStorage.getItem('user');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError(state) {
      state.error = null;
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.token = a.payload.token;
        s.user = { ...a.payload.entity, entityType: a.payload.entityType };
      })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(registerUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.loading = false;
        s.token = a.payload.token;
        s.user = { ...a.payload.user, entityType: 'user' };
      })
      .addCase(registerUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(registerCollege.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(registerCollege.fulfilled, (s, a) => {
        s.loading = false;
        s.token = a.payload.token;
        s.user = { ...a.payload.college, entityType: 'college' };
      })
      .addCase(registerCollege.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
