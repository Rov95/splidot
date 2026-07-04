import { useState, useEffect } from 'react';
import GroupModal from '../GroupModal/index';
import GroupList from '../GroupList/groupList';
import ParticipantList from '../ParticipantList/participantList';
import AddExpense, { type NewExpenseData } from '../AddExpense/addExpense';
import ExpenseList from '../ExpenseList/expenseList';
import LogoutButton from '../LogOut/logOut';
import { getGroups } from '../../../services/groupService';
import { calculateSettlements } from '../../../utils/settlements';
import type { SetIsSignedIn } from '../../../App';
import type { Group, Participant, LocalExpense, Settlement } from '../../../types';
import './styles.css'

interface DashboardProps {
    setIsSignedIn: SetIsSignedIn;
}

const Dashboard = ({ setIsSignedIn }: DashboardProps) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [expenses, setExpenses] = useState<LocalExpense[]>([]);
    const [totalPaid, setTotalPaid] = useState(0);
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [payedSettlements, setPayedSettlements] = useState<Set<number>>(new Set());

    const toggleModal = () => setShowModal(!showModal);
    const toggleExpenseModal = () => setShowExpenseModal(!showExpenseModal);

    const fetchGroups = async () => {
        try {
            const data = await getGroups();
            setGroups(data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleGroupCreated = async () => {
        await fetchGroups();
        setShowModal(false);
    };

    const handleAddExpense = ({ payer, amount, category, expenseName }: NewExpenseData) => {
        setParticipants(prevParticipants =>
            prevParticipants.map(participant =>
                participant.user_id === payer
                    ? { ...participant, totalPaid: (participant.totalPaid || 0) + amount }
                    : participant
            )
        );

        // Adding the new expense to the expense list
        const payerName = participants.find(participant => participant.user_id === payer)?.name || 'Unknown';
        setExpenses(prevExpenses => [
            ...prevExpenses,
            { payerName, amount, category, expenseName }
        ]);

        // Updating the general total paid
        setTotalPaid(prevTotal => prevTotal + amount);
    };

    const handleCalculateSettlements = () => {
        setSettlements(calculateSettlements(participants, totalPaid));
    };

    const handleMarkAsPayed = (index: number) => {
        setPayedSettlements((prevSet) => new Set(prevSet).add(index)); // Add index to payed set
    };

    return (
        <div className="dashboard">
            <div className="area-one">
                <button onClick={toggleModal} className="add-group-button">+</button>
                {showModal && <GroupModal onClose={() => setShowModal(false)} onGroupCreated={handleGroupCreated} />}

                <div className="group-manager">
                    <GroupList groups={groups} onSelectGroup={setSelectedGroupId} />
                    {selectedGroupId && (
                        <ParticipantList
                            groupId={selectedGroupId}
                            participants={participants}
                            setParticipants={setParticipants}
                        />
                    )}
                </div>

                <LogoutButton setIsSignedIn={setIsSignedIn} />
            </div>

            <div className="area-three">
                {selectedGroupId && (
                    <>
                        <button onClick={toggleExpenseModal} className="add-expense-btn">Add Expense</button>
                        {showExpenseModal && (
                            <AddExpense
                                participants={participants}
                                onAddExpense={handleAddExpense}
                                onClose={toggleExpenseModal}
                            />
                        )}
                        <ExpenseList expenses={expenses} />
                        <div className="total-paid">
                            <h3>Total Paid: ${totalPaid.toFixed(2)}</h3>
                        </div>
                    </>
                )}
            </div>
            <div className="settlement-section">
                <button onClick={handleCalculateSettlements} className="splidot-button">
                    <img src="/dot.svg" alt="dot icon" className="dot-icon" />
                    Splidot
                </button>

                {settlements.length > 0 && (
                    <div className="settlements-display">
                        <h3>Dot says:</h3>
                        <ul>
                            {settlements.map((settlement, index) => (
                                <li key={index} className="settlement-item">
                                    <span>
                                        {settlement.from} pays {settlement.to}: ${settlement.amount.toFixed(2)}
                                    </span>

                                    {payedSettlements.has(index) ? (
                                        <img src="/check.svg" alt="check icon" className="status-icon" />
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleMarkAsPayed(index)}
                                                className="payed-button">
                                                Paid off
                                            </button>
                                            <img src="/cross.svg" alt="cross icon" className="status-icon" />
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
