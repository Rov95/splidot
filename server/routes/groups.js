const express = require('express');
const { Group } = require('../models/group');
const router = express.Router();

router.post('/', async (req, res) => {
    try{
        const group = await Group.create(req.body);
        res.status(201).json(group);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

router.get('/', async (req, res) => {
    const groups = await Group.findAll();
    res.json(groups);
})

module.exports = router;