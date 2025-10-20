import { User, Project, Event, Message } from '../models';
import { getCache, setCache, deleteCache } from './cache';
import * as db from './db';

// Cache TTL in seconds
const DEFAULT_TTL = 300; // 5 minutes
const LIST_TTL = 180; // 3 minutes for lists
const ITEM_TTL = 600; // 10 minutes for individual items

// Cache key generators
const getCacheKey = {
  users: () => 'users:all',
  user: (id: number) => `user:${id}`,
  userByLogin: (login: string) => `user:login:${login}`,
  projects: () => 'projects:all',
  project: (id: number) => `project:${id}`,
  events: () => 'events:all',
  event: (id: number) => `event:${id}`,
  messages: () => 'messages:all',
  message: (id: number) => `message:${id}`,
  messagesByUser: (username: string) => `messages:user:${username}`
};

// Cached User operations
export const getUsersCached = async (): Promise<User[]> => {
  const cacheKey = getCacheKey.users();
  
  // Try to get from cache first
  let users = await getCache<User[]>(cacheKey);
  
  if (!users) {
    // If not in cache, get from database
    users = await db.getUsers();
    // Store in cache for future requests
    await setCache(cacheKey, users, LIST_TTL);
  }
  
  return users;
};

export const getUserByIdCached = async (id: number): Promise<User | null> => {
  const cacheKey = getCacheKey.user(id);
  
  // Try to get from cache first
  let user = await getCache<User>(cacheKey);
  
  if (!user) {
    // If not in cache, get from database
    user = await db.getUserById(id);
    if (user) {
      // Store in cache for future requests
      await setCache(cacheKey, user, ITEM_TTL);
    }
  }
  
  return user;
};

export const getUserByLoginCached = async (login: string): Promise<User | null> => {
  const cacheKey = getCacheKey.userByLogin(login);
  
  // Try to get from cache first
  let user = await getCache<User>(cacheKey);
  
  if (!user) {
    // If not in cache, get from database
    user = await db.getUserByLogin(login);
    if (user) {
      // Store in cache for future requests
      await setCache(cacheKey, user, ITEM_TTL);
      // Also cache by ID
      await setCache(getCacheKey.user(user.id), user, ITEM_TTL);
    }
  }
  
  return user;
};

export const createUserCached = async (user: Omit<User, 'id'>): Promise<User> => {
  const newUser = await db.createUser(user);
  
  // Invalidate users list cache
  await deleteCache(getCacheKey.users());
  
  // Cache the new user
  await setCache(getCacheKey.user(newUser.id), newUser, ITEM_TTL);
  await setCache(getCacheKey.userByLogin(newUser.login), newUser, ITEM_TTL);
  
  return newUser;
};

export const updateUserCached = async (id: number, user: Partial<Omit<User, 'id'>>): Promise<User | null> => {
  const updatedUser = await db.updateUser(id, user);
  
  if (updatedUser) {
    // Invalidate related caches
    await deleteCache(getCacheKey.users());
    await deleteCache(getCacheKey.user(id));
    await deleteCache(getCacheKey.userByLogin(updatedUser.login));
    
    // Cache the updated user
    await setCache(getCacheKey.user(updatedUser.id), updatedUser, ITEM_TTL);
    await setCache(getCacheKey.userByLogin(updatedUser.login), updatedUser, ITEM_TTL);
  }
  
  return updatedUser;
};

export const deleteUserCached = async (id: number): Promise<boolean> => {
  // Get user first to invalidate login cache
  const user = await db.getUserById(id);
  const result = await db.deleteUser(id);
  
  if (result) {
    // Invalidate related caches
    await deleteCache(getCacheKey.users());
    await deleteCache(getCacheKey.user(id));
    if (user) {
      await deleteCache(getCacheKey.userByLogin(user.login));
    }
  }
  
  return result;
};

// Cached Project operations
export const getProjectsCached = async (): Promise<Project[]> => {
  const cacheKey = getCacheKey.projects();
  
  let projects = await getCache<Project[]>(cacheKey);
  
  if (!projects) {
    projects = await db.getProjects();
    await setCache(cacheKey, projects, LIST_TTL);
  }
  
  return projects;
};

export const getProjectByIdCached = async (id: number): Promise<Project | null> => {
  const cacheKey = getCacheKey.project(id);
  
  let project = await getCache<Project>(cacheKey);
  
  if (!project) {
    project = await db.getProjectById(id);
    if (project) {
      await setCache(cacheKey, project, ITEM_TTL);
    }
  }
  
  return project;
};

export const createProjectCached = async (project: Omit<Project, 'id'>): Promise<Project> => {
  const newProject = await db.createProject(project);
  
  // Invalidate projects list cache
  await deleteCache(getCacheKey.projects());
  
  // Cache the new project
  await setCache(getCacheKey.project(newProject.id), newProject, ITEM_TTL);
  
  return newProject;
};

export const updateProjectCached = async (id: number, project: Partial<Omit<Project, 'id'>>): Promise<Project | null> => {
  const updatedProject = await db.updateProject(id, project);
  
  if (updatedProject) {
    // Invalidate related caches
    await deleteCache(getCacheKey.projects());
    await deleteCache(getCacheKey.project(id));
    
    // Cache the updated project
    await setCache(getCacheKey.project(updatedProject.id), updatedProject, ITEM_TTL);
  }
  
  return updatedProject;
};

