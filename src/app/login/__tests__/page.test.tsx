import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import LoginPage from '../page';

// Mock the auth context
const mockLogin = vi.fn();
const mockRouterPush = vi.fn();

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with required inputs', () => {
    render(<LoginPage />);

    // Check for main heading
    expect(screen.getByText('Gavith Build')).toBeInTheDocument();
    expect(screen.getByText('Construction Management System')).toBeInTheDocument();

    // Check for form inputs
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows create organization button', () => {
    render(<LoginPage />);

    expect(screen.getByRole('button', { name: /create new organization/i })).toBeInTheDocument();
  });

  it('shows forgot password link', () => {
    render(<LoginPage />);

    expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument();
  });

  it('shows demo credentials information', () => {
    render(<LoginPage />);

    expect(screen.getByText(/demo credentials/i)).toBeInTheDocument();
    expect(screen.getByText(/admin\/admin123/i)).toBeInTheDocument();
  });

  it('has proper form accessibility', () => {
    render(<LoginPage />);

    const usernameInput = screen.getByRole('textbox', { name: /username/i });
    const passwordInput = screen.getByDisplayValue('');

    // Check that inputs are properly labeled
    expect(usernameInput).toHaveAttribute('id');
    expect(passwordInput).toHaveAttribute('id');

    // Check that inputs are required
    expect(usernameInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('shows password toggle button with proper aria-label', () => {
    render(<LoginPage />);

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
  });

  it('toggles password visibility when toggle button is clicked', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const passwordInput = screen.getByDisplayValue('');
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button
    await user.click(toggleButton);

    // Password should be visible
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(toggleButton).toHaveAttribute('aria-label', 'Hide password');

    // Click again to hide
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
  });

  it('handles form submission with valid credentials', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const usernameInput = screen.getByRole('textbox', { name: /username/i });
    const passwordInput = screen.getByDisplayValue('');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Enter valid demo credentials
    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'admin123');
    await user.click(submitButton);

    // Should call login and navigate to dashboard
    expect(mockLogin).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'admin',
        email: 'admin@gavithconstruction.com',
      }),
    );
    expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
  });

  it('shows error message for invalid credentials', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const usernameInput = screen.getByRole('textbox', { name: /username/i });
    const passwordInput = screen.getByDisplayValue('');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Enter invalid credentials
    await user.type(usernameInput, 'invalid');
    await user.type(passwordInput, 'wrong');
    await user.click(submitButton);

    // Should show error message
    await expect(screen.findByText(/invalid username or password/i)).resolves.toBeInTheDocument();

    // Should not call login or navigate
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('shows error message for empty fields', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    // Should show error message
    await expect(
      screen.findByText(/please enter both username and password/i),
    ).resolves.toBeInTheDocument();
  });
});
