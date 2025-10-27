import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Test schema
const testSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type TestFormData = z.infer<typeof testSchema>;

// Simple test form component
function TestForm({ onSubmit }: { onSubmit: (data: TestFormData) => void }) {
  const form = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

describe('Form with Zod validation', () => {
  it('renders form with inputs and submit button', () => {
    const mockSubmit = vi.fn();
    render(<TestForm onSubmit={mockSubmit} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('shows validation errors for invalid input', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn();
    render(<TestForm onSubmit={mockSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    // Enter invalid data
    await user.type(emailInput, 'invalid-email');
    await user.type(nameInput, 'A');
    await user.click(submitButton);

    // Wait for validation errors to appear
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    });

    // Submit handler should not be called
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn();
    render(<TestForm onSubmit={mockSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    // Enter valid data
    await user.type(emailInput, 'test@example.com');
    await user.type(nameInput, 'John Doe');
    await user.click(submitButton);

    // Wait for form submission
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          name: 'John Doe',
        }),
      );
    });
  });

  it('clears validation errors when valid data is entered', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn();
    render(<TestForm onSubmit={mockSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    // First, enter invalid data and submit
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });

    // Clear and enter valid data
    await user.clear(emailInput);
    await user.type(emailInput, 'valid@example.com');
    await user.click(submitButton);

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText(/invalid email address/i)).not.toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', () => {
    const mockSubmit = vi.fn();
    render(<TestForm onSubmit={mockSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    const nameInput = screen.getByLabelText(/name/i);

    // Check that inputs have proper labels
    expect(emailInput).toHaveAttribute('id');
    expect(nameInput).toHaveAttribute('id');

    // Check that labels are properly associated
    const emailLabel = screen.getByText(/email/i);
    const nameLabel = screen.getByText(/name/i);
    expect(emailLabel).toHaveAttribute('for', emailInput.getAttribute('id'));
    expect(nameLabel).toHaveAttribute('for', nameInput.getAttribute('id'));
  });
});
