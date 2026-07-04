import express from 'express';
import { sequelize, Settlement, Expense, UserGroup } from '../models';
import { errorMessage } from '../utils/errors';
import { findOwnedGroup, participantNames } from '../utils/groups';
import { buildPaidCentsByUser, computeSettlements } from '../services/settlements';

const toSettlementJson = (settlement: Settlement, names: Map<string, string | null>) => ({
  settlement_id: settlement.settlement_id,
  group_id: settlement.group_id,
  from_user_id: settlement.from_user_id,
  from_name: names.get(settlement.from_user_id) ?? null,
  to_user_id: settlement.to_user_id,
  to_name: names.get(settlement.to_user_id) ?? null,
  amount: Number(settlement.amount),
  is_paid: settlement.is_paid,
  created_at: settlement.created_at,
});

export const groupSettlementsRouter = express.Router({ mergeParams: true });

groupSettlementsRouter.get('/', async (req, res) => {
  const { groupId } = req.params as { groupId: string };

  try {
    const group = await findOwnedGroup(groupId, req.session.userId!);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    const [settlements, participants] = await Promise.all([
      Settlement.findAll({ where: { group_id: groupId }, order: [['created_at', 'ASC']] }),
      UserGroup.findAll({ where: { group_id: groupId }, attributes: ['user_id', 'name'] }),
    ]);
    const names = participantNames(participants);
    res.json(settlements.map((settlement) => toSettlementJson(settlement, names)));
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
});

groupSettlementsRouter.post('/', async (req, res) => {
  const { groupId } = req.params as { groupId: string };

  try {
    const group = await findOwnedGroup(groupId, req.session.userId!);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    const [participants, expenses, paidSettlements] = await Promise.all([
      UserGroup.findAll({ where: { group_id: groupId } }),
      Expense.findAll({ where: { group_id: groupId } }),
      Settlement.findAll({ where: { group_id: groupId, is_paid: true } }),
    ]);

    const paidCents = buildPaidCentsByUser(participants, expenses, paidSettlements);
    const computed = computeSettlements(participants, paidCents);

    // Recompute replaces outstanding debts; paid settlements are history and stay.
    await sequelize.transaction(async (transaction) => {
      await Settlement.destroy({ where: { group_id: groupId, is_paid: false }, transaction });
      await Settlement.bulkCreate(
        computed.map((settlement) => ({ group_id: groupId, ...settlement })),
        { transaction }
      );
    });

    const settlements = await Settlement.findAll({
      where: { group_id: groupId },
      order: [['created_at', 'ASC']],
    });
    const names = participantNames(participants);
    res.json(settlements.map((settlement) => toSettlementJson(settlement, names)));
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
});

export const settlementRouter = express.Router();

settlementRouter.patch('/:settlementId', async (req, res) => {
  const { settlementId } = req.params;
  const { is_paid } = req.body;

  if (typeof is_paid !== 'boolean') {
    res.status(400).json({ error: 'is_paid must be a boolean' });
    return;
  }

  try {
    const settlement = await Settlement.findByPk(settlementId);
    const group = settlement
      ? await findOwnedGroup(settlement.group_id, req.session.userId!)
      : null;
    if (!settlement || !group) {
      res.status(404).json({ error: 'Settlement not found' });
      return;
    }

    settlement.is_paid = is_paid;
    await settlement.save();

    const participants = await UserGroup.findAll({
      where: { group_id: settlement.group_id },
      attributes: ['user_id', 'name'],
    });
    res.json(toSettlementJson(settlement, participantNames(participants)));
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
});
