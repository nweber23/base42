export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'pending';
  assignees: User[];
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  description?: string;
}