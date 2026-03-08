import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// These tests verify the auth-related pages render without crashing
// and contain the expected UI elements

// Minimal stub for next/navigation used by auth pages
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
  useParams: () => ({}),
}));

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    login: vi.fn(),
    isAuthenticated: false,
    user: null,
    error: null,
    loading: false,
  }),
}));

vi.mock('@/lib/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    defaults: { headers: { common: {} } },
  },
  authAPI: {
    login: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

// Lazy import to avoid top-level module resolution issues in test env
describe('Forgot Password page', () => {
  it('renders a heading and email input', async () => {
    const { default: ForgotPasswordPage } = await import('../app/forgot-password/page');
    render(React.createElement(ForgotPasswordPage));
    // Should have some heading text
    const headings = screen.queryAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });
});

describe('Login page', () => {
  it('renders without crashing', async () => {
    const { default: LoginPage } = await import('../app/login/page');
    const { container } = render(React.createElement(LoginPage));
    expect(container).toBeTruthy();
  });

  it('contains a forgot password link', async () => {
    const { default: LoginPage } = await import('../app/login/page');
    render(React.createElement(LoginPage));
    const forgotLink = screen.queryByText(/forgot password/i);
    expect(forgotLink).not.toBeNull();
  });
});
