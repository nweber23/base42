import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { initializeDatabase } from './services/db';
import { initializeCache } from './services/cache';
import apiRoutes from './routes/api';
import syncRoutes from './routes/sync';
import authRoutes from './routes/auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);
app.use('/sync', syncRoutes);
app.use('/auth', authRoutes);

// Test endpoint
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Initialize database
  try {
    await initializeDatabase();
    console.log('Database connection established');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
  
  // Initialize Redis cache
  try {
    await initializeCache();
    console.log('Redis cache connection established');
  } catch (error) {
    console.warn('Failed to initialize Redis cache:', error);
    console.log('Server will continue without caching');
  }
});

export default app;