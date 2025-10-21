import { Pool, PoolClient } from 'pg';
import { User, Project, Event, Message, UserFavorite } from '../models';

// 42 Common Core Project Definitions
const COMMON_CORE_PROJECTS = [
  { name: 'libft', description: 'Your first library - Recoding a few functions of the C standard library.', difficulty_level: 'Beginner', category: 'C Programming' },
  { name: 'get_next_line', description: 'Reading a line from a fd is way too tedious.', difficulty_level: 'Beginner', category: 'C Programming' },
  { name: 'ft_printf', description: 'This project is pretty straightforward, you have to recode printf.', difficulty_level: 'Beginner', category: 'C Programming' },
  { name: 'born2beroot', description: 'This project aims to introduce you to the wonderful world of virtualization.', difficulty_level: 'Beginner', category: 'System Administration' },
  { name: 'fract-ol', description: 'Create graphically beautiful fractals.', difficulty_level: 'Intermediate', category: 'Graphics' },
  { name: 'pipex', description: 'This project will let you discover in detail a UNIX mechanism that you already know by using it in your program.', difficulty_level: 'Intermediate', category: 'Unix' },
  { name: 'push_swap', description: 'This project will make you sort data on a stack, with a limited set of instructions, using the lowest possible number of actions.', difficulty_level: 'Intermediate', category: 'Algorithms' },
  { name: 'minitalk', description: 'The purpose of this project is to code a small data exchange program using UNIX signals.', difficulty_level: 'Intermediate', category: 'Unix' },
  { name: 'so_long', description: 'This project is a small 2D game with textures, sprites and some basic gameplay elements.', difficulty_level: 'Intermediate', category: 'Graphics' },
  { name: 'philosophers', description: 'In this project, you will learn the basics of threading a process. You will see how to create threads and you will discover mutexes.', difficulty_level: 'Advanced', category: 'Unix' },
  { name: 'minishell', description: 'As beautiful as a shell.', difficulty_level: 'Advanced', category: 'Unix' },
  { name: 'cpp-module-00', description: 'This first module of C++ is designed to help you understand the specifities of the language when compared to C.', difficulty_level: 'Intermediate', category: 'C++' },
  { name: 'cpp-module-01', description: 'This module is designed to help you understand Memory allocation, pointers to members, references, switch statement...', difficulty_level: 'Intermediate', category: 'C++' },
  { name: 'cpp-module-02', description: 'This module is designed to help you understand Ad-hoc polymorphism, operator overloading and Orthodox Canonical class form.', difficulty_level: 'Intermediate', category: 'C++' },
  { name: 'cpp-module-03', description: 'This module is designed to help you understand Inheritance.', difficulty_level: 'Intermediate', category: 'C++' },
  { name: 'cpp-module-04', description: 'This module is designed to help you understand Subtype polymorphism, abstract classes and interfaces.', difficulty_level: 'Advanced', category: 'C++' },
  { name: 'cpp-module-05', description: 'This module is designed to help you understand Try/Catch and Exceptions.', difficulty_level: 'Advanced', category: 'C++' },
  { name: 'cpp-module-06', description: 'This module is designed to help you understand the different casts.', difficulty_level: 'Advanced', category: 'C++' },
  { name: 'cpp-module-07', description: 'This module is designed to help you understand Templates.', difficulty_level: 'Advanced', category: 'C++' },
  { name: 'cpp-module-08', description: 'This module is designed to help you understand templated containers, iterators and algorithms.', difficulty_level: 'Advanced', category: 'C++' },
  { name: 'cpp-module-09', description: 'This module is designed to help you understand the containers.', difficulty_level: 'Expert', category: 'C++' },
  { name: 'cub3d', description: 'This project is inspired by the world-famous Wolfenstein 3D game.', difficulty_level: 'Expert', category: 'Graphics' },
  { name: 'minirt', description: 'This project is an introduction to the beautiful world of Raytracing.', difficulty_level: 'Expert', category: 'Graphics' },
  { name: 'webserv', description: 'This project is here to make you write your own HTTP server.', difficulty_level: 'Expert', category: 'Web' },
  { name: 'ft_containers', description: 'In this project, you will implement a few container types of the C++ standard template library.', difficulty_level: 'Expert', category: 'C++' },
  { name: 'inception', description: 'This project aims to broaden your knowledge of system administration by using Docker.', difficulty_level: 'Expert', category: 'DevOps' },
  { name: 'ft_transcendence', description: 'This is the last project of the common core. You will create a website for the mighty Pong contest!', difficulty_level: 'Expert', category: 'Web' },
  { name: 'NetPractice', description: 'NetPractice is a general practical exercise to let you discover networking.', difficulty_level: 'Intermediate', category: 'Network' },
];

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle
  connectionTimeoutMillis: 2000, // how long to try connecting before timing out
});

