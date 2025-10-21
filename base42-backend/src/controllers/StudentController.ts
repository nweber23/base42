import { Request, Response } from 'express';
import { api42Service } from '../services/42api';
import { getCache, setCache } from '../services/cache';
import { getUserByLoginCached, searchUsersByLoginCached } from '../services/cachedDb';
import { User } from '../models';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

interface StudentSearchResult {
  login: string;
  displayname: string;
  level: number;
  location: string | null;
  current_project: string | null;
  image: string;
  campus: string;
}

interface StudentProfileData extends StudentSearchResult {
  email?: string;
  full_name: string;
  github?: string;
  linkedin?: string;
  wallet: number;
  correction_point: number;
  skills: Array<{ name: string; level: number }>;
  projects: Array<{
    name: string;
    status: string;
    final_mark: number | null;
    validated: boolean | null;
  }>;
}

export class StudentController {
  /**
   * Search for students by login (partial match)
   * GET /api/students/search?query=<string>
   */
  public async searchStudents(req: Request, res: Response<ApiResponse<StudentSearchResult[]>>): Promise<void> {
    try {
      const query = (req.query.query as string || '').trim().toLowerCase();

      if (!query || query.length < 2) {
        res.status(400).json({
          error: 'Query must be at least 2 characters long'
        });
        return;
      }

      // Search in our local database
      const users = await searchUsersByLoginCached(query, 20);

      // Map to simplified format
      const results: StudentSearchResult[] = users.map((user: User) => ({
        login: user.login,
        displayname: user.name || user.login,
        level: user.level || 0,
        location: user.location || null,
        current_project: null, // We can enhance this later if needed
        image: `https://cdn.intra.42.fr/users/${user.login}.jpg`, // Default 42 avatar URL
        campus: user.campus || 'Unknown'
      }));

      res.json({
        data: results,
        message: `Found ${results.length} students`
      });
    } catch (error) {
      console.error('Error searching students:', error);
      res.status(500).json({
        error: 'Failed to search students'
      });
    }
  }

  /**
   * Get detailed profile for a specific student
   * GET /api/students/:login
   */
  public async getStudentProfile(req: Request, res: Response<ApiResponse<StudentProfileData>>): Promise<void> {
    try {
      const login = req.params.login.toLowerCase().trim();

      if (!login) {
        res.status(400).json({
          error: 'Login is required'
        });
        return;
      }

      // Get user from our database
      let user = await getUserByLoginCached(login);

      if (!user) {
        // If not in database, try to fetch from 42 API and sync
        try {
          user = await api42Service.fetchUserProfile(login);
        } catch (error) {
          res.status(404).json({
            error: 'Student not found'
          });
          return;
        }
      }

      // Build profile data from database
      const profileData: StudentProfileData = {
        login: user.login,
        displayname: user.name || user.login,
        full_name: user.name,
        level: user.level || 0,
        location: user.location || null,
        current_project: null, // Can be enhanced later
        image: `https://cdn.intra.42.fr/users/${user.login}.jpg`,
        campus: user.campus || 'Unknown',
        wallet: 0, // Not stored in our DB
        correction_point: 0, // Not stored in our DB
        skills: (user.favorites || []).slice(0, 10).map((name, index) => ({
          name,
          level: 10 - index // Mock skill levels based on order
        })),
        projects: [] // Can be enhanced later with project data
      };

      console.log('Sending profile data:', profileData);

      res.json({
        data: profileData,
        message: 'Profile retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error fetching student profile:', error);

      if (error.response?.status === 404) {
        res.status(404).json({
          error: 'Student not found'
        });
      } else {
        res.status(500).json({
          error: 'Failed to fetch student profile'
        });
      }
    }
  }

  /**
   * Get user ID by login for messaging
   * GET /api/students/:login/id
   */
  public async getUserIdByLogin(req: Request, res: Response<ApiResponse<{ id: number; login: string }>>): Promise<void> {
    try {
      const login = req.params.login.toLowerCase().trim();

      if (!login) {
        res.status(400).json({
          error: 'Login is required'
        });
        return;
      }

      // Check if user exists in database
      let dbUser = await getUserByLoginCached(login);

      // If not, fetch from 42 API and create
      if (!dbUser) {
        try {
          dbUser = await api42Service.fetchUserProfile(login);
        } catch (error) {
          res.status(404).json({
            error: 'User not found'
          });
          return;
        }
      }

      res.json({
        data: {
          id: dbUser.id,
          login: dbUser.login
        },
        message: 'User ID retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting user ID:', error);
      res.status(500).json({
        error: 'Failed to get user ID'
      });
    }
  }
}
