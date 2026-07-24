import { configureStore } from '@reduxjs/toolkit';
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { io } from 'socket.io-client';
import { SocketProvider } from '../components/providers/SocketProvider';
import authReducer from '../store/slices/authSlice';
import notificationReducer from '../store/slices/notificationSlice';
import toastReducer from '../store/slices/toastSlice';

const { fakeSocket } = vi.hoisted(() => ({
  fakeSocket: {
    on: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
  },
}));

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => fakeSocket),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('shared Socket.IO provider', () => {
  it('creates one authenticated connection and cleans all listeners on unmount', async () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        notifications: notificationReducer,
        toast: toastReducer,
      },
      preloadedState: {
        auth: {
          token: 'token',
          role: 'student',
          entityType: 'user',
          user: { _id: 'u1', role: 'student' },
          college: null,
          currentEntity: { _id: 'u1' },
          initialized: true,
          isAuthenticated: true,
          loading: false,
          restoring: false,
          error: null,
        },
      },
    });
    const view = render(<Provider store={store}><SocketProvider><div>App</div></SocketProvider></Provider>);
    await waitFor(() => expect(io).toHaveBeenCalledTimes(1));
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ auth: { token: 'token' } }));
    view.unmount();
    expect(fakeSocket.off).toHaveBeenCalledWith('notification', expect.any(Function));
    expect(fakeSocket.disconnect).toHaveBeenCalled();
  });
});
