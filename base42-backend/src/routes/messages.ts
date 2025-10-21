import { Router } from 'express';
import { MessageController } from '../controllers/MessageController';

const router = Router();
const messageController = new MessageController();

// Get all conversations for a user
router.get('/conversations', messageController.getConversations.bind(messageController));

// Get conversation with a specific user
router.get('/:userId', messageController.getConversation.bind(messageController));

// Send a message to a user
router.post('/:userId', messageController.sendMessage.bind(messageController));

// Mark messages as read
router.post('/:userId/read', messageController.markAsRead.bind(messageController));

export default router;