import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { getApiErrorMessage } from '../../services/apiError';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/notifications');
    return data;
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Notifications could not be loaded.'));
  }
});

export const markAllRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await api.put('/notifications/read-all');
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Notifications could not be updated.'));
  }
});

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      await api.put(`/notifications/${id}/read`);
      return id;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Notification could not be updated.'));
    }
  },
);

const stableKey = (notification) => notification?._id
  || notification?.eventKey
  || [
    notification?.type || 'notification',
    notification?.message || '',
    notification?.link || '',
    notification?.conversationId || '',
  ].join(':');

const mergeNotifications = (current, incoming) => {
  const seen = new Set();
  return [...incoming, ...current].filter((item) => {
    const key = stableKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 75);
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    addNotification(state, action) {
      const incoming = {
        ...action.payload,
        eventKey: stableKey(action.payload),
        isRead: false,
        createdAt: action.payload.createdAt || new Date().toISOString(),
      };
      state.items = mergeNotifications(state.items, [incoming]);
    },
    clearNotifications(state) {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (s, a) => {
        s.items = mergeNotifications(s.items, a.payload);
        s.loading = false;
        s.error = null;
      })
      .addCase(fetchNotifications.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchNotifications.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(markAllRead.fulfilled, (s) => {
        s.items = s.items.map((notification) => ({ ...notification, isRead: true }));
      })
      .addCase(markNotificationRead.fulfilled, (s, a) => {
        const notification = s.items.find((item) => item._id === a.payload);
        if (notification) notification.isRead = true;
      });
  },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
