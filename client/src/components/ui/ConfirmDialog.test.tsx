import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from './ConfirmDialog';

const renderDialog = (onConfirm: () => void, onCancel: () => void) =>
  render(
    <ConfirmDialog
      title="Delete group?"
      message="This cannot be undone."
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );

describe('ConfirmDialog', () => {
  it('renders the title and message', () => {
    renderDialog(vi.fn(), vi.fn());

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete group?')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
  });

  it('calls onConfirm when the confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();

    renderDialog(onConfirm, onCancel);
    await user.click(screen.getByTestId('confirm-dialog-confirm'));

    expect(onConfirm).toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();

    renderDialog(onConfirm, onCancel);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('calls onCancel when Escape is pressed', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();

    renderDialog(onConfirm, onCancel);
    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
