import { Pool, PoolClient } from 'pg';
import { User, Project, Event, Message } from '../models';

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
        favorites TEXT[] DEFAULT '{}'
      )
    `);

    // Create projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        deadline TIMESTAMP NOT NULL,
        teammates TEXT[] DEFAULT '{}'
      )
    `);

    // Create events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date TIMESTAMP NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('Campus', 'Hackathon'))
      )
    `);

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

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
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
    const result = await client.query('SELECT id, from_user as "from", to_user as "to", text, timestamp FROM messages ORDER BY timestamp DESC');
    return result.rows.map((row: any) => ({
      ...row,
      timestamp: row.timestamp.toISOString()
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
    const result = await client.query('SELECT id, from_user as "from", to_user as "to", text, timestamp FROM messages WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      ...row,
      timestamp: row.timestamp.toISOString()
    };
  } catch (error) {
    console.error('Error fetching message by id:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getMessagesByUser = async (username: string): Promise<Message[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, from_user as "from", to_user as "to", text, timestamp FROM messages WHERE from_user = $1 OR to_user = $1 ORDER BY timestamp DESC',
      [username]
    );
    return result.rows.map((row: any) => ({
      ...row,
      timestamp: row.timestamp.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching messages by user:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const createMessage = async (message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO messages (from_user, to_user, text) VALUES ($1, $2, $3) RETURNING id, from_user as "from", to_user as "to", text, timestamp',
      [message.from, message.to, message.text]
    );
    const row = result.rows[0];
    return {
      ...row,
      timestamp: row.timestamp.toISOString()
    };
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const updateMessage = async (id: number, message: Partial<Omit<Message, 'id' | 'timestamp'>>): Promise<Message | null> => {
  const client = await pool.connect();
  try {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (message.from !== undefined) {
      fields.push(`from_user = $${paramCount++}`);
      values.push(message.from);
    }
    if (message.to !== undefined) {
      fields.push(`to_user = $${paramCount++}`);
      values.push(message.to);
    }
    if (message.text !== undefined) {
      fields.push(`text = $${paramCount++}`);
      values.push(message.text);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await client.query(
      `UPDATE messages SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, from_user as "from", to_user as "to", text, timestamp`,
      values
    );
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      timestamp: row.timestamp.toISOString()
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

// Close database connection pool
export const closeDatabase = async (): Promise<void> => {
  await pool.end();
};