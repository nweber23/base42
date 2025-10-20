export interface ProjectInfo {
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
  login: string;
  name: string;
  level: number;
  campus: string;
  location: string;
  favorites: string[];
}

export interface Message {
  id: string;
  senderId: number;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  isRead: boolean;
}

export interface MessageThread {
  id: string;
  participants: number[];
  messages: Message[];
  lastActivity: string;
  isGroup: boolean;
  groupName?: string;
  createdAt: string;
}

export interface Project {
  id: number;
  name: string;
  deadline: string;
  teammates: string[];
}

export interface TeammateRequest {
  id: number;
  user: User;
  project: string;
  skillsNeeded: string[];
  description: string;
  postedDate: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  description?: string;
}