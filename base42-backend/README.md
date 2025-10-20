# Base42 Backend

base42 backend for unified 42 campus platform - A comprehensive Node.js + TypeScript backend server providing REST APIs for user management, project tracking, event coordination, and messaging within the 42 school ecosystem.

## Features

- **42 API Integration**: Seamless synchronization with 42's official API
- **User Management**: Complete CRUD operations with favorites management
- **Project Tracking**: Project management with team collaboration features
- **Event System**: Campus and hackathon event management
- **Messaging**: User-to-user communication system with conversation tracking
- **Redis Caching**: High-performance caching for frequently accessed data
- **PostgreSQL**: Robust relational database with full ACID compliance
- **TypeScript**: Full type safety and modern JavaScript features
- **Docker Support**: Complete containerization with multi-service orchestration

## Technology Stack

- **Runtime**: Node.js 20
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **HTTP Client**: Axios
- **Authentication**: 42 OAuth2
- **Containerization**: Docker & Docker Compose

## Setup

### Local Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd base42-backend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your actual values:
   ```bash
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # 42 API Credentials (Required)
   API_UID=your_42_api_uid
   API_SECRET=your_42_api_secret
   
   # PostgreSQL Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=base42
   
   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

3. **Set up local databases (if not using Docker):**
   ```bash
   # PostgreSQL
   createdb base42
   
   # Redis
   redis-server
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

### Getting 42 API Credentials

