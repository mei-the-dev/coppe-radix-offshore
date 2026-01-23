# COPPE-RADIX Offshore Logistics Application

A comprehensive system for managing logistics operations in offshore environments, including vessel tracking, cargo management, supply chain coordination, and operational planning for maritime and offshore industry operations.

## Overview

This application provides a complete solution for offshore logistics management, with a focus on:
- **Vessel Fleet Management**: Track and manage Platform Supply Vessels (PSV), Construction Support Vessels (CSV), and other maritime assets
- **Cargo Management**: Handle liquid bulk, dry bulk, and deck cargo with compatibility validation
- **Port Operations**: Manage berth scheduling and loading operations at Macaé port
- **Loading Plan Creation**: Create and validate loading plans with real-time cargo compatibility checks
- **Supply Chain Coordination**: Coordinate materials, equipment, and personnel to offshore installations

## Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v7
- **UI/Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **Testing**: Vitest, Playwright
- **Design System**: Custom Kira Design System with atomic design principles

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with PostGIS extension
- **Authentication**: JWT (JSON Web Tokens)
- **API**: RESTful API

### Development Tools
- **OpenSpec**: Spec-driven development methodology
- **ESLint**: Code linting
- **TypeScript**: Type safety across the stack

## Project Structure

```
├── backend/          # Node.js + TypeScript API server
│   ├── src/
│   │   ├── routes/   # API route handlers
│   │   ├── services/ # Business logic services
│   │   ├── db/       # Database connection and migrations
│   │   ├── middleware/ # Express middleware (auth, etc.)
│   │   └── types/    # TypeScript type definitions
│   └── package.json
├── frontend/         # React + TypeScript dashboard
│   ├── src/
│   │   ├── components/ # React components (atomic design)
│   │   ├── routes/     # Route components
│   │   ├── stores/     # Zustand state stores
│   │   ├── api/        # API client
│   │   ├── hooks/      # Custom React hooks
│   │   ├── design-system/ # Design tokens and system
│   │   └── utils/      # Utility functions
│   └── package.json
├── openspec/         # OpenSpec change proposals and specs
│   ├── changes/      # Change proposals
│   └── project.md    # Project context and conventions
└── references/       # PRIO logistics operational data
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ with PostGIS extension (for production)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd coppe-radix-offshore
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Development

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
```
Backend API runs on `http://localhost:3001`

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

The frontend will automatically connect to the backend API. Make sure both servers are running for full functionality.

### Environment Variables

Create `.env` files in `backend/` and `frontend/` directories as needed:

**backend/.env**:
```
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/offshore_logistics
JWT_SECRET=your-secret-key
```

**frontend/.env**:
```
VITE_API_URL=http://localhost:3001
```

## Features

### Core Functionality
- ✅ **Vessel Fleet Management**: Track vessel fleet with status, capacity, and specifications
- ✅ **Berth Scheduling**: Manage berth availability and scheduling at Macaé port
- ✅ **Loading Plan Creation**: Create and manage loading plans with cargo assignment
- ✅ **Cargo Compatibility Validation**: Automatic validation of cargo compatibility rules and segregation requirements
- ✅ **Cargo Catalog**: Comprehensive cargo catalog with liquid bulk, dry bulk, and deck cargo types
- ✅ **Installation Management**: Track offshore installation destinations
- ✅ **Mock Data Service**: Comprehensive mock data based on PRIO operational estimates

### Planned Features (Phase 2)
- 🔄 Real-time vessel status updates via WebSocket/SSE
- 🔄 Advanced timeline visualization for loading operations
- 🔄 Trip planning and optimization
- 🔄 Weather integration
- 🔄 Distance calculations between locations

### Future Enhancements (Phase 3)
- 🔄 Integration with real vessel tracking systems
- 🔄 Production database integration
- 🔄 Advanced analytics and reporting
- 🔄 Multi-user collaboration features

## API Documentation

### Authentication
- `POST /api/auth/login` - User authentication (JWT)

### Vessels
- `GET /api/vessels` - Get all vessels
- `GET /api/vessels/:id` - Get vessel by ID
- `PATCH /api/vessels/:id/status` - Update vessel status

### Berths
- `GET /api/berths` - Get all berths
- `GET /api/berths/:id` - Get berth by ID
- `GET /api/berths/available` - Get available berths
- `PATCH /api/berths/:id/status` - Update berth status

