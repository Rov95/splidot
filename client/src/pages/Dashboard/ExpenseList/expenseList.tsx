import type { LocalExpense } from '../../../types';
import './styles.css';

interface ExpenseListProps {
    expenses: LocalExpense[];
}

const ExpenseList = ({ expenses }: ExpenseListProps) => {
    return (
        <div className="expense-list-container">
            <div className="expense-list">
                <h2>Expense History</h2>
                <ul>
                    {expenses.map((expense, index) => (
                        <li key={index}>
                            <strong>{expense.expenseName}</strong>
                            <span>{expense.category}, ${expense.amount} by {expense.payerName}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ExpenseList;
