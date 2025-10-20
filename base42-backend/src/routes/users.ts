import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

// User CRUD routes
router.get('/', userController.getUsers.bind(userController));
router.get('/:id', userController.getUserById.bind(userController));
router.post('/', userController.createUser.bind(userController));
router.put('/:id', userController.updateUser.bind(userController));
router.delete('/:id', userController.deleteUser.bind(userController));

// User favorites routes
router.get('/:id/favorites', userController.getUserFavorites.bind(userController));
router.put('/:id/favorites', userController.updateUserFavorites.bind(userController));
router.post('/:id/favorites', userController.addUserFavorite.bind(userController));
router.delete('/:id/favorites', userController.removeUserFavorite.bind(userController));

export default router;