export const deleteProjectCached = async (id: number): Promise<boolean> => {
  const result = await db.deleteProject(id);
  
  if (result) {
    // Invalidate related caches
    await deleteCache(getCacheKey.projects());
    await deleteCache(getCacheKey.project(id));
  }
  
  return result;
};

// Cached Event operations
export const getEventsCached = async (): Promise<Event[]> => {
  const cacheKey = getCacheKey.events();
  
  let events = await getCache<Event[]>(cacheKey);
  
  if (!events) {
    events = await db.getEvents();
    await setCache(cacheKey, events, LIST_TTL);
  }
  
  return events;
};

export const getEventByIdCached = async (id: number): Promise<Event | null> => {
  const cacheKey = getCacheKey.event(id);
  
  let event = await getCache<Event>(cacheKey);
  
  if (!event) {
    event = await db.getEventById(id);
    if (event) {
      await setCache(cacheKey, event, ITEM_TTL);
    }
  }
  
  return event;
};

export const createEventCached = async (event: Omit<Event, 'id'>): Promise<Event> => {
  const newEvent = await db.createEvent(event);
  
  // Invalidate events list cache
  await deleteCache(getCacheKey.events());
  
  // Cache the new event
  await setCache(getCacheKey.event(newEvent.id), newEvent, ITEM_TTL);
  
  return newEvent;
};

export const updateEventCached = async (id: number, event: Partial<Omit<Event, 'id'>>): Promise<Event | null> => {
  const updatedEvent = await db.updateEvent(id, event);
  
  if (updatedEvent) {
    // Invalidate related caches
    await deleteCache(getCacheKey.events());
    await deleteCache(getCacheKey.event(id));
    
    // Cache the updated event
    await setCache(getCacheKey.event(updatedEvent.id), updatedEvent, ITEM_TTL);
  }
  
  return updatedEvent;
};

export const deleteEventCached = async (id: number): Promise<boolean> => {
  const result = await db.deleteEvent(id);
  
  if (result) {
    // Invalidate related caches
    await deleteCache(getCacheKey.events());
    await deleteCache(getCacheKey.event(id));
  }
  
  return result;
};

// Cached Message operations
export const getMessagesCached = async (): Promise<Message[]> => {
  const cacheKey = getCacheKey.messages();
  
  let messages = await getCache<Message[]>(cacheKey);
  
  if (!messages) {
    messages = await db.getMessages();
    await setCache(cacheKey, messages, LIST_TTL);
  }
  
  return messages;
};

export const getMessageByIdCached = async (id: number): Promise<Message | null> => {
  const cacheKey = getCacheKey.message(id);
  
  let message = await getCache<Message>(cacheKey);
  
  if (!message) {
    message = await db.getMessageById(id);
    if (message) {
      await setCache(cacheKey, message, ITEM_TTL);
    }
  }
  
  return message;
};

export const getMessagesByUserCached = async (username: string): Promise<Message[]> => {
  const cacheKey = getCacheKey.messagesByUser(username);
  
  let messages = await getCache<Message[]>(cacheKey);
  
  if (!messages) {
    messages = await db.getMessagesByUser(username);
    await setCache(cacheKey, messages, LIST_TTL);
  }
  
  return messages;
};

export const createMessageCached = async (message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => {
  const newMessage = await db.createMessage(message);
  
  // Invalidate related caches
  await deleteCache(getCacheKey.messages());
  await deleteCache(getCacheKey.messagesByUser(message.from));
  await deleteCache(getCacheKey.messagesByUser(message.to));
  
  // Cache the new message
  await setCache(getCacheKey.message(newMessage.id), newMessage, ITEM_TTL);
  
  return newMessage;
};

export const updateMessageCached = async (id: number, message: Partial<Omit<Message, 'id' | 'timestamp'>>): Promise<Message | null> => {
  // Get original message to know which user caches to invalidate
  const originalMessage = await db.getMessageById(id);
  const updatedMessage = await db.updateMessage(id, message);
  
  if (updatedMessage) {
    // Invalidate related caches
    await deleteCache(getCacheKey.messages());
    await deleteCache(getCacheKey.message(id));
    
    if (originalMessage) {
      await deleteCache(getCacheKey.messagesByUser(originalMessage.from));
      await deleteCache(getCacheKey.messagesByUser(originalMessage.to));
    }
    
    if (updatedMessage.from !== originalMessage?.from || updatedMessage.to !== originalMessage?.to) {
      await deleteCache(getCacheKey.messagesByUser(updatedMessage.from));
      await deleteCache(getCacheKey.messagesByUser(updatedMessage.to));
    }
    
    // Cache the updated message
    await setCache(getCacheKey.message(updatedMessage.id), updatedMessage, ITEM_TTL);
  }
  
  return updatedMessage;
};

export const deleteMessageCached = async (id: number): Promise<boolean> => {
  // Get message first to invalidate user caches
  const message = await db.getMessageById(id);
  const result = await db.deleteMessage(id);
  
  if (result) {
    // Invalidate related caches
    await deleteCache(getCacheKey.messages());
    await deleteCache(getCacheKey.message(id));
    if (message) {
      await deleteCache(getCacheKey.messagesByUser(message.from));
      await deleteCache(getCacheKey.messagesByUser(message.to));
    }
  }
  
  return result;
};