// Initialize database tables
export const initializeDatabase = async (): Promise<void> => {
  const client: PoolClient = await pool.connect();

  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        login VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        level DECIMAL(4,2) NOT NULL DEFAULT 0,
        campus VARCHAR(100) NOT NULL,
        location VARCHAR(100),
        favorites TEXT[] DEFAULT '{}',
        last_login TIMESTAMP DEFAULT NULL
      )
    `);

    // Create projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        api_42_id INTEGER UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        slug VARCHAR(255),
        exam BOOLEAN DEFAULT FALSE,
        difficulty_level VARCHAR(50) DEFAULT 'Intermediate',
        category VARCHAR(100) DEFAULT 'General',
        deadline TIMESTAMP,
        teammates TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_projects (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        api_42_project_user_id INTEGER UNIQUE,
        completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
        deadline TIMESTAMP,
        status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'active', 'completed', 'failed', 'on_hold')),
        notes TEXT,
        final_mark INTEGER,
        validated BOOLEAN DEFAULT FALSE,
        marked_at TIMESTAMP,
        team_id INTEGER,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_favorites table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        favorite_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, favorite_user_id)
      )
    `);

    // Events table is created later with comprehensive schema

    // Create messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        from_user VARCHAR(100) NOT NULL,
        to_user VARCHAR(100) NOT NULL,
        text TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed projects if they don't exist
    await seedProjects();

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Seed projects function
const seedProjects = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    // Check if projects already exist
    const result = await client.query('SELECT COUNT(*) FROM projects');
    const projectCount = parseInt(result.rows[0].count);

    if (projectCount === 0) {
      console.log('Seeding 42 common core projects...');

      for (const project of COMMON_CORE_PROJECTS) {
        await client.query(
          `INSERT INTO projects (name, description, difficulty_level, category)
           VALUES ($1, $2, $3, $4)`,
          [project.name, project.description, project.difficulty_level, project.category]
        );
      }

      console.log(`Successfully seeded ${COMMON_CORE_PROJECTS.length} projects`);
    } else {
      console.log(`Projects already seeded (${projectCount} projects exist)`);
    }
  } catch (error) {
    console.error('Error seeding projects:', error);
    throw error;
  } finally {
    client.release();
  }
};

