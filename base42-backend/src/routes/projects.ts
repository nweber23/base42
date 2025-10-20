import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';

const router = Router();
const projectController = new ProjectController();

// Project CRUD routes
router.get('/', projectController.getProjects.bind(projectController));
router.get('/:id', projectController.getProjectById.bind(projectController));
router.post('/', projectController.createProject.bind(projectController));
router.put('/:id', projectController.updateProject.bind(projectController));
router.delete('/:id', projectController.deleteProject.bind(projectController));

// Project teammates routes
router.get('/:id/teammates', projectController.getProjectTeammates.bind(projectController));
router.put('/:id/teammates', projectController.updateProjectTeammates.bind(projectController));
router.post('/:id/teammates', projectController.addProjectTeammate.bind(projectController));
router.delete('/:id/teammates', projectController.removeProjectTeammate.bind(projectController));

export default router;