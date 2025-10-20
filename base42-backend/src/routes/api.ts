import { Router, Request, Response } from 'express';
import {
  getUsersCached,
  getUserByIdCached,
  createUserCached,
  updateUserCached,
  deleteUserCached,
  getProjectsCached,
  getProjectByIdCached,
  createProjectCached,
  updateProjectCached,
  deleteProjectCached,
  getEventsCached,
  getEventByIdCached,
  createEventCached,
  updateEventCached,
  deleteEventCached,
  getMessagesCached,
  getMessageByIdCached,
  getMessagesByUserCached,
  createMessageCached,
  updateMessageCached,
  deleteMessageCached
} from '../services/cachedDb';

const router = Router();

// User routes
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await getUsersCached();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const user = await getUserByIdCached(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/users', async (req: Request, res: Response) => {
  try {
    const { login, name, level, campus, location, favorites } = req.body;
    
    if (!login || !name || !campus) {
      return res.status(400).json({ error: 'Missing required fields: login, name, campus' });
    }
    
    const user = await createUserCached({
      login,
      name,
      level: level || 0,
      campus,
      location: location || '',
      favorites: favorites || []
    });
    
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const user = await updateUserCached(id, req.body);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const deleted = await deleteUserCached(id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Project routes
router.get('/projects', async (req: Request, res: Response) => {
  try {
    const projects = await getProjectsCached();
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/projects/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    
    const project = await getProjectByIdCached(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/projects', async (req: Request, res: Response) => {
  try {
    const { name, deadline, teammates } = req.body;
    
    if (!name || !deadline) {
      return res.status(400).json({ error: 'Missing required fields: name, deadline' });
    }
    
    const project = await createProjectCached({
      name,
      deadline,
      teammates: teammates || []
    });
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/projects/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    
    const project = await updateProjectCached(id, req.body);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/projects/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    
    const deleted = await deleteProjectCached(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Event routes
router.get('/events', async (req: Request, res: Response) => {
  try {
    const events = await getEventsCached();
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/events/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    const event = await getEventByIdCached(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/events', async (req: Request, res: Response) => {
  try {
    const { name, date, type } = req.body;
    
    if (!name || !date || !type) {
      return res.status(400).json({ error: 'Missing required fields: name, date, type' });
    }
    
    if (type !== 'Campus' && type !== 'Hackathon') {
      return res.status(400).json({ error: 'Type must be either "Campus" or "Hackathon"' });
    }
    
    const event = await createEventCached({
      name,
      date,
      type
    });
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/events/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    const { type } = req.body;
    if (type && type !== 'Campus' && type !== 'Hackathon') {
      return res.status(400).json({ error: 'Type must be either "Campus" or "Hackathon"' });
    }
    
    const event = await updateEventCached(id, req.body);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/events/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    const deleted = await deleteEventCached(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Message routes
router.get('/messages', async (req: Request, res: Response) => {
  try {
    const messages = await getMessagesCached();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/messages/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }
    
    const message = await getMessageByIdCached(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/messages/user/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const messages = await getMessagesByUserCached(username);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching user messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/messages', async (req: Request, res: Response) => {
  try {
    const { from, to, text } = req.body;
    
    if (!from || !to || !text) {
      return res.status(400).json({ error: 'Missing required fields: from, to, text' });
    }
    
    const message = await createMessageCached({
      from,
      to,
      text
    });
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/messages/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }
    
    const message = await updateMessageCached(id, req.body);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json(message);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/messages/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }
    
    const deleted = await deleteMessageCached(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;