1. Go to [42's API documentation](https://api.intra.42.fr/)
2. Create a new application
3. Copy your `API_UID` and `API_SECRET`
4. Add them to your `.env` file

## Docker Setup

### Using Docker Compose (Recommended)

1. **Configure environment:**
   ```bash
   cp .env.docker .env
   # Edit .env with your 42 API credentials
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f backend
   ```

4. **Stop services:**
   ```bash
   docker-compose down
   ```

### Docker Services

- **Backend**: Node.js app running on port 5000
- **PostgreSQL**: Database on port 5432 with persistent storage
- **Redis**: Cache on port 6379 with persistent storage

### Docker Commands

```bash
# Build and start services
docker-compose up --build

# Start in background
docker-compose up -d

# View service status
docker-compose ps

# Execute commands in containers
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d base42
docker-compose exec redis redis-cli

# Stop and remove containers
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to dist/
npm start           # Run production build

# 42 API Integration
curl -X POST http://localhost:5000/sync/user/your_login
curl -X POST http://localhost:5000/sync/user/your_login/complete

# Database Management
# Tables are created automatically on server startup
# Use PostgreSQL client or Docker exec for manual operations

# Testing
npm test            # Run tests (configure as needed)
```

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

### Health Check
```bash
GET /ping
# Response: { "message": "pong" }
curl http://localhost:5000/ping
```

### Users API
```bash
# Get all users
GET /api/users
curl http://localhost:5000/api/users

# Get user by ID
GET /api/users/:id
curl http://localhost:5000/api/users/1

# Create user
POST /api/users
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "login": "jdoe",
    "name": "John Doe",
    "campus": "Paris",
    "level": 5.42,
    "location": "c1r1s1",
    "favorites": ["C", "Python"]
  }'

# Update user
PUT /api/users/:id
curl -X PUT http://localhost:5000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"level": 6.0}'

# Delete user
DELETE /api/users/:id
curl -X DELETE http://localhost:5000/api/users/1

# User favorites management
GET /api/users/:id/favorites
PUT /api/users/:id/favorites
POST /api/users/:id/favorites    # Add favorites
DELETE /api/users/:id/favorites  # Remove favorites
```

### Projects API
```bash
# Get all projects
GET /api/projects
curl http://localhost:5000/api/projects

# Get project by ID
GET /api/projects/:id
curl http://localhost:5000/api/projects/1

# Create project
POST /api/projects
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ft_printf",
    "deadline": "2024-12-31T23:59:59.000Z",
    "teammates": ["alice", "bob"]
  }'

# Update project
PUT /api/projects/:id
curl -X PUT http://localhost:5000/api/projects/1 \
  -H "Content-Type: application/json" \
  -d '{"deadline": "2024-12-25T23:59:59.000Z"}'

# Project teammates management
GET /api/projects/:id/teammates
PUT /api/projects/:id/teammates
POST /api/projects/:id/teammates    # Add teammates
DELETE /api/projects/:id/teammates  # Remove teammates
```

### Events API
```bash
# Get all events
GET /api/events
curl http://localhost:5000/api/events

# Get upcoming events
GET /api/events/upcoming
curl http://localhost:5000/api/events/upcoming

# Get past events
GET /api/events/past
curl http://localhost:5000/api/events/past

# Create event
POST /api/events
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Piscine C",
    "date": "2024-07-01T09:00:00.000Z",
    "type": "Campus"
  }'

# Event types: "Campus" | "Hackathon"
```

### Messages API
```bash
# Get all messages
GET /api/messages
curl http://localhost:5000/api/messages

# Get messages by user
GET /api/messages/user/:username
curl http://localhost:5000/api/messages/user/jdoe

# Get conversation between two users
GET /api/messages/conversation/:user1/:user2
curl http://localhost:5000/api/messages/conversation/alice/bob

# Get sent messages
GET /api/messages/sent/:username
curl http://localhost:5000/api/messages/sent/jdoe

# Get received messages
GET /api/messages/received/:username
curl http://localhost:5000/api/messages/received/jdoe

# Create message
POST /api/messages
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "from": "alice",
    "to": "bob",
    "text": "Hey! How is your project going?"
  }'
```

### 42 API Integration
```bash
# Check 42 API status
GET /sync/status
curl http://localhost:5000/sync/status

# Test 42 API connection
GET /sync/test
curl http://localhost:5000/sync/test

# Sync user profile from 42 API
POST /sync/user/:login
curl -X POST http://localhost:5000/sync/user/jdoe

# Sync user projects from 42 API
POST /sync/user/:login/projects
curl -X POST http://localhost:5000/sync/user/jdoe/projects

# Complete user sync (profile + projects)
POST /sync/user/:login/complete
curl -X POST http://localhost:5000/sync/user/jdoe/complete

# Bulk sync multiple users (max 10)
POST /sync/users/bulk
curl -X POST http://localhost:5000/sync/users/bulk \
  -H "Content-Type: application/json" \
  -d '{"logins": ["alice", "bob", "charlie"]}'
```

## Environment Variables

Configuration reference for all environment variables:

### Server Configuration
```bash
PORT=5000                    # Server port (default: 5000)
NODE_ENV=development         # Environment: development | production
```

### 42 API Configuration (Required)
```bash
API_UID=your_42_api_uid      # 42 API Application UID
API_SECRET=your_42_api_secret # 42 API Application Secret
```

### PostgreSQL Configuration
```bash
DB_HOST=localhost            # Database host
DB_PORT=5432                # Database port
DB_USER=postgres            # Database username
DB_PASSWORD=your_password    # Database password
DB_NAME=base42              # Database name
```

### Redis Configuration
```bash
REDIS_HOST=localhost         # Redis host
REDIS_PORT=6379             # Redis port
REDIS_PASSWORD=             # Redis password (optional)
```

### Docker Environment
When using Docker Compose, these are automatically configured:
```bash
DB_HOST=postgres            # Container service name
REDIS_HOST=redis            # Container service name
DB_PASSWORD=postgres123     # Default Docker password
REDIS_PASSWORD=redis123     # Default Docker password
```

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

## Development Workflow

### Quick Start with Docker
```bash
# 1. Clone and configure
git clone <repository-url>
cd base42-backend
cp .env.docker .env
# Edit .env with your 42 API credentials

# 2. Start everything
docker-compose up --build -d

# 3. Test the API
curl http://localhost:5000/ping
curl http://localhost:5000/sync/status

# 4. Sync a user from 42 API
curl -X POST http://localhost:5000/sync/user/your_login

# 5. View the synced data
curl http://localhost:5000/api/users
```

### Database Schema
The following tables are automatically created:

- **users**: id, login, name, level, campus, location, favorites[]
- **projects**: id, name, deadline, teammates[]
- **events**: id, name, date, type
- **messages**: id, from_user, to_user, text, timestamp

### Caching Strategy
- **Lists** (users, projects, events, messages): 3-minute TTL
- **Individual items**: 10-minute TTL
- **Automatic invalidation** on updates/deletes
- **Redis persistence** enabled with AOF

## Troubleshooting

### Common Issues

**"42 API authentication failed"**
```bash
# Check your credentials
curl http://localhost:5000/sync/test

# Verify environment variables
docker-compose exec backend printenv | grep API
```

**"Database connection failed"**
```bash
# Check PostgreSQL status
docker-compose ps postgres
docker-compose logs postgres

# Test database connection
docker-compose exec postgres psql -U postgres -d base42 -c "SELECT 1;"
```

**"Redis connection failed"**
```bash
# Check Redis status
docker-compose ps redis
docker-compose logs redis

# Test Redis connection
docker-compose exec redis redis-cli ping
```

**"Port already in use"**
```bash
# Check what's using the port
lsof -i :5000

# Or change port in docker-compose.yml
ports:
  - "3000:5000"  # Use port 3000 instead
```

### Logs and Debugging
```bash
# View all logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis

# Access container shell for debugging
docker-compose exec backend sh
```

### Data Management
```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres base42 > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres base42 < backup.sql

# Clear all data (WARNING: destructive)
docker-compose down -v

# Reset specific service
docker-compose stop backend
docker-compose rm backend
docker-compose up backend
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test them
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Submit a pull request

### Code Style
- TypeScript with strict mode enabled
- ESLint and Prettier for code formatting
- Descriptive commit messages
- Comprehensive error handling
- API documentation for new endpoints

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- 📧 **Email**: [Add your email]
- 🐛 **Issues**: [GitHub Issues URL]
- 📖 **Documentation**: This README and inline code comments
- 🌐 **42 API Docs**: https://api.intra.42.fr/
