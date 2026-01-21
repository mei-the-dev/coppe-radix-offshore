# Architecture Documentation

## System Overview

The COPPE-RADIX Offshore Logistics Application is a full-stack web application designed to manage maritime logistics operations, particularly focused on Platform Supply Vessel (PSV) loading operations at Macaé port.

## Architecture Pattern

The application follows a **client-server architecture** with clear separation between frontend and backend:

- **Frontend**: React-based single-page application (SPA)
- **Backend**: RESTful API server with Express.js
- **Database**: PostgreSQL with PostGIS for geospatial data

## Frontend Architecture

### Design System
- **Atomic Design Principles**: Components organized as atoms, molecules, organisms, and templates
- **Design Tokens**: Centralized design system in `frontend/src/design-system/`
- **CSS Variables**: Theme-aware styling using CSS custom properties
- **Component Library**: Reusable component library following design system guidelines

### State Management
- **Zustand**: Lightweight state management for global application state
- **React Query**: Server state management with caching and synchronization
- **Local State**: React hooks for component-level state

### Key Features
- **Routing**: React Router v7 for navigation
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion for smooth transitions
- **Virtual Scrolling**: TanStack Virtual for performance optimization

### Component Structure
```
components/
├── atoms/        # Basic building blocks (Button, Input, etc.)
├── molecules/    # Simple component combinations
├── organisms/    # Complex feature components
├── templates/    # Page layout templates
├── action/       # Interactive components
├── display/      # Display-only components
├── feedback/     # User feedback components
├── layout/       # Layout components
└── navigation/   # Navigation components
```

## Backend Architecture

### API Structure
- **RESTful Design**: Standard HTTP methods and status codes
- **Route-based Organization**: Routes organized by domain
- **Middleware Pattern**: Express middleware for cross-cutting concerns

### Core Components
- **Routes**: API endpoint handlers (`src/routes/`)
- **Services**: Business logic layer (`src/services/`)
- **Middleware**: Authentication, error handling, etc. (`src/middleware/`)
- **Database**: Connection and migration management (`src/db/`)

### Domain Areas
1. **Fleet Management**: Vessels, compartments, schedules
2. **Port Operations**: Berths, loading operations
3. **Cargo Management**: Cargo types, compatibility rules, inventory
4. **Operations**: Trips, waypoints, manifests
5. **Analytics**: Reporting and KPI tracking
6. **Optimization**: Route and schedule optimization

### Authentication & Security
- **JWT-based Authentication**: Stateless authentication tokens
- **Middleware Protection**: Protected routes via authentication middleware
- **CORS Configuration**: Configured for frontend-backend communication

## Database Architecture

### PostgreSQL with PostGIS
- **PostGIS Extension**: Geospatial data support for locations and distances
- **Relational Model**: Normalized database schema
- **Migration System**: Version-controlled database migrations

### Key Tables
- `vessels`: Vessel specifications and status
- `berths`: Port berth information
- `cargo_types`: Cargo type definitions
- `loading_plans`: Loading operation plans
- `installations`: Offshore platform destinations
- `distance_matrix`: Pre-calculated distances between locations

See `backend/DATABASE_SETUP.md` for detailed schema information.

## Data Flow

### Request Flow
1. User interaction in React frontend
2. API call via `api/client.ts`
3. Express route handler receives request
4. Middleware processes (auth, validation)
5. Service layer handles business logic
6. Database query/update
7. Response returned to frontend
8. React Query updates cache and UI

### Real-time Updates (Planned)
- **Server-Sent Events (SSE)**: For vessel status updates
- **WebSocket**: For collaborative features (future)

## Development Workflow

### OpenSpec Methodology
- **Spec-Driven Development**: Changes start with proposals in `openspec/changes/`
- **Documentation First**: Architecture decisions documented before implementation
- **Change Management**: Structured approach to feature development

### Code Organization
- **TypeScript**: Type safety across the stack
- **Modular Structure**: Clear separation of concerns
- **Reusable Components**: DRY principles in component design

## Deployment Considerations

### Frontend
- Static build output (`dist/`)
- Can be served via CDN or static hosting
- Environment variables for API configuration

### Backend
- Node.js runtime
- PostgreSQL database required
- Environment variables for configuration
- Consider containerization (Docker)

### Environment Configuration
- Development: Local PostgreSQL, mock data support
- Production: Production database, real data integration

## Performance Considerations

### Frontend
- Code splitting via Vite
- Virtual scrolling for large lists
- React Query caching reduces API calls
- Lazy loading of routes

### Backend
- Connection pooling for database
- Efficient queries with proper indexing
- Caching strategies for static data (future)

## Security Considerations

- **Authentication**: JWT tokens for stateless auth
- **Authorization**: Role-based access control (future)
- **Input Validation**: Zod schemas for validation
- **SQL Injection Prevention**: Parameterized queries
- **CORS**: Configured for allowed origins
- **Environment Variables**: Sensitive data in .env files

## Future Architecture Considerations

- **Microservices**: Potential split by domain (fleet, cargo, operations)
- **Real-time Infrastructure**: WebSocket server or message queue
- **Caching Layer**: Redis for frequently accessed data
- **Search**: Elasticsearch for complex search requirements
- **File Storage**: S3 or similar for documents and reports
