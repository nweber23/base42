import { Router } from 'express';
import { StudentController } from '../controllers/StudentController';

const router = Router();
const studentController = new StudentController();

/**
 * @route   GET /api/students/search
 * @desc    Search for students by login (partial match)
 * @query   query - Search query (minimum 2 characters)
 * @access  Public
 */
router.get('/search', (req, res) => studentController.searchStudents(req, res));

/**
 * @route   GET /api/students/:login
 * @desc    Get detailed profile for a specific student
 * @param   login - Student login
 * @access  Public
 */
router.get('/:login', (req, res) => studentController.getStudentProfile(req, res));

/**
 * @route   GET /api/students/:login/id
 * @desc    Get user database ID by login (for messaging)
 * @param   login - Student login
 * @access  Public
 */
router.get('/:login/id', (req, res) => studentController.getUserIdByLogin(req, res));

export default router;
