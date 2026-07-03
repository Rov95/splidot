import express from 'express';
import { Expense } from '../models';
import { errorMessage } from '../utils/errors';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
});

router.get('/', async (req, res) => {
  const expenses = await Expense.findAll();
  res.json(expenses);
});

export default router;
