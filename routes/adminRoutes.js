import express from 'express';
import { getUsers, deleteUser, getStatistics } from '../controllers/adminController.js';
import { authMiddleware, adminMiddleware } from '../utils/authMiddleware.js';

const router = express.Router();

router.get('/users', authMiddleware, adminMiddleware, getUsers);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);
router.get('/statistics', authMiddleware, adminMiddleware, getStatistics);

export default router;