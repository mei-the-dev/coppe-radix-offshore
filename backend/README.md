# Porto do Açu Loading Dashboard - Backend API

Backend API server for the PRIO Loading Dashboard (Porto do Açu).

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Server runs on `http://localhost:3001`

## API Endpoints

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

## Mock Data

All data is currently mocked based on `references/inventory.md`:
- 5 vessels (Standard PSV, Large PSV, CSV)
- 3 berths at Porto do Açu
- Complete cargo catalog (liquid bulk, dry bulk, deck cargo)
- Cargo compatibility matrix
- 8 installation destinations
