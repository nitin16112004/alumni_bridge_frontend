import { configureStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import Register from '../pages/auth/Register';
import authReducer from '../store/slices/authSlice';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

afterEach(cleanup);

describe('registration role UI', () => {
  beforeEach(() => {
    api.get.mockResolvedValue({ data: [] });
  });

  it('shows role-specific alumni and College fields while preserving role cards', async () => {
    const store = configureStore({ reducer: { auth: authReducer } });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/colleges'));
    fireEvent.click(screen.getByRole('button', { name: /Alumni/ }));
    expect(screen.getByLabelText('Graduation year')).toBeInTheDocument();
    expect(screen.getByLabelText('College')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /College/ }));
    expect(screen.getByLabelText('Institution domain')).toBeInTheDocument();
    expect(screen.queryByLabelText('Graduation year')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /College/ })).toHaveAttribute('aria-pressed', 'true');
  });
});
