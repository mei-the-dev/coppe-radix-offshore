# Frontend-Backend Integration

## ✅ Integration Complete

The frontend has been successfully wired to the PRIO API backend.

## What Was Done

### 1. API Client Updates (`frontend/src/api/client.ts`)
- ✅ Updated to use new PRIO API endpoints
- ✅ Added JWT authentication support
- ✅ Token storage in localStorage
- ✅ Automatic token injection in requests
- ✅ Backward compatibility with existing components
- ✅ New `prioAPI` object with all PRIO endpoints

### 2. Authentication System
- ✅ Created `AuthContext` for global auth state
- ✅ Login/logout functionality
- ✅ Token persistence across page refreshes
- ✅ Automatic token refresh handling

### 3. App Integration
- ✅ Wrapped app with `AuthProvider`
- ✅ Added login form for unauthenticated users
- ✅ Protected routes require authentication
- ✅ Logout functionality
- ✅ Error handling for auth failures

### 4. API Endpoints Mapped

#### Legacy Endpoints (for backward compatibility)
- `api.getVessels()` → `/fleet/vessels`
- `api.getBerths()` → `/installations` (mapped)
- `api.getCargoCatalog()` → `/cargo/types`
- `api.getLoadingPlans()` → `/orders`

#### New PRIO API Endpoints
- `prioAPI.installations.*` - Network management
- `prioAPI.vessels.*` - Fleet management
- `prioAPI.cargoTypes.*` - Cargo catalog
- `prioAPI.demands.*` - Demand management
- `prioAPI.orders.*` - Order management
- `prioAPI.trips.*` - Trip operations
- `prioAPI.weather.*` - Weather data
- `prioAPI.analytics.*` - Analytics & KPIs

## Configuration

### Environment Variables
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
```

### Backend Configuration
Ensure `backend/.env` has:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=prio_logistics
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
PORT=3001
```

## Usage

### Starting the Application

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application:**
   - Frontend: http://localhost:5173 (or Vite default port)
   - Backend API: http://localhost:3001

### Authentication

1. **Login:**
   - Username: `operator@prio.com`
   - Password: Any password (demo mode)
   - Token is stored in localStorage

2. **Using API in Components:**
   ```typescript
   import { api, prioAPI } from './api/client';
   import { useAuth } from './contexts/AuthContext';

   function MyComponent() {
     const { isAuthenticated } = useAuth();

     useEffect(() => {
       if (isAuthenticated) {
         // Use legacy API
         api.getVessels().then(setVessels);

         // Or use new PRIO API
         prioAPI.vessels.list().then(({ data }) => setVessels(data));
       }
     }, [isAuthenticated]);
   }
   ```

## API Response Formats

### Legacy API (for compatibility)
Returns arrays directly:
```typescript
const vessels = await api.getVessels(); // Vessel[]
```

### PRIO API
Returns wrapped responses:
```typescript
const response = await prioAPI.vessels.list();
// { data: Vessel[], meta: { total, available, in_use, maintenance } }
```

## Error Handling

The API client automatically:
- Handles 401 (Unauthorized) by clearing token and redirecting to login
- Formats error messages from API responses
- Logs errors to console for debugging

## Testing

### Test Backend Connection
```bash
curl http://localhost:3001/health
```

### Test Authentication
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"operator@prio.com","password":"test"}'
```

### Test Protected Endpoint
```bash
TOKEN="your_token_here"
curl http://localhost:3001/fleet/vessels \
  -H "Authorization: Bearer $TOKEN"
```

## Next Steps

1. **Add Real User Management:**
   - Implement proper user database
   - Add password hashing
   - Add user roles and permissions

2. **Enhance Error Handling:**
   - Add retry logic
   - Add offline detection
   - Add better error messages

3. **Add Loading States:**
   - Show loading indicators during API calls
   - Add skeleton screens

4. **Add Data Refresh:**
   - Implement polling for real-time data
   - Add WebSocket support for live updates

5. **Optimize API Calls:**
   - Add request caching
   - Implement pagination
   - Add infinite scroll where needed

## Troubleshooting

### Frontend can't connect to backend
- Check backend is running: `curl http://localhost:3001/health`
- Verify `VITE_API_URL` in `frontend/.env`
- Check CORS settings in backend

### Authentication fails
- Check backend JWT_SECRET is set
- Verify login endpoint: `curl -X POST http://localhost:3001/auth/login ...`
- Check browser console for errors

### API returns 401
- Token may have expired (1 hour default)
- Logout and login again
- Check token in localStorage: `localStorage.getItem('auth_token')`

### CORS errors
- Backend should have CORS enabled (already configured)
- Check backend `index.ts` has `app.use(cors())`
