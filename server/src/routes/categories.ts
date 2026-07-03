import express from 'express';
import { Category } from '../models';
import { errorMessage } from '../utils/errors';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
});

router.get('/', async (req, res) => {
  const categories = await Category.findAll();
  res.json(categories);
});

export default router;
