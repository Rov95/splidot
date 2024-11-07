const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();


router.post('/', async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch {
        res.status(400).json({ error: error.messeage });
    }
});

router.get('/', async (req, res) => {
    const categories = await Category.findAll();
    res.json(categories);
});

module.exports = router;

