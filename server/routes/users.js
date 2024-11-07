const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models/user');
const { requireAuth } = require('@clerk/express');
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        const existingUser = await User.findOne({where: { email }});
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }
        const hashedPasword = await bcrypt.hash(password, 10);
        const user = await User.create({ 
            email, 
            password: hashedPasword, 
            firstName, 
            lastName 
        });
        res.status(201).json({ message: "User registered succesfully", user })
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    
})

router.get('/me', requireAuth(), async (req, res) => {
    const user = await User.findByPk(req.auth.userId);
    res.json(user);
})

router.post('/logout', requireAuth(), (req, res) => {
    res,status(200).json({ message: "Logged out successfully" })
})


module.exports = router;