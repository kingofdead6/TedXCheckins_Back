import express from 'express';
import { getAttendees, uploadAttendees, validateQRCode } from '../controllers/attendeeController.js';
import { authMiddleware } from '../utils/authMiddleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/:eventId', authMiddleware, getAttendees);
router.post('/:eventId/upload', authMiddleware, upload.single('file'), uploadAttendees);
router.post('/validate', authMiddleware, validateQRCode);

export default router;