import { useState, useEffect } from 'react';
import GroupModal from '../GroupModal/index';
import GroupList from '../GroupList/groupList';
import ParticipantList from '../ParticipantList/participantList';
import AddExpense, { type NewExpenseData } from '../AddExpense/addExpense';
import ExpenseList from '../ExpenseList/expenseList';
import CategoryBreakdown from '../CategoryBreakdown/categoryBreakdown';
import Settlements from '../Settlements/settlements';
import LogoutButton from '../LogOut/logOut';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import EmptyState from '../../../components/ui/EmptyState';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../components/ui/Toast';
import { getGroups, deleteGroup } from '../../../services/groupService';
import { addExpense, deleteExpense, getGroupExpenses, getGroupBalances } from '../../../services/expenseService';
import { getSettlements, createSettlements, markSettlementPaid } from '../../../services/settlementService';
import { getToken, getCurrentUser, type CurrentUser } from '../../../services/authService';
import { formatDate } from '../../../utils/date';
import type { SetIsSignedIn } from '../../../App';
import type { Group, Participant, Expense, LocalExpense, Settlement } from '../../../types';
import './styles.css'

interface DashboardProps {
    setIsSignedIn: SetIsSignedIn;
}

// Group deletion carries a resolver so GroupList's awaited onDeleteGroup
// promise settles once the user answers the confirm dialog.
type PendingDelete =
    | { kind: 'group'; id: string; resolve: (deleted: boolean) => void }
    | { kind: 'expense'; id: string };

