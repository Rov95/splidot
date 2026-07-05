import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import './toast.css';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const nextId = useRef(0);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = nextId.current++;
        setToasts((current) => [...current, { id, message, type }]);
        setTimeout(() => {
            setToasts((current) => current.filter((toast) => toast.id !== id));
        }, TOAST_DURATION_MS);
    }, []);

    const value = useMemo(() => ({ showToast }), [showToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="ui-toast__stack">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`ui-toast ui-toast--${toast.type}`}
                        role="status"
                        aria-live="polite"
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextValue => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
