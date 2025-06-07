import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { authMiddleware } from '../utils/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);

export default router;