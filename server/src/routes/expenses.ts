import express from 'express';
import { sequelize, Expense, ExpenseShare, UserGroup } from '../models';
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

export default router;
