import type { ButtonHTMLAttributes } from 'react';
import './button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md';
}

const Button = ({ variant = 'primary', size = 'md', className, ...rest }: ButtonProps) => (
    <button
        className={['ui-btn', `ui-btn--${variant}`, `ui-btn--${size}`, className].filter(Boolean).join(' ')}
        {...rest}
    />
);

export default Button;
