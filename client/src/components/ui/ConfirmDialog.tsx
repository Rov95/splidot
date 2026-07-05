import Button from './Button';
import Modal from './Modal';
import './confirm-dialog.css';

interface ConfirmDialogProps {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog = ({
    title,
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    danger = true,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) => (
    <Modal title={title} onClose={onCancel} className="ui-confirm">
        <p className="ui-confirm__message">{message}</p>
        <div className="ui-confirm__actions">
            <Button variant="ghost" onClick={onCancel}>
                {cancelLabel}
            </Button>
            <Button
                variant={danger ? 'danger' : 'primary'}
                data-testid="confirm-dialog-confirm"
                onClick={onConfirm}
            >
                {confirmLabel}
            </Button>
        </div>
    </Modal>
);

export default ConfirmDialog;
