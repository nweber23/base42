export interface Project {
  name: string;
  deadline: string;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
}

export interface User {
  id: number;
  name: string;
  campus: string;
  level: number;
  location: string;
  last_login: string;
  favorites: string[];
  current_project: Project;
  socials: SocialLinks;
  events: string[];
}

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