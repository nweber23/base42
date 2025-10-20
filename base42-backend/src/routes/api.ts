import { Router } from 'express';
import userRoutes from './users';
import projectRoutes from './projects';
import eventRoutes from './events';
import messageRoutes from './messages';
import syncRoutes from './sync';
import favoritesRoutes from './favorites';
import peersRouter from './peers';

const router = Router();

// Mount sub-routes
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/events', eventRoutes);
router.use('/messages', messageRoutes);
router.use('/sync', syncRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/peers', peersRouter);

export default router;
