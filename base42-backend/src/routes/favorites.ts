import { Router, Request, Response } from 'express';
import { 
  getUserFavorites, 
  addUserFavorite, 
  removeUserFavorite, 
  isUserFavorite,
  getUsersByCampus,
  getCurrentlyLoggedInUsersByCampus
} from '../services/db';

const router = Router();

// Get user's favorite users
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const favorites = await getUserFavorites(userId);
    
    res.json({
      data: favorites,
      message: `Retrieved ${favorites.length} favorites for user ${userId}`
    });
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a user to favorites
router.post('/:userId/:favoriteUserId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const favoriteUserId = parseInt(req.params.favoriteUserId);
    
    if (isNaN(userId) || isNaN(favoriteUserId)) {
      return res.status(400).json({ error: 'Invalid user IDs' });
    }
    
    if (userId === favoriteUserId) {
      return res.status(400).json({ error: 'Cannot favorite yourself' });
    }
    
    // Check if already favorited
    const alreadyFavorite = await isUserFavorite(userId, favoriteUserId);
    if (alreadyFavorite) {
      return res.status(409).json({ error: 'User is already favorited' });
    }
    
    const favorite = await addUserFavorite(userId, favoriteUserId);
    
    res.status(201).json({
      data: favorite,
      message: 'User added to favorites successfully'
    });
  } catch (error) {
    console.error('Error adding user favorite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove a user from favorites
router.delete('/:userId/:favoriteUserId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const favoriteUserId = parseInt(req.params.favoriteUserId);
    
    if (isNaN(userId) || isNaN(favoriteUserId)) {
      return res.status(400).json({ error: 'Invalid user IDs' });
    }
    
    const removed = await removeUserFavorite(userId, favoriteUserId);
    
    if (!removed) {
      return res.status(404).json({ error: 'Favorite relationship not found' });
    }
    
    res.json({ message: 'User removed from favorites successfully' });
  } catch (error) {
    console.error('Error removing user favorite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if a user is favorited
router.get('/:userId/is-favorite/:favoriteUserId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const favoriteUserId = parseInt(req.params.favoriteUserId);
    
    if (isNaN(userId) || isNaN(favoriteUserId)) {
      return res.status(400).json({ error: 'Invalid user IDs' });
    }
    
    const isFavorite = await isUserFavorite(userId, favoriteUserId);
    
    res.json({
      data: { isFavorite },
      message: isFavorite ? 'User is favorited' : 'User is not favorited'
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get currently logged in users from a specific campus (e.g., "42 Heilbronn")
router.get('/campus/:campusName', async (req: Request, res: Response) => {
  try {
    const campusName = req.params.campusName;
    
    if (!campusName) {
      return res.status(400).json({ error: 'Campus name is required' });
    }
    
    // Get users who are currently logged in (active sessions)
    const users = await getCurrentlyLoggedInUsersByCampus(campusName);
    
    res.json({
      data: users,
      message: `Retrieved ${users.length} currently logged in users from ${campusName}`,
      meta: {
        campus: campusName,
        totalUsers: users.length,
        status: 'currently_logged_in'
      }
    });
  } catch (error) {
    console.error('Error fetching currently logged in campus users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users from a specific campus (for admin purposes)
router.get('/campus/:campusName/all', async (req: Request, res: Response) => {
  try {
    const campusName = req.params.campusName;
    
    if (!campusName) {
      return res.status(400).json({ error: 'Campus name is required' });
    }
    
    const users = await getUsersByCampus(campusName);
    
    res.json({
      data: users,
      message: `Retrieved ${users.length} users from ${campusName}`
    });
  } catch (error) {
    console.error('Error fetching campus users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;