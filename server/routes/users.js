const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../models/index')
const { User } = db;
const authMiddleware = require('./../middlewares/auth')
const router = express.Router();

router.post('/register', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    try {
        const existingUser = await User.findOne({where: { email }});
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        const hashedPasword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ 
            email, 
            password: hashedPasword,
            firstName, 
            lastName 
        });

        req.session.userId = newUser.id;
        res.status(201).json({ message: "User registered succesfully" })
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    const {  email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        req.session.userId = user.user_id;
        req.session.save(err => {
            if (err) {
                return res.status(500).json({ error: "Failed to save session" });
            }
        })
        res.status(200).json({ message: "User logged in successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

//tengo que volver a habilitar autorizacion 
router.get('/me',async (req, res) => {
    console.log("Session ID: ", req.session.userId)
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: "You must be logged in to view your information"})
        }
        const user = await User.findByPk(req.session.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Error logging out" });
        }
        res.clearCookie('rovix')
        res.status(200).json({ message: "Logged out successfully" })
    });
})


module.exports = router;