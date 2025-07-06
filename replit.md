# Robertson Education School Website

## Overview

This is a comprehensive multi-page school website for Robertson Education built with modern web technologies. The application features an informational frontend for visitors, students, and parents, along with a robust result checker system and administrative dashboard. The website provides a complete digital presence for the educational institution with dynamic functionality and beautiful design.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Animations**: AOS (Animate on Scroll) library for smooth page transitions
- **State Management**: TanStack Query for server state management
- **Routing**: Hash-based client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage

### Build System
- **Bundler**: Vite for frontend development and building
- **Build Tool**: ESBuild for server-side bundling
- **Development**: Hot module replacement and runtime error overlay

## Key Components

### Public Pages
1. **Home Page**: Hero slider with 4 slides, feature sections, FAQ, and history
2. **About Page**: Mission, vision, history, and values with animated sections
3. **News/Blog**: Dynamic news system with categories and search functionality
4. **Admission**: Online application form with PDF generation capability
5. **Contact**: Contact form with validation and Google Maps integration
6. **Results**: Student result checker with scratch card validation

### Admin Dashboard
- Student management (CRUD operations)
- Result management and grading system
- Scratch card generation and management
- News/blog content management
- Contact message handling
- School information management

### Result Checker System
- Student ID and scratch card PIN validation
- Session/term selection
- Dynamic result display with grades and GPA
- Print/download functionality
- Scratch card expiry and usage tracking

## Data Flow

### Authentication Flow
1. User authentication through Replit Auth (OpenID Connect)
2. Session management with PostgreSQL storage
3. Role-based access control (admin/user)
4. Automatic session validation and refresh

### Result Checking Flow
1. Student enters ID and scratch card PIN
2. System validates PIN against database (expiry, usage limits)
3. If valid, retrieves and displays student results
4. Option to print or download results
5. PIN usage tracking for security

### Content Management Flow
1. Admin creates/edits content through dashboard
2. Content stored in PostgreSQL with proper relationships
3. Public pages dynamically fetch and display content
4. Real-time updates without page refresh

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Connection Pooling**: Built-in connection management
- **Migrations**: Drizzle Kit for schema management

### Third-party Services
- **Replit Auth**: Authentication and user management
- **Unsplash**: Stock images for visual content
- **Google Fonts**: Custom typography (Playfair Display, Crimson Text)
- **Lucide React**: Modern icon library

### Key NPM Packages
- **@tanstack/react-query**: Server state management
- **@hookform/resolvers**: Form validation integration
- **react-hook-form**: Form handling and validation
- **zod**: Runtime type validation
- **date-fns**: Date manipulation utilities
- **aos**: Scroll animations

## Deployment Strategy

### Development
- **Local Development**: `npm run dev` with hot reloading
- **Database**: Development database with Drizzle migrations
- **Environment**: NODE_ENV=development with debug logging

### Production
- **Build Process**: 
  1. Frontend build with Vite (`vite build`)
  2. Server build with ESBuild (`esbuild server/index.ts`)
  3. Static assets bundled and optimized
- **Deployment**: `npm start` runs production server
- **Database**: Production PostgreSQL with connection pooling
- **Environment**: NODE_ENV=production with optimized settings

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit application identifier
- `ISSUER_URL`: OpenID Connect issuer URL

### File Structure
```
├── client/          # Frontend React application
├── server/          # Backend Express application
├── shared/          # Shared types and schemas
├── attached_assets/ # Static assets and images
├── migrations/      # Database migration files
└── dist/           # Production build output
```

## Changelog

Changelog:
- July 06, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.