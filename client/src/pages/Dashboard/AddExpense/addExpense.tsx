import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import type { Participant } from '../../../types';
import './styles.css';

export interface NewExpenseData {
    payer: string;
    amount: number;
    category: string;
    expenseName: string;
}

interface AddExpenseProps {
    participants: Participant[];
    onAddExpense: (data: NewExpenseData) => void;
    onClose: () => void;
    initialPayerId?: string;
}

const AddExpense = ({ participants, onAddExpense, onClose, initialPayerId = '' }: AddExpenseProps) => {
    const [payer, setPayer] = useState(initialPayerId);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [expenseName, setExpenseName] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    const handleAddExpense = () => {
        if (!payer || !amount || !category || !expenseName) {
            setFormError('Please fill all fields');
            return;
        }

        const parsedAmount = parseFloat(amount);
        if (!(parsedAmount > 0)) {
            setFormError('Amount must be greater than 0');
            return;
        }

        onAddExpense({ payer, amount: parsedAmount, category, expenseName });
        setPayer('');
        setAmount('');
        setCategory('');
        setExpenseName('');
        setFormError(null);
        onClose();
    };

    return (
        <Modal title="Add Expense" onClose={onClose} className="expense-form-modal">
            <div className="add-expense__form">
                <label className="add-expense__label">Payer:
                    <select value={payer} onChange={(e) => setPayer(e.target.value)} className="ui-input">
                        <option value="">Select Participant</option>
                        {participants.map((participant) => (
                            <option key={participant.user_id} value={participant.user_id}>
                                {participant.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="add-expense__label">Amount ($):
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="ui-input" min="0" step="0.01" />
                </label>

                <label className="add-expense__label">Category:
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="ui-input">
                        <option value="">Select Category</option>
                        <option value="food">Food</option>
                        <option value="lodging">Lodging</option>
                        <option value="shopping">Shopping</option>
                        <option value="recreation">Recreation</option>
                        <option value="others">Others</option>
                    </select>
                </label>

                <label className="add-expense__label">Expense Name:
                    <input type="text" value={expenseName} onChange={(e) => setExpenseName(e.target.value)} className="ui-input" />
                </label>

                {formError && <p className="ui-field-error">{formError}</p>}

                <div className="add-expense__actions">
                    <Button variant="ghost" onClick={onClose} className="close-btn">Close</Button>
                    <Button onClick={handleAddExpense} className="submit-btn">Create Expense</Button>
                </div>
            </div>
        </Modal>
    );
};

export default AddExpense;
