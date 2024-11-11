import React, { useState } from 'react';
import './styles.css';

const AddExpense = ({ participants, onAddExpense }) => {
    const [payer, setPayer] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [expenseName, setExpenseName] = useState('');
    const [showForm, setShowForm] = useState(false);

    const handleAddExpense = () => {
        if (payer && amount && category && expenseName) {
            onAddExpense({ payer, amount: parseFloat(amount), category, expenseName });
            setPayer('');
            setAmount('');
            setCategory('');
            setExpenseName('');
            setShowForm(false);
        } else {
            alert('Please fill all fields');
        }
    };

    return (
        <div className="add-expense-container">
            <button onClick={() => setShowForm(!showForm)} className="add-expense-btn">Add Expense</button>

            {showForm && (
                <div className="expense-form-container">
                    <div className="expense-form">
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
            )}
        </div>
    );
};

export default AddExpense;
