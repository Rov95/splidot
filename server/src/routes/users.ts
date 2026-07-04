import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models';
import { errorMessage } from '../utils/errors';
import { signToken } from '../utils/jwt';
import authMiddleware from '../middlewares/auth';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    res.status(201).json({ token: signToken(newUser.user_id) });
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    res.status(200).json({ token: signToken(user.user_id) });
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
});

// JWTs are stateless, so logging out is a client-side concern (drop the token).
// This endpoint stays for a stable client contract and is intentionally a no-op.
router.post('/logout', (_req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
