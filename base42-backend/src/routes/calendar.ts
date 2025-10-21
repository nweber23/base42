import { Router } from 'express';
import { CalendarController } from '../controllers/CalendarController';

const router = Router();
const calendarController = new CalendarController();

// Official 42 events routes
router.get('/official', calendarController.getOfficialEvents.bind(calendarController));

// Community events routes
router.get('/community', calendarController.getCommunityEvents.bind(calendarController));
router.get('/community/:id', calendarController.getCommunityEventById.bind(calendarController));
router.post('/community', calendarController.createCommunityEvent.bind(calendarController));
router.put('/community/:id', calendarController.updateCommunityEvent.bind(calendarController));
router.delete('/community/:id', calendarController.deleteCommunityEvent.bind(calendarController));

export default router;
