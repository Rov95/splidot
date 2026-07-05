import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from './Toast';

const ShowToastButton = ({ message }: { message: string }) => {
  const { showToast } = useToast();
  return <button onClick={() => showToast(message, 'success')}>show</button>;
};

describe('Toast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a toast and auto-dismisses it after the timeout', () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <ShowToastButton message="Saved" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'show' }));
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('stacks multiple toasts', () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <ShowToastButton message="First" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'show' }));
    fireEvent.click(screen.getByRole('button', { name: 'show' }));

    expect(screen.getAllByText('First')).toHaveLength(2);
  });

  it('throws a descriptive error when useToast is used outside the provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<ShowToastButton message="x" />)).toThrow(
      'useToast must be used within a ToastProvider'
    );

    consoleError.mockRestore();
  });
});
