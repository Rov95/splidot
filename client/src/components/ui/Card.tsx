import type { ReactNode } from 'react';
import './card.css';

interface CardProps {
    title?: ReactNode;
    actions?: ReactNode;
    className?: string;
    children: ReactNode;
}

const Card = ({ title, actions, className, children }: CardProps) => (
    <section className={['ui-card', className].filter(Boolean).join(' ')}>
        {(title || actions) && (
            <header className="ui-card__header">
                {title && <h2 className="ui-card__title">{title}</h2>}
                {actions && <div className="ui-card__actions">{actions}</div>}
            </header>
        )}
        {children}
    </section>
);

export default Card;
