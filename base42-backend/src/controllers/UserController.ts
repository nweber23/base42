import { Request, Response } from 'express';
import { User } from '../models';
import {
  getUsersCached,
  getUserByIdCached,
  getUserByLoginCached,
  createUserCached,
  updateUserCached,
  deleteUserCached
} from '../services/cachedDb';

// Request/Response type definitions
interface CreateUserRequest {
  login: string;
  name: string;
  level?: number;
  campus: string;
  location?: string;
  favorites?: string[];
}

interface UpdateUserRequest {
  login?: string;
  name?: string;
  level?: number;
  campus?: string;
  location?: string;
  favorites?: string[];
}

interface UserParamsRequest extends Request {
  params: {
    id: string;
  };
}

interface UserBodyRequest extends Request {
  body: CreateUserRequest;
}

interface UserUpdateRequest extends Request {
  params: {
    id: string;
  };
  body: UpdateUserRequest;
}

interface FavoritesRequest extends Request {
  params: {
    id: string;
  };
  body: {
    favorites: string[];
  };
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export class UserController {
  /**
   * Get all users
   * GET /users
   */
  public async getUsers(req: Request, res: Response<ApiResponse<User[]>>): Promise<void> {
    try {
      const users = await getUsersCached();
      res.json({
        data: users,
        message: `Retrieved ${users.length} users`
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get user by ID
   * GET /users/:id
   */
  public async getUserById(req: UserParamsRequest, res: Response<ApiResponse<User>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid user ID'
        });
        return;
      }
      
      const user = await getUserByIdCached(id);
      
      if (!user) {
        res.status(404).json({
          error: 'User not found'
        });
        return;
      }
      
      res.json({
        data: user
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Create new user
   * POST /users
   */
  public async createUser(req: UserBodyRequest, res: Response<ApiResponse<User>>): Promise<void> {
    try {
      const { login, name, level, campus, location, favorites } = req.body;
      
      // Validate required fields
      if (!login || !name || !campus) {
        res.status(400).json({
          error: 'Missing required fields: login, name, campus'
        });
        return;
      }
      
      // Check if user already exists
      const existingUser = await getUserByLoginCached(login);
      if (existingUser) {
        res.status(409).json({
          error: 'User with this login already exists'
        });
        return;
      }
      
      const userData: Omit<User, 'id'> = {
        login,
        name,
        level: level || 0,
        campus,
        location: location || '',
        favorites: favorites || []
      };
      
      const user = await createUserCached(userData);
      
      res.status(201).json({
        data: user,
        message: 'User created successfully'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update user
   * PUT /users/:id
   */
  public async updateUser(req: UserUpdateRequest, res: Response<ApiResponse<User>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid user ID'
        });
        return;
      }
      
      // Check if login is being updated and if it conflicts with existing user
      if (req.body.login) {
        const existingUser = await getUserByLoginCached(req.body.login);
        if (existingUser && existingUser.id !== id) {
          res.status(409).json({
            error: 'User with this login already exists'
          });
          return;
        }
      }
      
      const user = await updateUserCached(id, req.body);
      
      if (!user) {
        res.status(404).json({
          error: 'User not found'
        });
        return;
      }
      
      res.json({
        data: user,
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Delete user
   * DELETE /users/:id
   */
  public async deleteUser(req: UserParamsRequest, res: Response<ApiResponse<null>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid user ID'
        });
        return;
      }
      
      const deleted = await deleteUserCached(id);
      
      if (!deleted) {
        res.status(404).json({
          error: 'User not found'
        });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get user favorites
   * GET /users/:id/favorites
   */
  public async getUserFavorites(req: UserParamsRequest, res: Response<ApiResponse<string[]>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid user ID'
        });
        return;
      }
      
      const user = await getUserByIdCached(id);
      
      if (!user) {
        res.status(404).json({
          error: 'User not found'
        });
        return;
      }
      
      res.json({
        data: user.favorites,
        message: `Retrieved ${user.favorites.length} favorites for user ${user.login}`
      });
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update user favorites
   * PUT /users/:id/favorites
   */
  public async updateUserFavorites(req: FavoritesRequest, res: Response<ApiResponse<User>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { favorites } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid user ID'
        });
        return;
      }
      
      if (!Array.isArray(favorites)) {
        res.status(400).json({
          error: 'Favorites must be an array of strings'
        });
        return;
      }
      
      // Validate that all favorites are strings
      if (!favorites.every(fav => typeof fav === 'string')) {
        res.status(400).json({
          error: 'All favorites must be strings'
        });
        return;
      }
      
      const user = await updateUserCached(id, { favorites });
      
      if (!user) {
        res.status(404).json({
          error: 'User not found'
        });
        return;
      }
      
      res.json({
        data: user,
        message: 'User favorites updated successfully'
      });
    } catch (error) {
      console.error('Error updating user favorites:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Add favorite to user
   * POST /users/:id/favorites
   */
  public async addUserFavorite(req: FavoritesRequest, res: Response<ApiResponse<User>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { favorites } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid user ID'
        });
        return;
      }
      
      if (!Array.isArray(favorites) || favorites.length === 0) {
        res.status(400).json({
          error: 'At least one favorite must be provided'
        });
        return;
      }
      
      const user = await getUserByIdCached(id);
      if (!user) {
        res.status(404).json({
          error: 'User not found'
        });
        return;
      }
      
      // Add new favorites (avoiding duplicates)
      const currentFavorites = user.favorites || [];
      const newFavorites = [...new Set([...currentFavorites, ...favorites])];
      
      const updatedUser = await updateUserCached(id, { favorites: newFavorites });
      
      res.json({
        data: updatedUser!,
        message: `Added ${favorites.length} favorites to user`
      });
    } catch (error) {
      console.error('Error adding user favorites:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Remove favorite from user
   * DELETE /users/:id/favorites
   */
  public async removeUserFavorite(req: FavoritesRequest, res: Response<ApiResponse<User>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { favorites } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid user ID'
        });
        return;
      }
      
      if (!Array.isArray(favorites) || favorites.length === 0) {
        res.status(400).json({
          error: 'At least one favorite must be specified for removal'
        });
        return;
      }
      
      const user = await getUserByIdCached(id);
      if (!user) {
        res.status(404).json({
          error: 'User not found'
        });
        return;
      }
      
      // Remove specified favorites
      const currentFavorites = user.favorites || [];
      const updatedFavorites = currentFavorites.filter(fav => !favorites.includes(fav));
      
      const updatedUser = await updateUserCached(id, { favorites: updatedFavorites });
      
      res.json({
        data: updatedUser!,
        message: `Removed ${favorites.length} favorites from user`
      });
    } catch (error) {
      console.error('Error removing user favorites:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}