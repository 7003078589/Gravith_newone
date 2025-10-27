import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from '@/components/ui/button';

// Simple test component to verify the testing setup works
function TestComponent() {
  return (
    <div>
      <h1>Test Component</h1>
      <Button>Test Button</Button>
    </div>
  );
}

describe('Smoke Tests', () => {
  it('renders a simple component', () => {
    render(<TestComponent />);

    expect(screen.getByText('Test Component')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument();
  });

  it('verifies testing library matchers work', () => {
    render(<TestComponent />);

    const heading = screen.getByText('Test Component');
    const button = screen.getByRole('button', { name: /test button/i });

    // Test jest-dom matchers
    expect(heading).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(button).toBeVisible();
  });

  it('verifies component styling classes are applied', () => {
    render(<Button variant="destructive">Delete</Button>);

    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toHaveClass('bg-destructive');
  });
});
