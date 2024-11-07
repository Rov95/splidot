const express = require('express');
const { Expense } = require('../models/expense');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const expense = await Expense.create(req.body);
        res.status(201).json(expense)
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

router.get('/', async (req, res) => {
    const expenses = await Expense.findAll();
    res.json(expenses);
});

module.exports = router;
