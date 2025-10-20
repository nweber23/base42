import { useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import type { User } from '../types';

interface EventItem {
  id: string;
  title: string;
  organizer: User;
  date: string;
  type: 'campus' | 'hackathon' | 'workshop' | 'meetup' | 'conference';
  category: '42 Heilbronn Events' | 'Hackathons / External Events';
  description?: string;
  location?: string;
  isUpcoming: boolean;
}

interface EventCardProps {
  event: EventItem;
  isCurrentUserEvent: boolean;
}

interface EventSectionProps {
  title: string;
  events: EventItem[];
  currentUserId: number;
  emptyMessage: string;
}

const EventCard: React.FC<EventCardProps> = ({ event, isCurrentUserEvent }) => {
  const getEventTypeIcon = (type: EventItem['type']): string => {
    switch (type) {
      case 'campus': return '🏫';
      case 'hackathon': return '💻';
      case 'workshop': return '🔧';
      case 'meetup': return '👥';
      case 'conference': return '🎤';
      default: return '📅';
    }
  };

  const getEventTypeColor = (type: EventItem['type']): string => {
    switch (type) {
      case 'campus': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'hackathon': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'workshop': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'meetup': return 'bg-green-100 text-green-800 border-green-200';
      case 'conference': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatEventDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysFromNow = (dateString: string): string => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `In ${diffDays} days`;
    return 'Past event';
  };

  return (
    <div className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow p-4 ${
      isCurrentUserEvent ? 'ring-2 ring-blue-200 border-blue-300' : ''
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              {event.title}
              {isCurrentUserEvent && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Your Event
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600">Organized by {event.organizer.name}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(event.type)}`}>
            {event.type.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="flex items-center text-sm text-gray-600 mb-1">
          <span className="mr-2">📅</span>
          <span>{formatEventDate(event.date)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600 mb-1">
          <span className="mr-2">⏰</span>
          <span className="font-medium text-blue-600">{getDaysFromNow(event.date)}</span>
        </div>
        {event.location && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📍</span>
            <span>{event.location}</span>
          </div>
        )}
      </div>
      
      {event.description && (
        <p className="text-sm text-gray-600 mb-3">{event.description}</p>
      )}
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-xs">
              {event.organizer.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <span className="text-xs text-gray-500">Level {event.organizer.level}</span>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          Join Event
        </button>
      </div>
    </div>
  );
};

const EventSection: React.FC<EventSectionProps> = ({ title, events, currentUserId, emptyMessage }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          {events.length} {events.length === 1 ? 'Event' : 'Events'}
        </span>
      </div>
      
      {events.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📅</div>
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isCurrentUserEvent={event.organizer.id === currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Calendar: React.FC = () => {
  const { currentUser, users } = useUser();

  const events = useMemo(() => {
    const allEvents: EventItem[] = [];
    
    users.forEach(user => {
      user.events.forEach((eventName, index) => {
        // Determine event category and type based on event name
        const isExternalEvent = eventName.toLowerCase().includes('hackathon') || 
                               eventName.toLowerCase().includes('conference') || 
                               eventName.toLowerCase().includes('meetup') ||
                               eventName.toLowerCase().includes('dev');
        
        const eventType: EventItem['type'] = 
          eventName.toLowerCase().includes('hackathon') ? 'hackathon' :
          eventName.toLowerCase().includes('workshop') ? 'workshop' :
          eventName.toLowerCase().includes('conference') ? 'conference' :
          eventName.toLowerCase().includes('meetup') ? 'meetup' :
          'campus';
        
        // Generate mock dates for events (spread over next 3 months)
        const baseDate = new Date();
        const eventDate = new Date(baseDate.getTime() + (index + 1) * 7 * 24 * 60 * 60 * 1000 + user.id * 24 * 60 * 60 * 1000);
        
        // Generate mock descriptions
        const descriptions: Record<EventItem['type'], string> = {
          hackathon: 'A competitive coding event where teams build innovative solutions within a limited time frame.',
          workshop: 'Hands-on learning session covering practical skills and techniques.',
          conference: 'Industry conference featuring talks from experts and networking opportunities.',
          meetup: 'Community gathering for sharing knowledge and connecting with peers.',
          campus: 'On-campus event for students at 42 Heilbronn.'
        };
        
        // Generate mock locations
        const locations: Record<EventItem['type'], string> = {
          hackathon: 'TechHub Berlin',
          workshop: '42 Heilbronn Campus',
          conference: 'Stuttgart Convention Center',
          meetup: 'Local Tech Community Center',
          campus: '42 Heilbronn - Main Hall'
        };
        
        allEvents.push({
          id: `${user.id}-${index}`,
          title: eventName,
          organizer: user,
          date: eventDate.toISOString(),
          type: eventType,
          category: isExternalEvent ? 'Hackathons / External Events' : '42 Heilbronn Events',
          description: descriptions[eventType],
          location: locations[eventType],
          isUpcoming: eventDate.getTime() > Date.now()
        });
      });
    });
    
    // Sort events by date (upcoming first)
    return allEvents
      .filter(event => event.isUpcoming)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [users]);

  const campusEvents = useMemo(() => 
    events.filter(event => event.category === '42 Heilbronn Events'),
    [events]
  );

  const externalEvents = useMemo(() => 
    events.filter(event => event.category === 'Hackathons / External Events'),
    [events]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600 mt-2">
          Discover upcoming events at 42 Heilbronn and in the broader tech community
        </p>
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-200 rounded border border-blue-300"></div>
            <span className="text-gray-600">Your organized events</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Total upcoming: {events.length} events</span>
          </div>
        </div>
      </div>

      <EventSection
        title="42 Heilbronn Events"
        events={campusEvents}
        currentUserId={currentUser.id}
        emptyMessage="No upcoming campus events. Check back later for workshops and campus activities!"
      />

      <EventSection
        title="Hackathons / External Events"
        events={externalEvents}
        currentUserId={currentUser.id}
        emptyMessage="No upcoming external events. Keep an eye out for hackathons and conferences!"
      />
    </div>
  );
};

export default Calendar;