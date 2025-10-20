import { Router } from 'express';
import userRoutes from './users';
import projectRoutes from './projects';
import eventRoutes from './events';
import messageRoutes from './messages';

const router = Router();

// Mount sub-routes
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/events', eventRoutes);
router.use('/messages', messageRoutes);

export default router;