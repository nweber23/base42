import { Request, Response } from 'express';
import { Event } from '../models';
import {
  getEventsCached,
  getEventByIdCached,
  createEventCached,
  updateEventCached,
  deleteEventCached
} from '../services/cachedDb';

// Request/Response type definitions
interface CreateEventRequest {
  name: string;
  date: string;
  type: 'Campus' | 'Hackathon';
}

interface UpdateEventRequest {
  name?: string;
  date?: string;
  type?: 'Campus' | 'Hackathon';
}

interface EventParamsRequest extends Request {
  params: {
    id: string;
  };
}

interface EventBodyRequest extends Request {
  body: CreateEventRequest;
}

interface EventUpdateRequest extends Request {
  params: {
    id: string;
  };
  body: UpdateEventRequest;
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export class EventController {
  /**
   * Get all events
   * GET /events
   */
  public async getEvents(req: Request, res: Response<ApiResponse<Event[]>>): Promise<void> {
    try {
      const events = await getEventsCached();
      res.json({
        data: events,
        message: `Retrieved ${events.length} events`
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get event by ID
   * GET /events/:id
   */
  public async getEventById(req: EventParamsRequest, res: Response<ApiResponse<Event>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid event ID'
        });
        return;
      }
      
      const event = await getEventByIdCached(id);
      
      if (!event) {
        res.status(404).json({
          error: 'Event not found'
        });
        return;
      }
      
      res.json({
        data: event
      });
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Create new event
   * POST /events
   */
  public async createEvent(req: EventBodyRequest, res: Response<ApiResponse<Event>>): Promise<void> {
    try {
      const { name, date, type } = req.body;
      
      // Validate required fields
      if (!name || !date || !type) {
        res.status(400).json({
          error: 'Missing required fields: name, date, type'
        });
        return;
      }
      
      // Validate event type
      if (type !== 'Campus' && type !== 'Hackathon') {
        res.status(400).json({
          error: 'Type must be either "Campus" or "Hackathon"'
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
      
      const eventData: Omit<Event, 'id'> = {
        name,
        date: eventDate.toISOString(),
        type
      };
      
      const event = await createEventCached(eventData);
      
      res.status(201).json({
        data: event,
        message: 'Event created successfully'
      });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update event
   * PUT /events/:id
   */
  public async updateEvent(req: EventUpdateRequest, res: Response<ApiResponse<Event>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid event ID'
        });
        return;
      }
      
      // Validate event type if provided
      if (req.body.type && req.body.type !== 'Campus' && req.body.type !== 'Hackathon') {
        res.status(400).json({
          error: 'Type must be either "Campus" or "Hackathon"'
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
      
      const event = await updateEventCached(id, req.body);
      
      if (!event) {
        res.status(404).json({
          error: 'Event not found'
        });
        return;
      }
      
      res.json({
        data: event,
        message: 'Event updated successfully'
      });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Delete event
   * DELETE /events/:id
   */
  public async deleteEvent(req: EventParamsRequest, res: Response<ApiResponse<null>>): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Invalid event ID'
        });
        return;
      }
      
      const deleted = await deleteEventCached(id);
      
      if (!deleted) {
        res.status(404).json({
          error: 'Event not found'
        });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get events by type
   * GET /events?type=Campus|Hackathon
   */
  public async getEventsByType(req: Request, res: Response<ApiResponse<Event[]>>): Promise<void> {
    try {
      const { type } = req.query;
      
      if (type && type !== 'Campus' && type !== 'Hackathon') {
        res.status(400).json({
          error: 'Type must be either "Campus" or "Hackathon"'
        });
        return;
      }
      
      const allEvents = await getEventsCached();
      
      let events = allEvents;
      if (type) {
        events = allEvents.filter(event => event.type === type);
      }
      
      res.json({
        data: events,
        message: type 
          ? `Retrieved ${events.length} ${type} events`
          : `Retrieved ${events.length} events`
      });
    } catch (error) {
      console.error('Error fetching events by type:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get upcoming events
   * GET /events/upcoming
   */
  public async getUpcomingEvents(req: Request, res: Response<ApiResponse<Event[]>>): Promise<void> {
    try {
      const allEvents = await getEventsCached();
      const now = new Date();
      
      const upcomingEvents = allEvents.filter(event => new Date(event.date) > now);
      
      // Sort by date (earliest first)
      upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      res.json({
        data: upcomingEvents,
        message: `Retrieved ${upcomingEvents.length} upcoming events`
      });
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get past events
   * GET /events/past
   */
  public async getPastEvents(req: Request, res: Response<ApiResponse<Event[]>>): Promise<void> {
    try {
      const allEvents = await getEventsCached();
      const now = new Date();
      
      const pastEvents = allEvents.filter(event => new Date(event.date) <= now);
      
      // Sort by date (most recent first)
      pastEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      res.json({
        data: pastEvents,
        message: `Retrieved ${pastEvents.length} past events`
      });
    } catch (error) {
      console.error('Error fetching past events:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}