const Dashboard = ({ setIsSignedIn }: DashboardProps) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenseDefaultPayer, setExpenseDefaultPayer] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [balances, setBalances] = useState<Record<string, number>>({});
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);
    const [isLoadingGroupData, setIsLoadingGroupData] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const { showToast } = useToast();

    const toggleModal = () => setShowModal(!showModal);

    const openExpenseModal = (payerId = '') => {
        setExpenseDefaultPayer(payerId);
        setShowExpenseModal(true);
    };

    const closeExpenseModal = () => {
        setShowExpenseModal(false);
        setExpenseDefaultPayer('');
    };

    const fetchGroups = async () => {
        // Skip once signed out: a token-less request would just 401. This also
        // avoids a stray fetch during the logout transition (token already cleared).
        if (!getToken()) return;
        try {
            const data = await getGroups();
            setGroups(data);
        } catch (error) {
            console.error('Error fetching groups:', error);
            showToast('Failed to load groups', 'error');
        }
    };

    useEffect(() => {
        setIsLoadingGroups(true);
        fetchGroups().finally(() => setIsLoadingGroups(false));
        if (getToken()) {
            // Non-critical: the header falls back to a generic greeting.
            getCurrentUser().then(setCurrentUser).catch(() => {});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadGroupData = async (groupId: string) => {
        if (!getToken()) return;
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
            showToast('Failed to load group data', 'error');
        }
    };

    useEffect(() => {
        setExpenses([]);
        setBalances({});
        setSettlements([]);
        setSearchQuery('');
        setCategoryFilter('');
        if (selectedGroupId) {
            setIsLoadingGroupData(true);
            loadGroupData(selectedGroupId).finally(() => setIsLoadingGroupData(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGroupId]);

    const handleGroupCreated = async () => {
        await fetchGroups();
        setShowModal(false);
        showToast('Group created', 'success');
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
        createdAt: expense.created_at,
    }));

    const totalPaid = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const selectedGroup = groups.find((group) => group.group_id === selectedGroupId);

    const categoryOptions = [...new Set(displayExpenses.map((expense) => expense.category).filter(Boolean))];
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const isFiltering = normalizedQuery !== '' || categoryFilter !== '';
    const visibleExpenses = displayExpenses.filter((expense) =>
        (!categoryFilter || expense.category === categoryFilter) &&
        (!normalizedQuery || `${expense.expenseName} ${expense.payerName}`.toLowerCase().includes(normalizedQuery))
    );

    const handleAddExpense = async ({ payer, amount, category, expenseName }: NewExpenseData) => {
        if (!selectedGroupId) return;

        try {
            await addExpense(selectedGroupId, {
                payer_id: payer,
                amount,
                description: expenseName,
                category,
            });
            // Also refetch groups so the per-group total chips stay fresh.
            await Promise.all([loadGroupData(selectedGroupId), fetchGroups()]);
            showToast('Expense added', 'success');
        } catch (error) {
            console.error('Error adding expense:', error);
            showToast('Failed to add expense', 'error');
        }
    };

    const requestDeleteExpense = (expenseId: string) => {
        setPendingDelete({ kind: 'expense', id: expenseId });
    };

    const handleDeleteGroup = (groupId: string): Promise<boolean> =>
        new Promise((resolve) => {
            setPendingDelete({ kind: 'group', id: groupId, resolve });
        });

    const confirmPendingDelete = async () => {
        if (!pendingDelete) return;
        setPendingDelete(null);

        if (pendingDelete.kind === 'group') {
            try {
                await deleteGroup(pendingDelete.id);
                setSelectedGroupId(null);
                await fetchGroups();
                showToast('Group deleted', 'success');
                pendingDelete.resolve(true);
            } catch (error) {
                console.error('Error deleting group:', error);
                showToast('Failed to delete group', 'error');
                pendingDelete.resolve(false);
            }
            return;
        }

        if (!selectedGroupId) return;
        try {
            await deleteExpense(selectedGroupId, pendingDelete.id);
            // Deleting an expense also wipes the group's unpaid settlements
            // server-side, so reload everything in one shot.
            await Promise.all([loadGroupData(selectedGroupId), fetchGroups()]);
            showToast('Expense deleted', 'success');
        } catch (error) {
            console.error('Error deleting expense:', error);
            showToast('Failed to delete expense', 'error');
        }
    };

    const cancelPendingDelete = () => {
        if (pendingDelete?.kind === 'group') pendingDelete.resolve(false);
        setPendingDelete(null);
    };

    const handleCalculateSettlements = async () => {
        if (!selectedGroupId) return;

        try {
            setSettlements(await createSettlements(selectedGroupId));
        } catch (error) {
            console.error('Error calculating settlements:', error);
            showToast('Failed to calculate settlements', 'error');
        }
    };

    const handleTogglePaid = async (settlementId: string, isPaid: boolean) => {
        try {
            const updated = await markSettlementPaid(settlementId, isPaid);
            setSettlements((prevSettlements) =>
                prevSettlements.map((settlement) =>
                    settlement.settlement_id === updated.settlement_id ? updated : settlement
                )
            );
            showToast(isPaid ? 'Marked as paid' : 'Marked as unpaid', 'success');
        } catch (error) {
            console.error('Error updating settlement:', error);
            showToast('Failed to update settlement', 'error');
        }
    };

    return (
        <div className="dashboard">
            <header className="dashboard__header">
                <div className="dashboard__brand">
                    <img src="/dot.svg" alt="Splidot logo" className="dashboard__brand-icon" />
                    <span className="dashboard__wordmark">Splidot</span>
                </div>
                <div className="dashboard__user">
                    <span className="dashboard__greeting">
                        {currentUser ? `Welcome, ${currentUser.firstName}` : 'Welcome'}
                    </span>
                    <LogoutButton setIsSignedIn={setIsSignedIn} />
                </div>
            </header>

            <div className="dashboard__body">
                <aside className="dashboard__sidebar">
                    <Card className="dashboard__groups-card">
                        {isLoadingGroups && groups.length === 0 ? (
                            <div className="dashboard__loading"><Spinner /></div>
                        ) : (
                            <GroupList
                                groups={groups}
                                onSelectGroup={setSelectedGroupId}
                                onDeleteGroup={handleDeleteGroup}
                            />
                        )}
                        <Button className="add-group-button" onClick={toggleModal}>+ New Group</Button>
                    </Card>

                    {selectedGroupId && (
                        <Card>
                            <ParticipantList
                                groupId={selectedGroupId}
                                participants={participants}
                                setParticipants={setParticipants}
                                balances={balances}
                                onSelectParticipant={openExpenseModal}
                            />
                        </Card>
                    )}
                </aside>

                <main className="dashboard__main">
                    {!selectedGroupId ? (
                        <Card>
                            <EmptyState
                                message={groups.length === 0
                                    ? 'Create your first group to get started.'
                                    : 'Select a group to see its expenses.'}
                            />
                        </Card>
                    ) : (
                        <>
                            <Card className="dashboard__summary">
                                <div className="dashboard__summary-row">
                                    <div>
                                        <h2 className="dashboard__group-name">{selectedGroup?.name}</h2>
                                        {formatDate(selectedGroup?.created_at) && (
                                            <p className="dashboard__group-date">
                                                Created {formatDate(selectedGroup?.created_at)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="total-paid">
                                        <h3>Total Paid: ${totalPaid.toFixed(2)}</h3>
                                    </div>
                                </div>
                            </Card>

                            <div className="dashboard__columns">
                                <Card
                                    title="Expense History"
                                    actions={<Button size="sm" onClick={() => openExpenseModal()}>Add Expense</Button>}
                                >
                                    <div className="dashboard__expense-toolbar">
                                        <input
                                            type="search"
                                            className="ui-input dashboard__search"
                                            placeholder="Search expenses…"
                                            aria-label="Search expenses"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <select
                                            className="ui-input dashboard__category-filter"
                                            aria-label="Filter by category"
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                        >
                                            <option value="">All categories</option>
                                            {categoryOptions.map((category) => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {isFiltering && (
                                        <p className="dashboard__filter-count">
                                            {visibleExpenses.length} of {displayExpenses.length} expenses
                                        </p>
                                    )}

                                    {isLoadingGroupData && expenses.length === 0 ? (
                                        <div className="dashboard__loading"><Spinner /></div>
                                    ) : visibleExpenses.length === 0 ? (
                                        <EmptyState
                                            message={displayExpenses.length === 0
                                                ? 'No expenses yet — add your first one.'
                                                : 'No expenses match your search.'}
                                        />
                                    ) : (
                                        <ExpenseList expenses={visibleExpenses} onDeleteExpense={requestDeleteExpense} />
                                    )}

                                    <CategoryBreakdown expenses={displayExpenses} />
                                </Card>

                                <Card className="dashboard__settlements-card">
                                    <Settlements
                                        settlements={settlements}
                                        displayName={displayName}
                                        onCalculate={handleCalculateSettlements}
                                        onTogglePaid={handleTogglePaid}
                                    />
                                </Card>
                            </div>
                        </>
                    )}
                </main>
            </div>

            {showModal && <GroupModal onClose={() => setShowModal(false)} onGroupCreated={handleGroupCreated} />}
            {showExpenseModal && (
                <AddExpense
                    participants={participants}
                    onAddExpense={handleAddExpense}
                    onClose={closeExpenseModal}
                    initialPayerId={expenseDefaultPayer}
                />
            )}
            {pendingDelete && (
                <ConfirmDialog
                    title={pendingDelete.kind === 'group' ? 'Delete group?' : 'Delete expense?'}
                    message={pendingDelete.kind === 'group'
                        ? 'This removes the group with all its expenses and settlements. This cannot be undone.'
                        : 'This removes the expense and clears any unpaid settlements.'}
                    onConfirm={confirmPendingDelete}
                    onCancel={cancelPendingDelete}
                />
            )}
        </div>
    );
};

export default Dashboard;
