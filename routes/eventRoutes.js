import express from 'express';
import { getEvents, createEvent, deleteEvent } from '../controllers/eventController.js';
import { authMiddleware, adminMiddleware } from '../utils/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getEvents);
router.post('/', authMiddleware, adminMiddleware, createEvent);
router.delete('/:id', authMiddleware, adminMiddleware, deleteEvent);

export default router;