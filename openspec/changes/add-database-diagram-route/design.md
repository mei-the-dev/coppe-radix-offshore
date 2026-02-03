## Context
We need to provide a graphical database diagram (rendered from `references/prio_database_diagram_detailed_minimal.dot`) and a populated data explorer. Both experiences should live inside the existing React SPA, share the navigation shell, and consume backend APIs instead of bundling large static blobs into the frontend bundle. The backend still uses mock data, so the explorer can aggregate in-memory structures before we wire in Postgres.

## Goals / Non-Goals
- **Goals**
  - Serve the DOT/string payload (or JSON conversion) from the backend so the frontend can fetch and render it lazily.
  - Provide aggregated data endpoints that surface vessels, installations, cargo, and demands in a single payload for the explorer.
  - Render `/diagram` with zoom/pan, node selection, and metadata panel while keeping bundle size manageable via dynamic imports.
  - Redesign `/data` into a populated explorer with filters, cards, and tables fed by React Query.
- **Non-Goals**
  - Implement real database persistence (mock data remains the source).
  - Build a full ER editor or allow diagram editing.
  - Replace the metrics route or other visualization pages.

## Decisions
1. **Diagram rendering**: Use `@hpcc-js/wasm` + `d3-graphviz` via a lazy-loaded module (`frontend/src/lib/diagramRenderer.ts`) to convert DOT → SVG client-side. This avoids installing Graphviz binaries in Docker and keeps the backend simple.
2. **Schema endpoint**: Add `GET /schema/diagram` that simply streams the DOT file contents with caching headers. This allows future backend-side conversions without changing the frontend contract.
3. **Data overview endpoint**: Add `GET /analytics/data-overview` returning `{ vessels: [...], installations: [...], cargo: [...], demands: [...] }` aggregated from `mockData`. The frontend can memoize slices instead of fan-out requests.
4. **Routing**: Add `DiagramRoute` + `DataExplorerRoute` with lazy imports. Update nav labels and default redirect to `/diagram` so users land on the new visualization first.
5. **State management**: Use React Query hooks under `frontend/src/api/diagram.ts` and `frontend/src/api/dataOverview.ts`. No new global store unless filters need cross-component sync; start with local component state + URL params.

## Risks / Trade-offs
- **Bundle size**: `d3-graphviz` adds ~200kb. Mitigation: lazy-load the diagram renderer and show a skeleton while loading.
- **DOT parsing errors**: If the DOT file changes, the frontend might break. Mitigation: add backend validation (CI step) ensuring DOT parse success using `@hpcc-js/wasm` in a small Node script.
- **Mock vs real data**: Aggregated endpoint currently mock-based; once Postgres lands, we must swap to DB queries. Mitigation: isolate logic in `services/dataOverviewService.ts` so future DB integration is localized.

## Migration Plan
1. Create new backend routes/services, expose them via Express, and update docs.
2. Implement frontend API clients + hooks, integrate with new `/diagram` & `/data` routes.
3. Replace old DataStructure component references, keeping legacy UI accessible behind a feature flag if needed.
4. Write tests and update docs.

## Open Questions
- Should `/data` still expose the textual schema tables (maybe as a collapsible section) or fully move to the new explorer? (Default: replace, but preserve component for reuse.)
- Do we need server-side caching/ETag for the DOT endpoint? (Default: weak ETag based on file hash.)
