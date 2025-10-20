import { Router, Request, Response } from 'express';
import { 
  getAllProjects,
  getUserProjects,
  getUserActiveProject,
  getAllUserProjectsOverview,
  addUserProject,
  updateUserProject,
  deleteUserProject
} from '../services/db';

const router = Router();

// IMPORTANT: Place specific routes BEFORE parameterized routes to avoid conflicts

// Get all available projects
router.get('/available', async (req: Request, res: Response) => {
  try {
    const projects = await getAllProjects();
    
    res.json({
      data: projects,
      message: `Retrieved ${projects.length} available projects`
    });
  } catch (error) {
    console.error('Error fetching available projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project overview (all user projects currently in progress)
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const projectOverview = await getAllUserProjectsOverview();
    
    res.json({
      data: projectOverview,
      message: `Retrieved ${projectOverview.length} projects in progress`,
      meta: {
        totalProjects: projectOverview.length
      }
    });
  } catch (error) {
    console.error('Error fetching project overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's active project (single project)
router.get('/user/:userId/active', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const activeProject = await getUserActiveProject(userId);
    
    res.json({
      data: activeProject,
      message: activeProject ? 'Retrieved active project' : 'No active project found'
    });
  } catch (error) {
    console.error('Error fetching user active project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's personal projects (for backwards compatibility)
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const userProjects = await getUserProjects(userId);
    
    res.json({
      data: userProjects,
      message: `Retrieved ${userProjects.length} projects for user ${userId}`
    });
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new project to user's list
router.post('/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const { projectId, deadline, notes } = req.body;
    
    if (isNaN(userId) || !projectId) {
      return res.status(400).json({ error: 'Invalid user ID or project ID' });
    }
    
    const userProject = await addUserProject(userId, projectId, deadline, notes);
    
    res.status(201).json({
      data: userProject,
      message: 'Project added successfully'
    });
  } catch (error: any) {
    console.error('Error adding user project:', error);
    
    // Handle specific error types
    if (error.message && (error.message.includes('one active project') || error.message.includes('active project'))) {
      return res.status(400).json({ error: error.message });
    }
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Project already added to your list' });
    }
    if (error.code === '23503') { // Foreign key constraint violation
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a user project
router.put('/user/:userId/:userProjectId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const userProjectId = parseInt(req.params.userProjectId);
    const updates = req.body;
    
    if (isNaN(userId) || isNaN(userProjectId)) {
      return res.status(400).json({ error: 'Invalid user ID or project ID' });
    }
    
    const updatedProject = await updateUserProject(userId, userProjectId, updates);
    
    res.json({
      data: updatedProject,
      message: 'Project updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating user project:', error);
    if (error.message === 'Project not found or access denied') {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a user project
router.delete('/user/:userId/:userProjectId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const userProjectId = parseInt(req.params.userProjectId);
    
    if (isNaN(userId) || isNaN(userProjectId)) {
      return res.status(400).json({ error: 'Invalid user ID or project ID' });
    }
    
    const deleted = await deleteUserProject(userId, userProjectId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting user project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
