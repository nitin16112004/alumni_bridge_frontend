import { configureStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import RoleSelector from '../components/auth/RoleSelector';
import NotificationPanel from '../components/common/NotificationPanel';
import { MobileDrawer } from '../components/layout/AppShell';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import notificationReducer from '../store/slices/notificationSlice';

afterEach(cleanup);

describe('shared UI states', () => {
  it('supports accessible role selection', () => {
    const onChange = vi.fn();
    render(<RoleSelector value="student" onChange={onChange} />);
    expect(screen.getByRole('button', { name: /Student/ })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: /College/ }));
    expect(onChange).toHaveBeenCalledWith('college');
  });

  it('renders explicit empty and retry states', () => {
    const retry = vi.fn();
    const { rerender } = render(<EmptyState title="Nothing here" description="Try another filter." />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    rerender(<ErrorState message="Could not load" onRetry={retry} />);
    fireEvent.click(screen.getByRole('button', { name: /Retry/ }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it('renders and closes the mobile navigation drawer', () => {
    const close = vi.fn();
    render(<MemoryRouter><MobileDrawer open onClose={close} role="student" entity={{ name: 'Nitin', email: 'n@example.com' }} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('link', { name: /Dashboard/ }));
    expect(close).toHaveBeenCalled();
  });

  it('closes notifications with Escape and uses stable notification IDs', () => {
    const close = vi.fn();
    const store = configureStore({
      reducer: { notifications: notificationReducer },
      preloadedState: {
        notifications: {
          items: [{ _id: 'n1', message: 'Approved', type: 'approval', isRead: false, createdAt: new Date().toISOString(), link: '/dashboard' }],
          loading: false,
          error: null,
        },
      },
    });
    render(<Provider store={store}><MemoryRouter><NotificationPanel open onClose={close} anchorRef={{ current: null }} /></MemoryRouter></Provider>);
    expect(screen.getByText('Approved')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(close).toHaveBeenCalled();
  });
});
