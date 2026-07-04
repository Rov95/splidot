import type { LocalExpense } from '../../../types';
import './styles.css';

interface ExpenseListProps {
    expenses: LocalExpense[];
    onDeleteExpense: (expenseId: string) => void;
}

const ExpenseList = ({ expenses, onDeleteExpense }: ExpenseListProps) => {
    return (
        <div className="expense-list-container">
            <div className="expense-list">
                <h2>Expense History</h2>
                <ul>
                    {expenses.map((expense) => (
                        <li key={expense.expense_id}>
                            <strong>{expense.expenseName}</strong>
                            <span>{expense.category}, ${expense.amount} by {expense.payerName}</span>
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
        </div>
    );
};

export default ExpenseList;
