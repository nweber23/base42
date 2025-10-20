import { Router, Request, Response } from 'express';
import { api42Service } from '../services/42api';

const router = Router();

// Sync user profile from 42 API
router.post('/user/:login', async (req: Request, res: Response) => {
  try {
    const { login } = req.params;
    
    if (!login) {
      return res.status(400).json({ error: 'Login parameter is required' });
    }

    if (!api42Service.isConfigured()) {
      return res.status(503).json({ error: '42 API is not properly configured' });
    }

    console.log(`Syncing user profile for ${login}`);
    const user = await api42Service.fetchUserProfile(login);
    
    res.json({
      message: `User profile synced successfully for ${login}`,
      user
    });
  } catch (error: any) {
    console.error('Error syncing user profile:', error);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'User not found in 42 API' });
    }
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: '42 API authentication failed' });
    }
    
    res.status(500).json({ 
      error: 'Failed to sync user profile',
      details: error.message 
    });
  }
});

// Sync user projects from 42 API
router.post('/user/:login/projects', async (req: Request, res: Response) => {
  try {
    const { login } = req.params;
    
    if (!login) {
      return res.status(400).json({ error: 'Login parameter is required' });
    }

    if (!api42Service.isConfigured()) {
      return res.status(503).json({ error: '42 API is not properly configured' });
    }

    console.log(`Syncing projects for user ${login}`);
    const projects = await api42Service.fetchUserProjects(login);
    
    res.json({
      message: `Projects synced successfully for ${login}`,
      count: projects.length,
      projects
    });
  } catch (error: any) {
    console.error('Error syncing user projects:', error);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'User not found in 42 API' });
    }
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: '42 API authentication failed' });
    }
    
    res.status(500).json({ 
      error: 'Failed to sync user projects',
      details: error.message 
    });
  }
});

// Sync complete user data (profile + projects) from 42 API
router.post('/user/:login/complete', async (req: Request, res: Response) => {
  try {
    const { login } = req.params;
    
    if (!login) {
      return res.status(400).json({ error: 'Login parameter is required' });
    }

    if (!api42Service.isConfigured()) {
      return res.status(503).json({ error: '42 API is not properly configured' });
    }

    console.log(`Starting complete sync for user ${login}`);
    const { user, projects } = await api42Service.syncUserData(login);
    
    res.json({
      message: `Complete sync successful for ${login}`,
      user,
      projects: {
        count: projects.length,
        data: projects
      }
    });
  } catch (error: any) {
    console.error('Error syncing user data:', error);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'User not found in 42 API' });
    }
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: '42 API authentication failed' });
    }
    
    res.status(500).json({ 
      error: 'Failed to sync user data',
      details: error.message 
    });
  }
});

// Get 42 API service status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const configured = api42Service.isConfigured();
    const authenticated = api42Service.isAuthenticated();
    
    res.json({
      configured,
      authenticated,
      ready: configured && authenticated,
      message: configured 
        ? (authenticated ? '42 API service is ready' : '42 API configured but not authenticated')
        : '42 API not configured - check API_UID and API_SECRET'
    });
  } catch (error) {
    console.error('Error checking 42 API status:', error);
    res.status(500).json({ error: 'Failed to check API status' });
  }
});

// Bulk sync multiple users
router.post('/users/bulk', async (req: Request, res: Response) => {
  try {
    const { logins } = req.body;
    
    if (!Array.isArray(logins) || logins.length === 0) {
      return res.status(400).json({ error: 'Logins array is required and cannot be empty' });
    }

    if (logins.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 users can be synced at once' });
    }

    if (!api42Service.isConfigured()) {
      return res.status(503).json({ error: '42 API is not properly configured' });
    }

    console.log(`Starting bulk sync for ${logins.length} users`);
    
    const results = [];
    const errors = [];

    // Process users sequentially to avoid rate limiting
    for (const login of logins) {
      try {
        console.log(`Syncing user ${login}...`);
        const { user, projects } = await api42Service.syncUserData(login);
        results.push({
          login,
          success: true,
          user,
          projectCount: projects.length
        });
        
        // Add small delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        console.error(`Failed to sync user ${login}:`, error.message);
        errors.push({
          login,
          error: error.message
        });
      }
    }
    
    res.json({
      message: `Bulk sync completed`,
      successful: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    console.error('Error in bulk sync:', error);
    res.status(500).json({ error: 'Failed to perform bulk sync' });
  }
});

// Test 42 API connection
router.get('/test', async (req: Request, res: Response) => {
  try {
    if (!api42Service.isConfigured()) {
      return res.status(503).json({ 
        error: '42 API is not properly configured',
        configured: false
      });
    }

    // Try to authenticate to test the connection
    try {
      // This will trigger authentication if needed
      const testLogin = 'test-non-existent-user-12345';
      await api42Service.fetchUserProfile(testLogin);
    } catch (error: any) {
      // We expect a 404 for non-existent user, which means auth worked
      if (error.response?.status === 404) {
        return res.json({
          message: '42 API connection successful',
          configured: true,
          authenticated: true,
          status: 'ready'
        });
      }
      throw error; // Re-throw if it's not a 404
    }
    
    res.json({
      message: '42 API connection test completed',
      configured: true,
      authenticated: api42Service.isAuthenticated(),
      status: 'ready'
    });
  } catch (error: any) {
    console.error('42 API connection test failed:', error);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: '42 API authentication failed - check API_UID and API_SECRET',
        configured: true,
        authenticated: false
      });
    }
    
    res.status(500).json({ 
      error: '42 API connection failed',
      details: error.message,
      configured: true,
      authenticated: false
    });
  }
});

export default router;