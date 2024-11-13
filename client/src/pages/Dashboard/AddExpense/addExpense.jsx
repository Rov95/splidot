import React, { useState } from 'react';
import './styles.css';

const AddExpense = ({ participants, onAddExpense, onClose }) => {
    const [payer, setPayer] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [expenseName, setExpenseName] = useState('');

    const handleAddExpense = () => {
        if (payer && amount && category && expenseName) {
            onAddExpense({ payer, amount: parseFloat(amount), category, expenseName });
            setPayer('');
            setAmount('');
            setCategory('');
            setExpenseName('');
            onClose()
        } else {
            alert('Please fill all fields');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="expense-form-modal">
                <button onClick={onClose} className="close-btn">Close</button>
                <h3>Add Expense</h3>

                <label>Payer:
                    <select value={payer} onChange={(e) => setPayer(e.target.value)} className="input-field">
                        <option value="">Select Participant</option>
                        {participants.map((participant) => (
                            <option key={participant.user_id} value={participant.user_id}>
                                {participant.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label>Amount ($):
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field" />
                </label>

                <label>Category:
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                        <option value="">Select Category</option>
                        <option value="food">Food</option>
                        <option value="lodging">Lodging</option>
                        <option value="shopping">Shopping</option>
                        <option value="recreation">Recreation</option>
                        <option value="others">Others</option>
                    </select>
                </label>

                <label>Expense Name:
                    <input type="text" value={expenseName} onChange={(e) => setExpenseName(e.target.value)} className="input-field" />
                </label>

                <button onClick={handleAddExpense} className="submit-btn">Create Expense</button>
            </div>
        </div>
    );
};

export default AddExpense;

