import './spinner.css';

const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' }) => (
    <span className={`ui-spinner ui-spinner--${size}`} role="status" aria-label="Loading" />
);

export default Spinner;
