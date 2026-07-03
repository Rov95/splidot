import express from 'express';
import { v4 as uuid4 } from 'uuid';
import { Group, UserGroup } from '../models';
import { errorMessage } from '../utils/errors';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, participants } = req.body;

  try {
    const group = await Group.create({ name, total_expense: 0 });

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
    const groups = await Group.findAll();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
});

router.get('/:groupId/participants', async (req, res) => {
  const { groupId } = req.params;

  try {
    const participants = await UserGroup.findAll({
      where: { group_id: groupId },
      attributes: ['user_id', 'name'],
    });
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
});

export default router;
