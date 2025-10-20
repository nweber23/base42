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
  name: string;
  email: string;
  role: string;
  campus: string;
  level: number;
  location: string;
  last_login: string;
  favorites: string[];
  current_project: ProjectInfo;
  socials: SocialLinks;
  events: string[];
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
  description: string;
  status: 'active' | 'completed' | 'pending';
  assignees: User[];
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