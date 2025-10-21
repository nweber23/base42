import { Request, Response } from 'express';
import { fetchOfficialEvents } from '../services/42api';
import {
  getCommunityEventsCached,
  getCommunityEventByIdCached,
  createCommunityEventCached,
  updateCommunityEventCached,
  deleteCommunityEventCached
} from '../services/cachedDb';

// Request/Response type definitions
interface CreateCommunityEventRequest {
  user_id: number;
  title: string;
  description?: string;
  date: string;
  location?: string;
  link?: string;
}

interface UpdateCommunityEventRequest {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  link?: string;
}

interface CommunityEventParamsRequest extends Request {
  params: {
    id: string;
  };
}

interface CommunityEventBodyRequest extends Request {
  body: CreateCommunityEventRequest;
}

interface CommunityEventUpdateRequest extends Request {
  params: {
    id: string;
  };
  body: UpdateCommunityEventRequest & { user_id: number };
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export class CalendarController {
  /**
   * Get official 42 Heilbronn events from the 42 API
   * GET /api/calendar/official
   */
  public async getOfficialEvents(req: Request, res: Response<ApiResponse<any[]>>): Promise<void> {
    try {
      // Campus ID 51 = 42 Heilbronn
      const campusId = parseInt(req.query.campus_id as string) || 51;

      const events = await fetchOfficialEvents(campusId);

      // Transform 42 API events to a simpler format
      const transformedEvents = events.map(event => ({
        id: event.id,
        title: event.name,
        description: event.description,
        date: event.begin_at,
        end_date: event.end_at,
        location: event.location,
        kind: event.kind,
        max_people: event.max_people,
        subscribers: event.nbr_subscribers,
        source: 'official'
      }));

      res.json({
        data: transformedEvents,
        message: `Retrieved ${transformedEvents.length} official events`
      });
    } catch (error) {
      console.error('Error fetching official events:', error);
      res.status(500).json({
        error: 'Failed to fetch official events from 42 API'
      });
    }
  }

  /**
   * Get all community events
   * GET /api/calendar/community
   */
  public async getCommunityEvents(req: Request, res: Response<ApiResponse<any[]>>): Promise<void> {
    try {
      const events = await getCommunityEventsCached();

      // Add source field for consistency with official events
      const transformedEvents = events.map(event => ({
        ...event,
        source: 'community'
      }));

      res.json({
        data: transformedEvents,
        message: `Retrieved ${transformedEvents.length} community events`
      });
    } catch (error) {
      console.error('Error fetching community events:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get community event by ID
   * GET /api/calendar/community/:id
   */
  public async getCommunityEventById(req: CommunityEventParamsRequest, res: Response<ApiResponse<any>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid event ID'
        });
        return;
      }

      const event = await getCommunityEventByIdCached(id);

      if (!event) {
        res.status(404).json({
          error: 'Community event not found'
        });
        return;
      }

      res.json({
        data: { ...event, source: 'community' }
      });
    } catch (error) {
      console.error('Error fetching community event:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Create new community event
   * POST /api/calendar/community
   */
  public async createCommunityEvent(req: CommunityEventBodyRequest, res: Response<ApiResponse<any>>): Promise<void> {
    try {
      const { user_id, title, description, date, location, link } = req.body;

      // Validate required fields
      if (!user_id || !title || !date) {
        res.status(400).json({
          error: 'Missing required fields: user_id, title, date'
        });
        return;
      }

      // Validate date format
      const eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) {
        res.status(400).json({
          error: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)'
        });
        return;
      }

      const eventData = {
        user_id,
        title,
        description,
        date: eventDate.toISOString(),
        location,
        link
      };

      const event = await createCommunityEventCached(eventData);

      res.status(201).json({
        data: { ...event, source: 'community' },
        message: 'Community event created successfully'
      });
    } catch (error) {
      console.error('Error creating community event:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update community event
   * PUT /api/calendar/community/:id
   */
  public async updateCommunityEvent(req: CommunityEventUpdateRequest, res: Response<ApiResponse<any>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { user_id } = req.body;

      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid event ID'
        });
        return;
      }

      if (!user_id) {
        res.status(400).json({
          error: 'Missing required field: user_id'
        });
        return;
      }

      // Validate date format if provided
      if (req.body.date) {
        const eventDate = new Date(req.body.date);
        if (isNaN(eventDate.getTime())) {
          res.status(400).json({
            error: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)'
          });
          return;
        }
        req.body.date = eventDate.toISOString();
      }

      const updates = {
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        location: req.body.location,
        link: req.body.link
      };

      const event = await updateCommunityEventCached(id, user_id, updates);

      if (!event) {
        res.status(404).json({
          error: 'Community event not found or access denied'
        });
        return;
      }

      res.json({
        data: { ...event, source: 'community' },
        message: 'Community event updated successfully'
      });
    } catch (error) {
      console.error('Error updating community event:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Delete community event
   * DELETE /api/calendar/community/:id
   */
  public async deleteCommunityEvent(req: Request, res: Response<ApiResponse<null>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const user_id = parseInt(req.body.user_id);

      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid event ID'
        });
        return;
      }

      if (isNaN(user_id)) {
        res.status(400).json({
          error: 'Missing required field: user_id'
        });
        return;
      }

      const deleted = await deleteCommunityEventCached(id, user_id);

      if (!deleted) {
        res.status(404).json({
          error: 'Community event not found or access denied'
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting community event:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}
