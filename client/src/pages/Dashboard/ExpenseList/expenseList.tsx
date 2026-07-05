import { formatDate } from '../../../utils/date';
import type { LocalExpense } from '../../../types';
import './styles.css';

interface ExpenseListProps {
    expenses: LocalExpense[];
    onDeleteExpense: (expenseId: string) => void;
}

const ExpenseList = ({ expenses, onDeleteExpense }: ExpenseListProps) => {
    return (
        <div className="expense-list">
            <ul>
                {expenses.map((expense) => (
                    <li key={expense.expense_id}>
                        <div className="expense-list__info">
                            <strong>{expense.expenseName}</strong>
                            <span>{expense.category}, ${expense.amount} by {expense.payerName}</span>
                            {formatDate(expense.createdAt) && (
                                <span className="expense-list__date">{formatDate(expense.createdAt)}</span>
                            )}
                        </div>
                        <button
                            onClick={() => onDeleteExpense(expense.expense_id)}
                            className="delete-expense-btn"
                            aria-label="Delete expense"
                        >
                            ✕
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ExpenseList;
