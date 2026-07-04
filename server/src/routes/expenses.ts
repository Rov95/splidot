import express from 'express';
import { sequelize, Expense, ExpenseShare, Settlement, UserGroup } from '../models';
import { errorMessage } from '../utils/errors';
import { findOwnedGroup, participantNames } from '../utils/groups';
import { centsFromAmount, splitEqualCents } from '../services/settlements';

const router = express.Router({ mergeParams: true });

const toExpenseJson = (expense: Expense, names: Map<string, string | null>) => ({
  expense_id: expense.expense_id,
  group_id: expense.group_id,
  user_id: expense.user_id,
  payer_name: names.get(expense.user_id) ?? null,
  amount: Number(expense.amount),
  description: expense.description,
  category: expense.category,
  created_at: expense.created_at,
});

router.post('/', async (req, res) => {
  const { groupId } = req.params as { groupId: string };
  const { payer_id, amount, description, category } = req.body;

  try {
    const group = await findOwnedGroup(groupId, req.session.userId!);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ error: 'amount must be a positive number' });
      return;
    }

    const participants = await UserGroup.findAll({ where: { group_id: groupId } });
    if (!participants.some((participant) => participant.user_id === payer_id)) {
      res.status(400).json({ error: 'Payer is not a participant of this group' });
      return;
    }

    const shareCents = splitEqualCents(centsFromAmount(amount), participants.length);

    const expense = await sequelize.transaction(async (transaction) => {
      const created = await Expense.create(
        { group_id: groupId, user_id: payer_id, amount, description, category },
        { transaction }
      );
      await ExpenseShare.bulkCreate(
        participants.map((participant, index) => ({
          expense_id: created.expense_id,
          user_id: participant.user_id,
          amount: shareCents[index] / 100,
        })),
        { transaction }
      );
      await group.increment('total_expense', { by: amount, transaction });
      return created;
    });

    res.status(201).json(toExpenseJson(expense, participantNames(participants)));
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
});

router.get('/', async (req, res) => {
  const { groupId } = req.params as { groupId: string };

  try {
    const group = await findOwnedGroup(groupId, req.session.userId!);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    const [expenses, participants] = await Promise.all([
      Expense.findAll({ where: { group_id: groupId }, order: [['created_at', 'ASC']] }),
      UserGroup.findAll({ where: { group_id: groupId }, attributes: ['user_id', 'name'] }),
    ]);
    const names = participantNames(participants);
    res.json(expenses.map((expense) => toExpenseJson(expense, names)));
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
});

router.delete('/:expenseId', async (req, res) => {
  const { groupId, expenseId } = req.params as { groupId: string; expenseId: string };

  try {
    const group = await findOwnedGroup(groupId, req.session.userId!);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    const expense = await Expense.findOne({ where: { expense_id: expenseId, group_id: groupId } });
    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    await sequelize.transaction(async (transaction) => {
      await ExpenseShare.destroy({ where: { expense_id: expenseId }, transaction });
      await expense.destroy({ transaction });
      await group.decrement('total_expense', { by: Number(expense.amount), transaction });
      // Outstanding debts were computed from an expense set that no longer
      // exists; paid settlements are history of real transfers and stay.
      await Settlement.destroy({ where: { group_id: groupId, is_paid: false }, transaction });
    });

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
});

export default router;
