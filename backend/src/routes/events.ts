import express from 'express';
import { 
  getEvents, 
  getEvent, 
  createEvent, 
  joinEvent, 
  leaveEvent, 
  deleteEvent,
  getUserEvents 
} from '../controllers/eventController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

router.get('/', getEvents);
router.get('/user', authenticateJWT, getUserEvents);
router.get('/:id', getEvent);
router.post('/', authenticateJWT, createEvent);
router.post('/:id/join', authenticateJWT, joinEvent);
router.post('/:id/leave', authenticateJWT, leaveEvent);
router.delete('/:id', authenticateJWT, deleteEvent);

export default router; 