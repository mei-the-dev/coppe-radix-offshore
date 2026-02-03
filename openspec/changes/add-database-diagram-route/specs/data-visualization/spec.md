## ADDED Requirements
### Requirement: Interactive Database Diagram
The system SHALL expose a `/diagram` route that renders the `prio_database_diagram_detailed_minimal.dot` schema as an interactive, zoomable diagram backed by a backend endpoint delivering the DOT (or derived) payload.

#### Scenario: Diagram loads successfully
- **WHEN** an authenticated user navigates to `/diagram`
- **THEN** the frontend SHALL fetch the schema payload from the API and render nodes/edges with zoom, pan, and tooltips for each table.

#### Scenario: Table focus reveals metadata
- **WHEN** the user selects a table node
- **THEN** the UI SHALL display its columns, keys, and relationships in a side panel without reloading the page.

### Requirement: Data Explorer Route
The system SHALL expose a `/data` route that lists populated logistics data (vessels, installations, cargo catalog, demands) using live API responses, including filters and loading/error states.

#### Scenario: Aggregated data loads
- **WHEN** the user opens `/data`
- **THEN** the frontend SHALL call a single data-overview API and render cards/tables for each domain (fleet, network, cargo, operations).

#### Scenario: Filtering updates panels
- **WHEN** the user applies a filter (e.g., vessel class, installation type)
- **THEN** the visible cards/tables SHALL update immediately without refetching unnecessary data, keeping pagination/sorting state consistent.
