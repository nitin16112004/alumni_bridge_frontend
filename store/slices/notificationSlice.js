import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/notifications');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const markAllRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await api.put('/notifications/read-all');
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], loading: false },
  reducers: {
    addNotification(state, action) {
      state.items.unshift({ ...action.payload, isRead: false, createdAt: new Date().toISOString() });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (s, a) => { s.items = a.payload; s.loading = false; })
      .addCase(fetchNotifications.pending, (s) => { s.loading = true; })
      .addCase(fetchNotifications.rejected, (s) => { s.loading = false; })
      .addCase(markAllRead.fulfilled, (s) => { s.items = s.items.map(n => ({ ...n, isRead: true })); });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
