import { configureStore } from '@reduxjs/toolkit';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import authReducer from '../store/slices/authSlice';
import { getHomeRoute, isSafeInternalPath } from '../utils/routing';

afterEach(cleanup);

function renderProtected(auth, allowedRoles = ['student']) {
  const store = configureStore({ reducer: { auth: authReducer }, preloadedState: { auth } });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<ProtectedRoute allowedRoles={allowedRoles}><div>Protected content</div></ProtectedRoute>} />
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/dashboard" element={<div>Student dashboard</div>} />
          <Route path="/alumni/dashboard" element={<div>Alumni dashboard</div>} />
          <Route path="/college/dashboard" element={<div>College dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

const base = { initialized: true, restoring: false, loading: false, error: null };

describe('role-aware routing', () => {
  it('redirects logged-out visitors to login', () => {
    renderProtected({ ...base, isAuthenticated: false, role: null });
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('allows the expected role', () => {
    renderProtected({ ...base, isAuthenticated: true, role: 'student' });
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects unauthorized roles to their own dashboard', () => {
    renderProtected({ ...base, isAuthenticated: true, role: 'alumni' });
    expect(screen.getByText('Alumni dashboard')).toBeInTheDocument();
  });

  it('maps role homes and validates notification links', () => {
    expect(getHomeRoute('college')).toBe('/college/dashboard');
    expect(getHomeRoute('alumni')).toBe('/alumni/dashboard');
    expect(isSafeInternalPath('/chat')).toBe(true);
    expect(isSafeInternalPath('//malicious.example')).toBe(false);
  });
});
