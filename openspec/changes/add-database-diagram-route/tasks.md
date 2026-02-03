## 1. Backend
- [ ] 1.1 Add schema-serving endpoint (DOT or JSON) under `/schema/diagram`.
- [ ] 1.2 Add aggregated data endpoint (vessels, installations, cargo catalog, demands) for the Data Explorer.
- [ ] 1.3 Unit-test new routes/services with Supertest/mocks.

## 2. Frontend
- [ ] 2.1 Update router/nav: add `/diagram`, repurpose `/data` to Data Explorer, adjust default redirect if needed.
- [ ] 2.2 Create diagram renderer hook/component (Graphviz integration, zoom/pan, node inspector).
- [ ] 2.3 Build Data Explorer panels (cards, tables, filters) wired to new API calls.
- [ ] 2.4 Add tests (React Testing Library + Playwright smoke) for both routes.

## 3. Documentation
- [ ] 3.1 Update `FRONTEND_SPECIFICATION.md`, `README.md`, and any deployment docs with the new routes/commands.
- [ ] 3.2 Document API endpoints and diagram ingestion flow in `backend/API_IMPLEMENTATION.md` (or relevant doc).
- [ ] 3.3 Capture release notes in `openspec/changes/.../specs` delta (requirements + scenarios) and ensure validation.
