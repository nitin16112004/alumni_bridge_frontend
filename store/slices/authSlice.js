import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';
import { getApiErrorMessage } from '../../services/apiError';
import {
  clearStoredSession,
  loadStoredSession,
  normalizeAuthPayload,
  persistSession,
} from '../../services/session';

const storedSession = loadStoredSession();

const createAuthThunk = (type, endpoint, fallbackEntityType, fallbackMessage) =>
  createAsyncThunk(type, async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post(endpoint, payload);
      const session = normalizeAuthPayload(data, fallbackEntityType);
      persistSession(session);
      return session;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, fallbackMessage));
    }
  });

export const login = createAuthThunk('auth/login', '/auth/login', null, 'Login failed.');
export const registerUser = createAuthThunk(
  'auth/register',
  '/auth/register',
  'user',
  'Registration failed.',
);
export const registerCollege = createAuthThunk(
  'auth/registerCollege',
  '/auth/register-college',
  'college',
  'Registration failed.',
);

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    const sessionToRestore = loadStoredSession();
    if (!sessionToRestore?.token) return null;
    try {
      const { data } = await api.get('/auth/me');
      const session = normalizeAuthPayload(
        { ...data, token: sessionToRestore.token },
        sessionToRestore.entityType,
      );
      persistSession(session);
      return session;
    } catch (error) {
      clearStoredSession();
      return rejectWithValue(getApiErrorMessage(error, 'Your session could not be restored.'));
    }
  },
);

const emptySession = {
  token: null,
  entityType: null,
  user: null,
  college: null,
  currentEntity: null,
  role: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...emptySession,
    ...(storedSession || {}),
    isAuthenticated: Boolean(storedSession?.token),
    loading: false,
    restoring: Boolean(storedSession?.token),
    initialized: !storedSession?.token,
    error: null,
  },
  reducers: {
    logout(state) {
      Object.assign(state, emptySession, {
        isAuthenticated: false,
        loading: false,
        restoring: false,
        initialized: true,
        error: null,
      });
      clearStoredSession();
    },
    clearError(state) {
      state.error = null;
    },
    updateCurrentEntity(state, action) {
      if (state.entityType === 'college') {
        state.college = { ...state.college, ...action.payload };
        state.currentEntity = state.college;
      } else {
        state.user = { ...state.user, ...action.payload };
        state.currentEntity = state.user;
      }
      persistSession(state);
    },
  },
  extraReducers: (builder) => {
    const authThunks = [login, registerUser, registerCollege];
    authThunks.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          Object.assign(state, action.payload, {
            loading: false,
            restoring: false,
            initialized: true,
            isAuthenticated: true,
            error: null,
          });
        })
        .addCase(thunk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    });

    builder
      .addCase(restoreSession.pending, (state) => {
        state.restoring = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (action.payload) {
          Object.assign(state, action.payload, { isAuthenticated: true });
        } else {
          Object.assign(state, emptySession, { isAuthenticated: false });
        }
        state.restoring = false;
        state.initialized = true;
      })
      .addCase(restoreSession.rejected, (state) => {
        Object.assign(state, emptySession, {
          isAuthenticated: false,
          restoring: false,
          initialized: true,
          error: null,
        });
      });
  },
});

export const { logout, clearError, updateCurrentEntity } = authSlice.actions;
export const updateUser = updateCurrentEntity;
export default authSlice.reducer;