// User CRUD Operations
export const getUsers = async (): Promise<User[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users ORDER BY id');
    return result.rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching user by id:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getUserByLogin = async (login: string): Promise<User | null> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE login = $1', [login]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching user by login:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO users (login, name, level, campus, location, favorites) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user.login, user.name, user.level, user.campus, user.location, user.favorites]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const updateUser = async (id: number, user: Partial<Omit<User, 'id'>>): Promise<User | null> => {
  const client = await pool.connect();
  try {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (user.login !== undefined) {
      fields.push(`login = $${paramCount++}`);
      values.push(user.login);
    }
    if (user.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(user.name);
    }
    if (user.level !== undefined) {
      fields.push(`level = $${paramCount++}`);
      values.push(user.level);
    }
    if (user.campus !== undefined) {
      fields.push(`campus = $${paramCount++}`);
      values.push(user.campus);
    }
    if (user.location !== undefined) {
      fields.push(`location = $${paramCount++}`);
      values.push(user.location);
    }
    if (user.favorites !== undefined) {
      fields.push(`favorites = $${paramCount++}`);
      values.push(user.favorites);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await client.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteUser = async (id: number): Promise<boolean> => {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Project CRUD Operations
export const getProjects = async (): Promise<Project[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM projects ORDER BY id');
    return result.rows.map((row: any) => ({
      ...row,
      deadline: row.deadline.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getProjectById = async (id: number): Promise<Project | null> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      deadline: row.deadline.toISOString()
    };
  } catch (error) {
    console.error('Error fetching project by id:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const createProject = async (project: Omit<Project, 'id'>): Promise<Project> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO projects (name, deadline, teammates) VALUES ($1, $2, $3) RETURNING *',
      [project.name, project.deadline, project.teammates]
    );
    const row = result.rows[0];
    return {
      ...row,
      deadline: row.deadline.toISOString()
    };
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const updateProject = async (id: number, project: Partial<Omit<Project, 'id'>>): Promise<Project | null> => {
  const client = await pool.connect();
  try {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (project.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(project.name);
    }
    if (project.deadline !== undefined) {
      fields.push(`deadline = $${paramCount++}`);
      values.push(project.deadline);
    }
    if (project.teammates !== undefined) {
      fields.push(`teammates = $${paramCount++}`);
      values.push(project.teammates);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await client.query(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      deadline: row.deadline.toISOString()
    };
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteProject = async (id: number): Promise<boolean> => {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM projects WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Event CRUD Operations
export const getEvents = async (): Promise<Event[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM events ORDER BY date');
    return result.rows.map((row: any) => ({
      ...row,
      date: row.date.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getEventById = async (id: number): Promise<Event | null> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM events WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      date: row.date.toISOString()
    };
  } catch (error) {
    console.error('Error fetching event by id:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const createEvent = async (event: Omit<Event, 'id'>): Promise<Event> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO events (name, date, type) VALUES ($1, $2, $3) RETURNING *',
      [event.name, event.date, event.type]
    );
    const row = result.rows[0];
    return {
      ...row,
      date: row.date.toISOString()
    };
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const updateEvent = async (id: number, event: Partial<Omit<Event, 'id'>>): Promise<Event | null> => {
  const client = await pool.connect();
  try {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (event.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(event.name);
    }
    if (event.date !== undefined) {
      fields.push(`date = $${paramCount++}`);
      values.push(event.date);
    }
    if (event.type !== undefined) {
      fields.push(`type = $${paramCount++}`);
      values.push(event.type);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await client.query(
      `UPDATE events SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      date: row.date.toISOString()
    };
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteEvent = async (id: number): Promise<boolean> => {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM events WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Message CRUD Operations
export const getMessages = async (): Promise<Message[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM messages ORDER BY created_at DESC');
    return result.rows.map((row: any) => ({
      ...row,
      created_at: row.created_at.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getMessageById = async (id: number): Promise<Message | null> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM messages WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      created_at: row.created_at.toISOString()
    };
  } catch (error) {
    console.error('Error fetching message by id:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Get conversation between two users
export const getConversation = async (userId1: number, userId2: number): Promise<Message[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [userId1, userId2]
    );
    return result.rows.map((row: any) => ({
      ...row,
      created_at: row.created_at.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Get all conversations for a user (with last message)
export const getUserConversations = async (userId: number): Promise<any[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT DISTINCT ON (other_user_id)
         other_user_id,
         u.login as other_user_login,
         u.name as other_user_name,
         m.id as last_message_id,
         m.content as last_message_content,
         m.created_at as last_message_time,
         m.sender_id,
         m.receiver_id,
         m.read,
         (SELECT COUNT(*) FROM messages
          WHERE receiver_id = $1
            AND sender_id = other_user_id
            AND read = FALSE) as unread_count
       FROM (
         SELECT
           CASE
             WHEN sender_id = $1 THEN receiver_id
             ELSE sender_id
           END as other_user_id,
           id, content, created_at, sender_id, receiver_id, read
         FROM messages
         WHERE sender_id = $1 OR receiver_id = $1
       ) m
       JOIN users u ON u.id = m.other_user_id
       ORDER BY other_user_id, m.created_at DESC`,
      [userId]
    );
    return result.rows.map((row: any) => ({
      user_id: row.other_user_id,
      user_login: row.other_user_login,
      user_name: row.other_user_name,
      last_message: {
        id: row.last_message_id,
        content: row.last_message_content,
        created_at: row.last_message_time ? row.last_message_time.toISOString() : null,
        sender_id: row.sender_id,
        receiver_id: row.receiver_id,
        read: row.read
      },
      unread_count: parseInt(row.unread_count) || 0
    }));
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const createMessage = async (message: Omit<Message, 'id' | 'created_at'>): Promise<Message> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO messages (sender_id, receiver_id, content, read) VALUES ($1, $2, $3, $4) RETURNING *',
      [message.sender_id, message.receiver_id, message.content, message.read || false]
    );
    const row = result.rows[0];
    return {
      ...row,
      created_at: row.created_at.toISOString()
    };
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Mark messages as read
export const markMessagesAsRead = async (senderId: number, receiverId: number): Promise<number> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE messages SET read = TRUE WHERE sender_id = $1 AND receiver_id = $2 AND read = FALSE',
      [senderId, receiverId]
    );
    return result.rowCount || 0;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const updateMessage = async (id: number, message: Partial<Omit<Message, 'id' | 'created_at'>>): Promise<Message | null> => {
  const client = await pool.connect();
  try {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (message.content !== undefined) {
      fields.push(`content = $${paramCount++}`);
      values.push(message.content);
    }
    if (message.read !== undefined) {
      fields.push(`read = $${paramCount++}`);
      values.push(message.read);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await client.query(
      `UPDATE messages SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      created_at: row.created_at.toISOString()
    };
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteMessage = async (id: number): Promise<boolean> => {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM messages WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  } finally {
    client.release();
  }
};

// User Favorites Operations
export const getUserFavorites = async (userId: number): Promise<User[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT u.* FROM users u
      JOIN user_favorites uf ON u.id = uf.favorite_user_id
      WHERE uf.user_id = $1
      ORDER BY u.name
    `, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const addUserFavorite = async (userId: number, favoriteUserId: number): Promise<UserFavorite> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO user_favorites (user_id, favorite_user_id) VALUES ($1, $2) RETURNING *',
      [userId, favoriteUserId]
    );
    return {
      ...result.rows[0],
      created_at: result.rows[0].created_at.toISOString()
    };
  } catch (error) {
    console.error('Error adding user favorite:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const removeUserFavorite = async (userId: number, favoriteUserId: number): Promise<boolean> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM user_favorites WHERE user_id = $1 AND favorite_user_id = $2',
      [userId, favoriteUserId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error removing user favorite:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const isUserFavorite = async (userId: number, favoriteUserId: number): Promise<boolean> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT 1 FROM user_favorites WHERE user_id = $1 AND favorite_user_id = $2',
      [userId, favoriteUserId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error checking if user is favorite:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getUsersByCampus = async (campus: string): Promise<User[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE campus = $1 ORDER BY name',
      [campus]
    );
    return result.rows.map((row: any) => ({
      ...row,
      last_login: row.last_login ? row.last_login.toISOString() : null
    }));
  } catch (error) {
    console.error('Error fetching users by campus:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getCurrentlyLoggedInUsersByCampus = async (campus: string): Promise<User[]> => {
  const client = await pool.connect();
  try {
    // Get users who are currently logged in (have a last_login timestamp)
    const result = await client.query(
      `SELECT * FROM users
       WHERE campus = $1
       AND last_login IS NOT NULL
       ORDER BY name`,
      [campus]
    );
    return result.rows.map((row: any) => ({
      ...row,
      last_login: row.last_login ? row.last_login.toISOString() : null
    }));
  } catch (error) {
    console.error('Error fetching currently logged in users by campus:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Project Operations
export const getAllProjects = async (): Promise<any[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM projects ORDER BY name'
    );
    // Filter to only show common core projects
    const filteredProjects = result.rows.filter(project =>
      isCommonCoreProject(project.name)
    );
    return filteredProjects;
  } catch (error) {
    console.error('Error fetching all projects:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getUserProjects = async (userId: number): Promise<any[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT up.*, p.name, p.description, p.difficulty_level, p.category
       FROM user_projects up
       JOIN projects p ON up.project_id = p.id
       WHERE up.user_id = $1 AND up.status IN ('in_progress', 'active')
       ORDER BY up.started_at DESC`,
      [userId]
    );
    return result.rows.map((row: any) => ({
      ...row,
      deadline: row.deadline ? row.deadline.toISOString() : null,
      started_at: row.started_at ? row.started_at.toISOString() : null
    }));
  } catch (error) {
    console.error('Error fetching user projects:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Get user's single active project
export const getUserActiveProject = async (userId: number): Promise<any | null> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT up.*, p.name, p.description, p.difficulty_level, p.category
       FROM user_projects up
       JOIN projects p ON up.project_id = p.id
       WHERE up.user_id = $1 AND up.status IN ('in_progress', 'active')
       ORDER BY up.started_at DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      ...result.rows[0],
      deadline: result.rows[0].deadline ? result.rows[0].deadline.toISOString() : null,
      started_at: result.rows[0].started_at ? result.rows[0].started_at.toISOString() : null
    };
  } catch (error) {
    console.error('Error fetching user active project:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getAllUserProjectsOverview = async (): Promise<any[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT up.*, p.name, p.description, p.difficulty_level, p.category,
              u.name as user_name, u.login as user_login, u.campus
       FROM user_projects up
       JOIN projects p ON up.project_id = p.id
       JOIN users u ON up.user_id = u.id
       WHERE up.status = 'in_progress'
       ORDER BY up.started_at DESC`
    );
    return result.rows.map((row: any) => ({
      ...row,
      deadline: row.deadline ? row.deadline.toISOString() : null,
      started_at: row.started_at ? row.started_at.toISOString() : null
    }));
  } catch (error) {
    console.error('Error fetching project overview:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const addUserProject = async (userId: number, projectId: number, deadline?: string, notes?: string): Promise<any> => {
  const client = await pool.connect();
  try {
    // Check if user already has an active project
    const existingProject = await client.query(
      'SELECT COUNT(*) FROM user_projects WHERE user_id = $1 AND status IN ($2, $3)',
      [userId, 'in_progress', 'active']
    );

    if (existingProject.rows[0].count > 0) {
      throw new Error('You can only have one active project at a time. Please complete or remove your current project first.');
    }

    const result = await client.query(
      `INSERT INTO user_projects (user_id, project_id, deadline, notes, status)
       VALUES ($1, $2, $3, $4, 'in_progress')
       RETURNING *`,
      [userId, projectId, deadline || null, notes || null]
    );
    return {
      ...result.rows[0],
      deadline: result.rows[0].deadline ? result.rows[0].deadline.toISOString() : null,
      started_at: result.rows[0].started_at ? result.rows[0].started_at.toISOString() : null
    };
  } catch (error) {
    console.error('Error adding user project:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const updateUserProject = async (userId: number, userProjectId: number, updates: any): Promise<any> => {
  const client = await pool.connect();
  try {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if ('completion_percentage' in updates) {
      fields.push(`completion_percentage = $${paramCount}`);
      values.push(updates.completion_percentage);
      paramCount++;
    }

    if ('deadline' in updates) {
      fields.push(`deadline = $${paramCount}`);
      values.push(updates.deadline);
      paramCount++;
    }

    if ('status' in updates) {
      fields.push(`status = $${paramCount}`);
      values.push(updates.status);
      paramCount++;
    }

    if ('notes' in updates) {
      fields.push(`notes = $${paramCount}`);
      values.push(updates.notes);
      paramCount++;
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(userProjectId, userId);

    const result = await client.query(
      `UPDATE user_projects SET ${fields.join(', ')}
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Project not found or access denied');
    }

    return {
      ...result.rows[0],
      deadline: result.rows[0].deadline ? result.rows[0].deadline.toISOString() : null,
      started_at: result.rows[0].started_at ? result.rows[0].started_at.toISOString() : null
    };
  } catch (error) {
    console.error('Error updating user project:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteUserProject = async (userId: number, userProjectId: number): Promise<boolean> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM user_projects WHERE id = $1 AND user_id = $2',
      [userProjectId, userId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting user project:', error);
    throw error;
  } finally {
    client.release();
  }
};

// 42 API Project Sync Operations
export const syncProjectFrom42API = async (projectData: any): Promise<any> => {
  const client = await pool.connect();
  try {
    // First, create or update the project in projects table
    const projectResult = await client.query(
      `INSERT INTO projects (api_42_id, name, description, slug, exam, difficulty_level, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (api_42_id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         slug = EXCLUDED.slug,
         exam = EXCLUDED.exam,
         difficulty_level = EXCLUDED.difficulty_level,
         category = EXCLUDED.category
       RETURNING *`,
      [
        projectData.api_42_id,
        projectData.name,
        projectData.description,
        projectData.slug,
        projectData.exam,
        projectData.difficulty_level || 'Intermediate', // Default difficulty
        projectData.category || 'General' // Default category
      ]
    );

    return projectResult.rows[0];
  } catch (error) {
    console.error('Error syncing project from 42 API:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const syncUserProjectFrom42API = async (userId: number, projectUserData: any): Promise<any> => {
  const client = await pool.connect();
  try {
    // First, ensure the project exists
    const project = await syncProjectFrom42API({
      api_42_id: projectUserData.project.id,
      name: projectUserData.project.name,
      description: projectUserData.project.description,
      slug: projectUserData.project.slug,
      exam: projectUserData.project.exam,
    });

    // Calculate completion percentage based on status
    let completionPercentage = 0;
    let status = 'in_progress';

    if (projectUserData.status === 'finished') {
      completionPercentage = 100;
      status = projectUserData.validated ? 'completed' : 'failed';
    } else if (projectUserData.status === 'in_progress') {
      completionPercentage = projectUserData.final_mark ? Math.max(0, Math.min(100, projectUserData.final_mark)) : 0;
    }

    // Get deadline from team data if available
    let deadline = null;
    if (projectUserData.teams && projectUserData.teams[0]?.terminating_at) {
      deadline = projectUserData.teams[0].terminating_at;
    }

    // Create or update user project
    const userProjectResult = await client.query(
      `INSERT INTO user_projects (
         user_id, project_id, api_42_project_user_id, completion_percentage,
         deadline, status, final_mark, validated, marked_at, team_id
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (api_42_project_user_id) DO UPDATE SET
         completion_percentage = EXCLUDED.completion_percentage,
         deadline = EXCLUDED.deadline,
         status = EXCLUDED.status,
         final_mark = EXCLUDED.final_mark,
         validated = EXCLUDED.validated,
         marked_at = EXCLUDED.marked_at,
         team_id = EXCLUDED.team_id
       RETURNING *`,
      [
        userId,
        project.id,
        projectUserData.id,
        completionPercentage,
        deadline,
        status,
        projectUserData.final_mark,
        projectUserData.validated,
        projectUserData.marked_at,
        projectUserData.teams && projectUserData.teams[0] ? projectUserData.teams[0].id : null
      ]
    );

    return {
      ...userProjectResult.rows[0],
      name: project.name,
      description: project.description,
      difficulty_level: project.difficulty_level,
      category: project.category,
      deadline: userProjectResult.rows[0].deadline ? userProjectResult.rows[0].deadline.toISOString() : null,
      started_at: userProjectResult.rows[0].started_at ? userProjectResult.rows[0].started_at.toISOString() : null,
      marked_at: userProjectResult.rows[0].marked_at ? userProjectResult.rows[0].marked_at.toISOString() : null
    };
  } catch (error) {
    console.error('Error syncing user project from 42 API:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Common core project names for filtering (42 curriculum main projects)
const COMMON_CORE_PROJECT_NAMES = [
  'libft', 'get_next_line', 'ft_printf', 'born2beroot', 'fract-ol', 'pipex',
  'push_swap', 'minitalk', 'so_long', 'philosophers', 'minishell',
  'cpp-module-00', 'cpp-module-01', 'cpp-module-02', 'cpp-module-03',
  'cpp-module-04', 'cpp-module-05', 'cpp-module-06', 'cpp-module-07',
  'cpp-module-08', 'cpp-module-09', 'cub3d', 'webserv', 'ft_containers',
  'inception', 'ft_transcendence'
];

const isCommonCoreProject = (projectName: string): boolean => {
  return COMMON_CORE_PROJECT_NAMES.some(coreProject =>
    projectName.toLowerCase().includes(coreProject.toLowerCase()) ||
    coreProject.toLowerCase().includes(projectName.toLowerCase())
  );
};

export const syncUser42Projects = async (userId: number, projectsData: any[]): Promise<any[]> => {
  const results = [];

  // Check if user already has an active project
  const client = await pool.connect();
  try {
    const existingProject = await client.query(
      'SELECT COUNT(*) FROM user_projects WHERE user_id = $1 AND status IN ($2, $3)',
      [userId, 'in_progress', 'active']
    );

    if (existingProject.rows[0].count > 0) {
      console.log(`User ${userId} already has an active project, skipping sync`);
      return [];
    }
  } catch (error) {
    console.error('Error checking existing projects:', error);
  } finally {
    client.release();
  }

  for (const projectUserData of projectsData) {
    try {
      // Only sync active projects (not finished or parent)
      if (projectUserData.status === 'parent' || projectUserData.status === 'finished') {
        continue;
      }

      // Only sync common core projects
      if (!isCommonCoreProject(projectUserData.project.name)) {
        console.log(`Skipping non-common-core project: ${projectUserData.project.name}`);
        continue;
      }

      const result = await syncUserProjectFrom42API(userId, projectUserData);
      results.push(result);

      // Only sync one project (first matching common core project)
      break;
    } catch (error) {
      console.error(`Failed to sync project ${projectUserData.project.name} for user ${userId}:`, error);
      // Continue with other projects
    }
  }

  return results;
};

// Community Events CRUD Operations
export const getCommunityEvents = async (): Promise<any[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM community_events ORDER BY date ASC'
    );
    return result.rows.map((row: any) => ({
      ...row,
      date: row.date.toISOString(),
      created_at: row.created_at.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching community events:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getCommunityEventById = async (id: number): Promise<any | null> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM community_events WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      date: row.date.toISOString(),
      created_at: row.created_at.toISOString()
    };
  } catch (error) {
    console.error('Error fetching community event by id:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const createCommunityEvent = async (event: {
  user_id: number;
  title: string;
  description?: string;
  date: string;
  location?: string;
  link?: string;
}): Promise<any> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO community_events (user_id, title, description, date, location, link)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [event.user_id, event.title, event.description || null, event.date, event.location || null, event.link || null]
    );
    const row = result.rows[0];
    return {
      ...row,
      date: row.date.toISOString(),
      created_at: row.created_at.toISOString()
    };
  } catch (error) {
    console.error('Error creating community event:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const updateCommunityEvent = async (id: number, userId: number, updates: {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  link?: string;
}): Promise<any | null> => {
  const client = await pool.connect();
  try {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.date !== undefined) {
      fields.push(`date = $${paramCount++}`);
      values.push(updates.date);
    }
    if (updates.location !== undefined) {
      fields.push(`location = $${paramCount++}`);
      values.push(updates.location);
    }
    if (updates.link !== undefined) {
      fields.push(`link = $${paramCount++}`);
      values.push(updates.link);
    }

    if (fields.length === 0) return null;

    values.push(id, userId);
    const result = await client.query(
      `UPDATE community_events SET ${fields.join(', ')}
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      date: row.date.toISOString(),
      created_at: row.created_at.toISOString()
    };
  } catch (error) {
    console.error('Error updating community event:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteCommunityEvent = async (id: number, userId: number): Promise<boolean> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM community_events WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting community event:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Close database connection pool
export const closeDatabase = async (): Promise<void> => {
  await pool.end();
};
