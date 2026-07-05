import type { ReactNode } from 'react';
import './empty-state.css';

interface EmptyStateProps {
    icon?: string;
    message: string;
    action?: ReactNode;
}

const EmptyState = ({ icon = '/dot.svg', message, action }: EmptyStateProps) => (
    <div className="ui-empty">
        <img src={icon} alt="" className="ui-empty__icon" />
        <p className="ui-empty__message">{message}</p>
        {action}
    </div>
);

export default EmptyState;
