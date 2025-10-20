import { Request, Response } from 'express';
import { Project } from '../models';
import {
  getProjectsCached,
  getProjectByIdCached,
  createProjectCached,
  updateProjectCached,
  deleteProjectCached
} from '../services/cachedDb';

// Request/Response type definitions
interface CreateProjectRequest {
  name: string;
  deadline: string;
  teammates?: string[];
}

interface UpdateProjectRequest {
  name?: string;
  deadline?: string;
  teammates?: string[];
}

interface ProjectParamsRequest extends Request {
  params: {
    id: string;
  };
}

interface ProjectBodyRequest extends Request {
  body: CreateProjectRequest;
}

interface ProjectUpdateRequest extends Request {
  params: {
    id: string;
  };
  body: UpdateProjectRequest;
}

interface TeammatesRequest extends Request {
  params: {
    id: string;
  };
  body: {
    teammates: string[];
  };
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export class ProjectController {
  /**
   * Get all projects
   * GET /projects
   */
  public async getProjects(req: Request, res: Response<ApiResponse<Project[]>>): Promise<void> {
    try {
      const projects = await getProjectsCached();
      res.json({
        data: projects,
        message: `Retrieved ${projects.length} projects`
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get project by ID
   * GET /projects/:id
   */
  public async getProjectById(req: ProjectParamsRequest, res: Response<ApiResponse<Project>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid project ID'
        });
        return;
      }
      
      const project = await getProjectByIdCached(id);
      
      if (!project) {
        res.status(404).json({
          error: 'Project not found'
        });
        return;
      }
      
      res.json({
        data: project
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Create new project
   * POST /projects
   */
  public async createProject(req: ProjectBodyRequest, res: Response<ApiResponse<Project>>): Promise<void> {
    try {
      const { name, deadline, teammates } = req.body;
      
      // Validate required fields
      if (!name || !deadline) {
        res.status(400).json({
          error: 'Missing required fields: name, deadline'
        });
        return;
      }
      
      // Validate deadline format
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        res.status(400).json({
          error: 'Invalid deadline format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)'
        });
        return;
      }
      
      // Validate teammates array if provided
      if (teammates && !Array.isArray(teammates)) {
        res.status(400).json({
          error: 'Teammates must be an array of strings'
        });
        return;
      }
      
      if (teammates && !teammates.every(teammate => typeof teammate === 'string')) {
        res.status(400).json({
          error: 'All teammates must be strings'
        });
        return;
      }
      
      const projectData: Omit<Project, 'id'> = {
        name,
        deadline: deadlineDate.toISOString(),
        teammates: teammates || []
      };
      
      const project = await createProjectCached(projectData);
      
      res.status(201).json({
        data: project,
        message: 'Project created successfully'
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update project
   * PUT /projects/:id
   */
  public async updateProject(req: ProjectUpdateRequest, res: Response<ApiResponse<Project>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid project ID'
        });
        return;
      }
      
      // Validate deadline format if provided
      if (req.body.deadline) {
        const deadlineDate = new Date(req.body.deadline);
        if (isNaN(deadlineDate.getTime())) {
          res.status(400).json({
            error: 'Invalid deadline format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)'
          });
          return;
        }
        req.body.deadline = deadlineDate.toISOString();
      }
      
      // Validate teammates array if provided
      if (req.body.teammates) {
        if (!Array.isArray(req.body.teammates)) {
          res.status(400).json({
            error: 'Teammates must be an array of strings'
          });
          return;
        }
        
        if (!req.body.teammates.every(teammate => typeof teammate === 'string')) {
          res.status(400).json({
            error: 'All teammates must be strings'
          });
          return;
        }
      }
      
      const project = await updateProjectCached(id, req.body);
      
      if (!project) {
        res.status(404).json({
          error: 'Project not found'
        });
        return;
      }
      
      res.json({
        data: project,
        message: 'Project updated successfully'
      });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Delete project
   * DELETE /projects/:id
   */
  public async deleteProject(req: ProjectParamsRequest, res: Response<ApiResponse<null>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid project ID'
        });
        return;
      }
      
      const deleted = await deleteProjectCached(id);
      
      if (!deleted) {
        res.status(404).json({
          error: 'Project not found'
        });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get project teammates
   * GET /projects/:id/teammates
   */
  public async getProjectTeammates(req: ProjectParamsRequest, res: Response<ApiResponse<string[]>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid project ID'
        });
        return;
      }
      
      const project = await getProjectByIdCached(id);
      
      if (!project) {
        res.status(404).json({
          error: 'Project not found'
        });
        return;
      }
      
      res.json({
        data: project.teammates,
        message: `Retrieved ${project.teammates.length} teammates for project ${project.name}`
      });
    } catch (error) {
      console.error('Error fetching project teammates:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update project teammates
   * PUT /projects/:id/teammates
   */
  public async updateProjectTeammates(req: TeammatesRequest, res: Response<ApiResponse<Project>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { teammates } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid project ID'
        });
        return;
      }
      
      if (!Array.isArray(teammates)) {
        res.status(400).json({
          error: 'Teammates must be an array of strings'
        });
        return;
      }
      
      // Validate that all teammates are strings
      if (!teammates.every(teammate => typeof teammate === 'string')) {
        res.status(400).json({
          error: 'All teammates must be strings'
        });
        return;
      }
      
      const project = await updateProjectCached(id, { teammates });
      
      if (!project) {
        res.status(404).json({
          error: 'Project not found'
        });
        return;
      }
      
      res.json({
        data: project,
        message: 'Project teammates updated successfully'
      });
    } catch (error) {
      console.error('Error updating project teammates:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Add teammate to project
   * POST /projects/:id/teammates
   */
  public async addProjectTeammate(req: TeammatesRequest, res: Response<ApiResponse<Project>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { teammates } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid project ID'
        });
        return;
      }
      
      if (!Array.isArray(teammates) || teammates.length === 0) {
        res.status(400).json({
          error: 'At least one teammate must be provided'
        });
        return;
      }
      
      if (!teammates.every(teammate => typeof teammate === 'string')) {
        res.status(400).json({
          error: 'All teammates must be strings'
        });
        return;
      }
      
      const project = await getProjectByIdCached(id);
      if (!project) {
        res.status(404).json({
          error: 'Project not found'
        });
        return;
      }
      
      // Add new teammates (avoiding duplicates)
      const currentTeammates = project.teammates || [];
      const newTeammates = [...new Set([...currentTeammates, ...teammates])];
      
      const updatedProject = await updateProjectCached(id, { teammates: newTeammates });
      
      res.json({
        data: updatedProject!,
        message: `Added ${teammates.length} teammates to project`
      });
    } catch (error) {
      console.error('Error adding project teammates:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Remove teammate from project
   * DELETE /projects/:id/teammates
   */
  public async removeProjectTeammate(req: TeammatesRequest, res: Response<ApiResponse<Project>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { teammates } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid project ID'
        });
        return;
      }
      
      if (!Array.isArray(teammates) || teammates.length === 0) {
        res.status(400).json({
          error: 'At least one teammate must be specified for removal'
        });
        return;
      }
      
      if (!teammates.every(teammate => typeof teammate === 'string')) {
        res.status(400).json({
          error: 'All teammates must be strings'
        });
        return;
      }
      
      const project = await getProjectByIdCached(id);
      if (!project) {
        res.status(404).json({
          error: 'Project not found'
        });
        return;
      }
      
      // Remove specified teammates
      const currentTeammates = project.teammates || [];
      const updatedTeammates = currentTeammates.filter(teammate => !teammates.includes(teammate));
      
      const updatedProject = await updateProjectCached(id, { teammates: updatedTeammates });
      
      res.json({
        data: updatedProject!,
        message: `Removed ${teammates.length} teammates from project`
      });
    } catch (error) {
      console.error('Error removing project teammates:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}