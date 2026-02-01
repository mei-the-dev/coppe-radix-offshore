Kanban UX Builder — Local setup & notes

What I implemented
- Kanban board UI (drag & drop) using Atomic Design components.
- Glassmorphism dark theme applied by default for the planning/kanban view.
- HTML5 drag-and-drop (desktop) integrated with the existing API client and React Query mutations for optimistic updates.
- New route: /planning ("Planning" in the top navigation)

Files added
- src/components/molecules/KanbanColumn/KanbanColumn.tsx
- src/components/molecules/KanbanColumn/KanbanColumn.css
- src/components/organisms/KanbanBoard/KanbanBoard.tsx
- src/components/organisms/KanbanBoard/KanbanBoard.css

Files changed
- src/components/molecules/KanbanCard/KanbanCard.tsx (Card variant -> glass)
- src/components/molecules/index.ts (export KanbanColumn)
- src/components/organisms/index.ts (export KanbanBoard)
- src/routes/index.tsx (planning route enabled)
- src/routes/PlanningRoute.tsx (now renders the Kanban board)
- src/routes/routeConfig.ts (nav item added)
- src/contexts/ThemeContext.tsx (default theme -> dark)

How drag & drop works
- Each Kanban card is draggable (HTML5 drag/drop). Drag a card between columns to change its status.
- On drop, the app calls the existing useUpdateLoadingPlan() mutation, which patches the backend (PATCH /orders/:id/status) via the API client.
- Updates are optimistic (React Query) and also update the local Zustand store; network failures revert the change.

Notes & caveats
- The implementation uses native HTML5 DnD for simplicity. For better touch/mobile support and smoother animations, consider switching to dnd-kit or react-beautiful-dnd.
- You must be authenticated to call the API (use the Login page or set localStorage key 'prio_auth_token').
- Theme default is set to dark for the Kanban UX. Users can change theme via ThemeProvider (localStorage overrides preserved).

Run locally (quick)
1. cd frontend
2. npm install
3. Copy .env.example -> .env or set env var: VITE_API_URL (optional, otherwise uses same-origin path)
4. npm run dev
5. Open the app and login, then navigate to the "Planning" tab to see the Kanban board.

Build/preview
- npm run build
- npm run preview

Tests
- npm run test (unit)
- npm run test:visual (playwright)

Next recommended improvements
- Add keyboard-accessible move controls and a small action menu for each card.
- Add reorder support inside columns (drag position) using a proper DnD library.
- Add card detail modal with edit/delete and create-new directly from the Kanban board.
- Add E2E tests for drag-and-drop and API failure paths.

If you want me to continue (add reordering, touch support, animations, or card details), tell me which feature to prioritize and I'll implement it.
