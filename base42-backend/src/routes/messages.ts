import { Router } from 'express';
import { MessageController } from '../controllers/MessageController';

const router = Router();
const messageController = new MessageController();

// Special message routes (must come before parameterized routes)
router.get('/user/:username', messageController.getMessagesByUser.bind(messageController));
router.get('/conversation/:user1/:user2', messageController.getConversation.bind(messageController));
router.get('/sent/:username', messageController.getSentMessages.bind(messageController));
router.get('/received/:username', messageController.getReceivedMessages.bind(messageController));

// Message CRUD routes
router.get('/', messageController.getMessages.bind(messageController));
router.get('/:id', messageController.getMessageById.bind(messageController));
router.post('/', messageController.createMessage.bind(messageController));
router.put('/:id', messageController.updateMessage.bind(messageController));
router.delete('/:id', messageController.deleteMessage.bind(messageController));

export default router;