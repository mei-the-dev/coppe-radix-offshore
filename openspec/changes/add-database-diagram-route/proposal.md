# Change: Interactive Database Diagram & Data Explorer Routes

## Why
Stakeholders need a visual way to inspect the PRIO logistics database schema and a data-rich view that surfaces the actual fleet/platform/catalog data already mocked in the API. Today `/data` only shows textual schema tables, and there is no route that renders the DOT diagram or correlates live data.

## What Changes
- Add backend endpoints to serve the DOT diagram (or derived JSON) plus aggregated data for vessels, platforms, cargo, and installations.
- Introduce a `/diagram` route with a zoomable, pannable diagram rendered from `references/prio_database_diagram_detailed_minimal.dot`, including node selection details.
- Redesign `/data` into a "Data Explorer" showing populated entities (vessels, platforms, cargo catalog, demands) with filters and real data chips.
- Document the new capability and update navigation/specs so diagram + data explorer become first-class parts of the application.

## Impact
- Affected specs: new capability under `data-visualization`.
- Affected code: backend Express routes (`backend/src/routes/*`), mock data services, React router config (`frontend/src/routes`), new React organisms/pages, UI assets, and documentation (`FRONTEND_SPECIFICATION.md`, README excerpts).
- New dependencies: likely `@hpcc-js/wasm` or `d3-graphviz` for client-side DOT rendering (to be finalized in design.md).
