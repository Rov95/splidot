import { useEffect, type ReactNode } from 'react';
import './modal.css';

interface ModalProps {
    title?: ReactNode;
    onClose: () => void;
    className?: string;
    children: ReactNode;
}

const Modal = ({ title, onClose, className, children }: ModalProps) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="ui-modal__overlay" onClick={onClose}>
            <div
                className={['ui-modal', className].filter(Boolean).join(' ')}
                role="dialog"
                aria-modal="true"
                onClick={(event) => event.stopPropagation()}
            >
                {title && <h2 className="ui-modal__title">{title}</h2>}
                {children}
            </div>
        </div>
    );
};

export default Modal;
