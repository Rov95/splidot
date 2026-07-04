import { useState, useEffect } from 'react';
import GroupModal from '../GroupModal/index';
import GroupList from '../GroupList/groupList';
import ParticipantList from '../ParticipantList/participantList';
import AddExpense, { type NewExpenseData } from '../AddExpense/addExpense';
import ExpenseList from '../ExpenseList/expenseList';
import LogoutButton from '../LogOut/logOut';
import { getGroups, deleteGroup } from '../../../services/groupService';
import { addExpense, deleteExpense, getGroupExpenses, getGroupBalances } from '../../../services/expenseService';
import { getSettlements, createSettlements, markSettlementPaid } from '../../../services/settlementService';
import type { SetIsSignedIn } from '../../../App';
import type { Group, Participant, LocalExpense, Expense, Settlement } from '../../../types';
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
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [balances, setBalances] = useState<Record<string, number>>({});
    const [settlements, setSettlements] = useState<Settlement[]>([]);

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

    const loadGroupData = async (groupId: string) => {
        try {
            const [groupExpenses, groupBalances, groupSettlements] = await Promise.all([
                getGroupExpenses(groupId),
                getGroupBalances(groupId),
                getSettlements(groupId),
            ]);
            setExpenses(groupExpenses);
            setBalances(Object.fromEntries(groupBalances.map((balance) => [balance.user_id, balance.total_paid])));
            setSettlements(groupSettlements);
        } catch (error) {
            console.error('Error loading group data:', error);
        }
    };

    useEffect(() => {
        setExpenses([]);
        setBalances({});
        setSettlements([]);
        if (selectedGroupId) {
            loadGroupData(selectedGroupId);
        }
    }, [selectedGroupId]);

    const handleGroupCreated = async () => {
        await fetchGroups();
        setShowModal(false);
    };

    // Participant names come from the server, but the first participant is renamed
    // to 'Me' client-side (in ParticipantList), so display names are resolved
    // against the local participant list first.
    const displayName = (userId: string, fallback: string | null) =>
        participants.find((participant) => participant.user_id === userId)?.name ?? fallback ?? 'Unknown';

    const displayExpenses: LocalExpense[] = expenses.map((expense) => ({
        expense_id: expense.expense_id,
        payerName: displayName(expense.user_id, expense.payer_name),
        amount: expense.amount,
        category: expense.category ?? '',
        expenseName: expense.description ?? '',
    }));

    const totalPaid = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const handleAddExpense = async ({ payer, amount, category, expenseName }: NewExpenseData) => {
        if (!selectedGroupId) return;

        try {
            await addExpense(selectedGroupId, {
                payer_id: payer,
                amount,
                description: expenseName,
                category,
            });
            await loadGroupData(selectedGroupId);
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    };

    const handleDeleteExpense = async (expenseId: string) => {
        if (!selectedGroupId) return;

        try {
            await deleteExpense(selectedGroupId, expenseId);
            // Deleting an expense also wipes the group's unpaid settlements
            // server-side, so reload everything in one shot.
            await loadGroupData(selectedGroupId);
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    const handleDeleteGroup = async (groupId: string): Promise<boolean> => {
        if (!window.confirm('Delete this group and all its expenses and settlements?')) {
            return false;
        }

        try {
            await deleteGroup(groupId);
            setSelectedGroupId(null);
            await fetchGroups();
            return true;
        } catch (error) {
            console.error('Error deleting group:', error);
            return false;
        }
    };

    const handleCalculateSettlements = async () => {
        if (!selectedGroupId) return;

        try {
            setSettlements(await createSettlements(selectedGroupId));
        } catch (error) {
            console.error('Error calculating settlements:', error);
        }
    };

    const handleMarkAsPayed = async (settlementId: string) => {
        try {
            const updated = await markSettlementPaid(settlementId);
            setSettlements((prevSettlements) =>
                prevSettlements.map((settlement) =>
                    settlement.settlement_id === updated.settlement_id ? updated : settlement
                )
            );
        } catch (error) {
            console.error('Error marking settlement as paid:', error);
        }
    };

    return (
        <div className="dashboard">
            <div className="area-one">
                <button onClick={toggleModal} className="add-group-button">+</button>
                {showModal && <GroupModal onClose={() => setShowModal(false)} onGroupCreated={handleGroupCreated} />}

                <div className="group-manager">
                    <GroupList groups={groups} onSelectGroup={setSelectedGroupId} onDeleteGroup={handleDeleteGroup} />
                    {selectedGroupId && (
                        <ParticipantList
                            groupId={selectedGroupId}
                            participants={participants}
                            setParticipants={setParticipants}
                            balances={balances}
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
                        <ExpenseList expenses={displayExpenses} onDeleteExpense={handleDeleteExpense} />
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
                            {settlements.map((settlement) => (
                                <li key={settlement.settlement_id} className="settlement-item">
                                    <span>
                                        {displayName(settlement.from_user_id, settlement.from_name)} pays {displayName(settlement.to_user_id, settlement.to_name)}: ${settlement.amount.toFixed(2)}
                                    </span>

                                    {settlement.is_paid ? (
                                        <img src="/check.svg" alt="check icon" className="status-icon" />
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleMarkAsPayed(settlement.settlement_id)}
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
