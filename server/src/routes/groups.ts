import express from 'express';
import { v4 as uuid4 } from 'uuid';
import { sequelize, Group, UserGroup, Expense, ExpenseShare, Settlement } from '../models';
import { errorMessage } from '../utils/errors';
import { findOwnedGroup } from '../utils/groups';
import groupExpensesRouter from './expenses';
import { groupSettlementsRouter } from './settlements';

const router = express.Router();

router.use('/:groupId/expenses', groupExpensesRouter);
router.use('/:groupId/settlements', groupSettlementsRouter);

router.post('/', async (req, res) => {
  const { name, participants } = req.body;

  const isValidParticipants =
    Array.isArray(participants) &&
    participants.length > 0 &&
    participants.every((participant) => typeof participant === 'string' && participant.trim() !== '');

  if (!isValidParticipants) {
    res.status(400).json({ error: 'participants must be a non-empty array of names' });
    return;
  }

  try {
    const group = await Group.create({
      name,
      total_expense: 0,
      created_by: req.session.userId,
    });

    for (const participantName of participants) {
      await UserGroup.create({
        user_id: uuid4(),
        group_id: group.group_id,
        name: participantName,
      });
    }

    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
});

router.get('/', async (req, res) => {
  try {
    const groups = await Group.findAll({ where: { created_by: req.session.userId } });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
});

router.get('/:groupId/participants', async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await findOwnedGroup(groupId, req.session.userId!);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    const participants = await UserGroup.findAll({
      where: { group_id: groupId },
      attributes: ['user_id', 'name'],
    });
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
});

router.get('/:groupId/balances', async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await findOwnedGroup(groupId, req.session.userId!);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    const [participants, expenses] = await Promise.all([
      UserGroup.findAll({ where: { group_id: groupId }, attributes: ['user_id', 'name'] }),
      Expense.findAll({ where: { group_id: groupId } }),
    ]);

    const paidCents = new Map<string, number>();
    for (const expense of expenses) {
      const cents = Math.round(Number(expense.amount) * 100);
      paidCents.set(expense.user_id, (paidCents.get(expense.user_id) ?? 0) + cents);
    }

    res.json(
      participants.map((participant) => ({
        user_id: participant.user_id,
        name: participant.name,
        total_paid: (paidCents.get(participant.user_id) ?? 0) / 100,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
});

router.delete('/:groupId', async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await findOwnedGroup(groupId, req.session.userId!);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Children first: ExpenseShares → Settlements/Expenses → UserGroups → Group.
    await sequelize.transaction(async (transaction) => {
      const expenses = await Expense.findAll({
        where: { group_id: groupId },
        attributes: ['expense_id'],
        transaction,
      });
      await ExpenseShare.destroy({
        where: { expense_id: expenses.map((expense) => expense.expense_id) },
        transaction,
      });
      await Settlement.destroy({ where: { group_id: groupId }, transaction });
      await Expense.destroy({ where: { group_id: groupId }, transaction });
      await UserGroup.destroy({ where: { group_id: groupId }, transaction });
      await group.destroy({ transaction });
    });

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
});

export default router;
