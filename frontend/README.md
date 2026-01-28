# Porto do Açu Loading Dashboard - Frontend

React + TypeScript frontend for the PRIO Loading Dashboard (Porto do Açu).

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` (Vite default port)

Make sure the backend API is running on `http://localhost:3001` or set `VITE_API_URL` environment variable.

## Features

- **Vessel Fleet View**: Display all vessels with status and capacity
- **Berth Status**: Show berth availability and specifications
- **Loading Plan Timeline**: View scheduled loading operations
- **Create Loading Plan**: Form to create new loading plans with cargo assignment
- **Cargo Validation**: Real-time validation of cargo compatibility

## Project Structure

```
src/
  ├── api/          # API client
  ├── components/   # React components
  ├── types/        # TypeScript types
  └── App.tsx       # Main app component
```
