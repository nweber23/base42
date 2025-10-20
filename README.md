# Base42

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