### Cargo
- `GET /api/cargo/catalog` - Get cargo catalog
- `GET /api/cargo/installations` - Get installation destinations
- `POST /api/cargo/validate` - Validate cargo compatibility

### Loading Plans
- `GET /api/loading-plans` - Get all loading plans
- `GET /api/loading-plans/:id` - Get loading plan by ID
- `POST /api/loading-plans` - Create new loading plan
- `PATCH /api/loading-plans/:id` - Update loading plan
- `DELETE /api/loading-plans/:id` - Delete loading plan

For detailed API documentation, see `backend/README.md` and `backend/API_IMPLEMENTATION.md`.

## Mock Data

All data is currently mocked based on PRIO operational estimates from `references/inventory.md`:
- 5 vessels (Standard PSV, Large PSV, CSV)
- 3 berths at Macaé port
- Complete cargo catalog (liquid bulk, dry bulk, deck cargo)
- Cargo compatibility matrix with tank cleaning times
- 8 installation destinations

## Development Status

✅ Backend API with mock data
✅ Frontend dashboard UI
✅ Loading plan creation
✅ Cargo compatibility validation
🔄 Real-time updates (Phase 2)
🔄 Advanced timeline visualization (Phase 2)
🔄 Integration with real systems (Phase 3)

## Documentation

- **[Frontend Specification](./frontend/FRONTEND_SPECIFICATION.md)**: Complete frontend architecture and component documentation
- **[Backend API Implementation](./backend/API_IMPLEMENTATION.md)**: Backend API and database schema documentation
- **[Database Setup](./backend/DATABASE_SETUP.md)**: PostgreSQL and PostGIS setup instructions
- **[Development Rules](./DEVELOPMENT_RULES.md)**: Development guidelines and best practices
- **[OpenSpec](./openspec/AGENTS.md)**: Spec-driven development methodology

## Testing

### Frontend Tests
```bash
cd frontend
npm test              # Run unit tests
npm run test:ui       # Run tests with UI
npm run test:visual   # Run Playwright visual tests
npm run test:coverage # Generate coverage report
```

### Backend Tests
```bash
cd backend
npm test
```

## Building for Production

### Frontend
```bash
cd frontend
npm run build
```
Production build will be in `frontend/dist/`

### Backend
```bash
cd backend
npm run build
npm start
```
Production build will be in `backend/dist/`

## Deployment

This application is configured for deployment to DigitalOcean. See **[DIGITALOCEAN_DEPLOYMENT_GUIDE.md](./DIGITALOCEAN_DEPLOYMENT_GUIDE.md)** for complete step-by-step instructions.

### Quick Deploy Options

**Option 1: DigitalOcean App Platform (Recommended)**
- Uses `app.yaml` configuration in repository root
- Automatic builds and deployments from GitHub
- Managed PostgreSQL database with PostGIS
- **Quick Start**: See [DIGITALOCEAN_DEPLOYMENT_GUIDE.md](./DIGITALOCEAN_DEPLOYMENT_GUIDE.md)
- **Checklist**: Use [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) during deployment

**Option 2: Docker on Droplets**
- Use `docker-compose.yml` for containerized deployment
- Supports both managed and self-hosted databases
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for Docker deployment instructions

**Option 3: Kubernetes**
- Advanced deployment option for scaling
- Requires Kubernetes cluster setup
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for Kubernetes deployment

### Deployment Resources

- **[DIGITALOCEAN_DEPLOYMENT_GUIDE.md](./DIGITALOCEAN_DEPLOYMENT_GUIDE.md)**: Complete deployment guide with step-by-step instructions
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)**: Interactive checklist for tracking deployment progress
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: General deployment documentation and Docker/Kubernetes options
- **[DIGITALOCEAN_SETUP.md](./DIGITALOCEAN_SETUP.md)**: Troubleshooting guide for common setup issues
- **`scripts/`**: Helper scripts for JWT secret generation, PostGIS setup, and deployment verification

## Contributing

This project uses OpenSpec for spec-driven development. See `openspec/AGENTS.md` for information on creating change proposals and contributing to the project.

### Development Workflow
1. Create a change proposal in `openspec/changes/`
2. Get approval for the proposal
3. Implement the changes
4. Update documentation
5. Submit for review

## License

[Add your license here]

## Acknowledgments

- Built for PRIO Offshore Logistics Operations
- Designed for Macaé port loading operations
- Based on PRIO operational data from `references/inventory.md`
