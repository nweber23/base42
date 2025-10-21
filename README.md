# base42 - Student Hub for 42 Heilbronn

A full-stack React/Node.js application for 42 students to connect, collaborate, and manage projects.

## Features

- **Dashboard**: Overview of your current project and deadlines
- **Peers**: Connect with fellow students at your campus
- **Projects**: Find teammates and collaborate on assignments
- **Messages**: Chat with other students and groups
- **Calendar**: Track events and deadlines
- **Profile**: Manage your student information

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, TypeScript, Express
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: 42 OAuth API
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites
- **Node.js 18+** (recommended: 20+)
- **Docker and Docker Compose**
- **42 API credentials** (get them from [42 OAuth](https://profile.intra.42.fr/oauth/applications))

### 1. Automatic Setup (Recommended)
```bash
# Clone the repository
git clone <your-repo-url>
cd base42

# Run the setup script (detects your OS and installs dependencies)
./setup.sh

# Or manually:
make setup
```

### 2. Configure 42 API
1. Go to [42 OAuth Applications](https://profile.intra.42.fr/oauth/applications)
2. Create a new application with:
   - **Redirect URI**: `http://localhost:3000/auth/callback`
3. Copy your credentials to `.env` and `base42-backend/.env`:
   ```env
   API_UID=your_42_api_uid
   API_SECRET=your_42_api_secret
   REDIRECT_URI=http://localhost:3000/auth/callback
   ```

### 3. Start the Application
```bash
# Production mode
make up

# Development mode (with hot reloading)
make dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5433
- **Redis**: localhost:6380

## Available Commands

### Development
- `make dev` - Start development environment with hot reloading
- `make dev-frontend` - Start only frontend dev server
- `make dev-backend` - Start only backend dev server

### Production
- `make build` - Build all Docker images
- `make up` - Start all services
- `make down` - Stop all services
- `make restart` - Restart all services

### Database
- `make db-shell` - Connect to PostgreSQL
- `make db-backup` - Create database backup
- `make db-restore FILE=backup.sql` - Restore from backup

### Monitoring
- `make logs` - View all service logs
- `make logs-backend` - Backend logs only
- `make logs-frontend` - Frontend logs only
- `make status` - Check service status
- `make health` - Health check for all services

### Maintenance
- `make clean` - Remove all containers, volumes, and images
- `make lint` - Run linting for both frontend and backend

### 42 API Help
- `make api-info` - Show 42 API configuration instructions

## Environment Variables

### Backend (`base42-backend/.env`)
```env
# Server
PORT=5000
NODE_ENV=development

# 42 API
API_UID=your_42_api_uid
API_SECRET=your_42_api_secret
REDIRECT_URI=http://localhost:3000/auth/callback

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres123
DB_NAME=base42

# Redis
REDIRECT_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis123
```

## Troubleshooting

### Cross-Platform Issues

#### Windows
- Use Git Bash or PowerShell for running scripts
- If Docker volumes don't work, check Docker Desktop settings → Resources → File Sharing
- Line ending issues: run `git config core.autocrlf false` before cloning

#### macOS (Apple Silicon)
- Some Docker images may need `--platform linux/amd64` flag
- Use Homebrew to install dependencies: `brew install node@20`

#### Linux
- Ensure your user is in the docker group: `sudo usermod -aG docker $USER`
- If permission issues with volumes, check SELinux settings

### Common Issues

#### Port Conflicts
If ports are already in use, edit `.env` file:
```bash
FRONTEND_PORT=3001  # Change from 3000
BACKEND_PORT=5001   # Change from 5000
POSTGRES_PORT=5434  # Change from 5433
REDIS_PORT=6381     # Change from 6380
```

#### Build Issues
- Ensure Docker daemon is running
- Check available disk space (need ~2GB)
- Run `make clean` to remove old containers
- Clear Docker cache: `docker system prune -a`

#### Node.js Version Issues
- Use Node.js 18+ (recommended: 20+)
- Check with: `node --version`
- Use nvm to manage versions: `nvm use` (reads .nvmrc)

### 42 API Issues
- Verify API credentials in `.env` files
- Check redirect URI matches exactly
- Run `make api-info` for configuration help

### Health Check
Run comprehensive diagnostics:
```bash
make health  # Full system check
./setup.sh   # Re-run setup if needed
```

A modern React + TypeScript + TailwindCSS application built with Vite.

## Project Structure

```
src/
├─ components/
│  └─ Navbar.tsx
├─ pages/
│  ├─ Dashboard.tsx
│  ├─ Peers.tsx
│  ├─ Projects.tsx
│  ├─ Calendar.tsx
│  └─ Profile.tsx
├─ data/
│  └─ users.json
├─ types/
│  └─ index.ts
├─ App.tsx
└─ main.tsx
```

## Features

- **React Router**: Navigation between different pages
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-friendly interface

## Pages

- **Dashboard**: Overview with quick stats and recent activity
- **Peers**: Team member directory with user information
- **Projects**: Project management with progress tracking
- **Calendar**: Event scheduling and management
- **Profile**: User profile management

## Getting Started

### Prerequisites

- Node.js version 20+ (recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **TailwindCSS** - Styling
- **ESLint** - Code linting

## Note

This project was created with Node.js 18.19.1, which may show compatibility warnings with the latest versions of Vite and React Router. For the best experience, upgrade to Node.js 20+ or use the project as-is with the understanding that some features may require Node.js 20+.

## Author
**nweber & fbraune & apeposhi & bavirgil** - 42 Heilbronn Students
