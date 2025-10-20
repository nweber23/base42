# Base42 Backend

A Node.js + TypeScript backend server for the Base42 project.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your actual values:
   - **42 API credentials**: Get your API_UID and API_SECRET from the 42 API
   - **PostgreSQL**: Configure your database connection details
   - **Redis**: Set your Redis server connection details

3. **Start development server:**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload using nodemon
- `npm run build` - Compile TypeScript to JavaScript in the `dist/` directory
- `npm start` - Run the production build
- `npm test` - Run tests (not configured yet)

## Project Structure

```
src/
├── controllers/    # Route controllers
├── routes/         # API routes
├── models/         # Database models
├── services/       # Business logic services
├── utils/          # Utility functions
└── index.ts        # Main server file
```

## API Endpoints

### Core API
- `GET /ping` - Health check endpoint (returns "pong")
- `GET /api/users` - List all users (cached)
- `GET /api/users/:id` - Get user by ID (cached)
- `GET /api/projects` - List all projects (cached)
- `GET /api/events` - List all events (cached)
- `GET /api/messages` - List all messages (cached)

### 42 API Integration
- `GET /sync/status` - Check 42 API service status
- `GET /sync/test` - Test 42 API connection
- `POST /sync/user/:login` - Sync user profile from 42 API
- `POST /sync/user/:login/projects` - Sync user projects from 42 API
- `POST /sync/user/:login/complete` - Complete user sync (profile + projects)
- `POST /sync/users/bulk` - Bulk sync multiple users (max 10)

## Environment Variables

Required environment variables (see `.env.example`):

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `API_UID` - 42 API User ID
- `API_SECRET` - 42 API Secret
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_USER` - PostgreSQL username
- `DB_PASSWORD` - PostgreSQL password
- `DB_NAME` - PostgreSQL database name
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port

## Dependencies

### Production
- express - Web framework
- axios - HTTP client
- pg - PostgreSQL client
- redis - Redis client
- dotenv - Environment variables
- cors - Cross-origin resource sharing
- body-parser - Request body parsing

### Development
- typescript - TypeScript compiler
- ts-node - TypeScript execution
- nodemon - Development server with hot reload
- @types/express - Express type definitions
- @types/node - Node.js type definitions