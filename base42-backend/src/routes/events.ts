import { Router } from 'express';
import { EventController } from '../controllers/EventController';

const router = Router();
const eventController = new EventController();

// Special event routes (must come before parameterized routes)
router.get('/upcoming', eventController.getUpcomingEvents.bind(eventController));
router.get('/past', eventController.getPastEvents.bind(eventController));

// Event CRUD routes
router.get('/', eventController.getEvents.bind(eventController));
router.get('/:id', eventController.getEventById.bind(eventController));
router.post('/', eventController.createEvent.bind(eventController));
router.put('/:id', eventController.updateEvent.bind(eventController));
router.delete('/:id', eventController.deleteEvent.bind(eventController));

export default router;