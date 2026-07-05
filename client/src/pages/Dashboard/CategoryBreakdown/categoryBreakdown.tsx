import type { LocalExpense } from '../../../types';
import './styles.css';

interface CategoryBreakdownProps {
    expenses: LocalExpense[];
}

const CategoryBreakdown = ({ expenses }: CategoryBreakdownProps) => {
    if (expenses.length === 0) return null;

    const totals = new Map<string, number>();
    for (const expense of expenses) {
        const category = expense.category || 'others';
        totals.set(category, (totals.get(category) ?? 0) + expense.amount);
    }
    const grandTotal = [...totals.values()].reduce((sum, total) => sum + total, 0);
    const rows = [...totals.entries()]
        .map(([category, total]) => ({
            category,
            total,
            pct: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
        }))
        .sort((a, b) => b.total - a.total);

    return (
        <div className="category-breakdown">
            <h3 className="category-breakdown__title">Spending by category</h3>
            <ul className="category-breakdown__list">
                {rows.map((row) => (
                    <li key={row.category} className="category-breakdown__row">
                        <span className="category-breakdown__label">{row.category}</span>
                        <span className="category-breakdown__track">
                            <span
                                className="category-breakdown__bar"
                                style={{ width: `${row.pct}%` }}
                            />
                        </span>
                        <span className="category-breakdown__amount">${row.total.toFixed(2)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CategoryBreakdown;
