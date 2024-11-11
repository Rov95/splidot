const express = require('express');
const { Group, UserGroup } = require('../models');
const { v4: uuid4 } = require('uuid'); 
const router = express.Router();

router.post('/', async (req, res) => {
    const { name, participants } = req.body;

    try {
        // Create group with default total_expense
        const group = await Group.create({ name, total_expense: 0 });
        
        // Generate a UUID for each participant and associate them with the group
        for (const participantName of participants) {
            const userGroup = await UserGroup.create({
                user_id: uuid4(),  // Generate a UUID for each participant
                group_id: group.group_id,
                name: participantName,
            });
        }

        res.status(201).json(group);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const groups = await Group.findAll();
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

