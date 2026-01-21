# Design: Macaé Loading Dashboard

## Context
This dashboard will be the primary interface for PRIO logistics planners to schedule and monitor Platform Supply Vessel (PSV) loading operations at the Port of Macaé. The system needs to integrate with existing vessel tracking, port management, and cargo ordering systems while providing a beautiful, intuitive user experience.

**Key Stakeholders:**
- Logistics planners (primary users)
- Port operations staff
- Vessel operations coordinators
- Management (monitoring and reporting)

**Constraints:**
- Must integrate with existing PRIO systems (vessel tracking, cargo ordering)
- Real-time updates required for vessel status
- Must handle multiple vessel types with different capacity constraints
- Must validate complex cargo compatibility rules
- 24/7 operations require high availability

## Goals / Non-Goals

### Goals
- Provide intuitive visual interface for loading planning
- Enable efficient berth and vessel scheduling
- Real-time visibility into vessel status and port operations
- Automatic validation of cargo compatibility and capacity constraints
- Support for all PRIO vessel types and cargo categories
- Beautiful, modern UX that reduces planning time

### Non-Goals
- Full vessel routing optimization (out of scope for loading step)
- Offshore platform operations planning (focus only on Macaé port loading)
- Financial cost calculations (may be added later)
- Weather forecast integration (optional for initial version)
- Mobile app (responsive web only)

## Decisions

### Decision: Frontend Technology Stack
**What:** Choose React with TypeScript for the dashboard frontend
**Why:**
- Modern, component-based architecture suitable for complex interactive UIs
- Strong ecosystem for drag-and-drop, timeline, and data visualization libraries
- TypeScript provides type safety for complex cargo and vessel data models
- Good performance for real-time updates
- Easy integration with WebSocket/SSE for live data

**Alternatives considered:**
- Vue.js: Similar capabilities but smaller ecosystem for specialized components
- Angular: More opinionated, heavier framework
- Vanilla JS: Too much boilerplate for complex interactive dashboard

### Decision: Backend API Architecture
**What:** RESTful API with WebSocket/SSE for real-time updates
**Why:**
- REST provides clear, stateless interface for CRUD operations
- WebSocket/SSE enables real-time vessel status updates without polling
- Standard pattern that integrates well with existing systems
- Easy to document and test

**Alternatives considered:**
- GraphQL: More complex for this use case, overkill for dashboard needs
- gRPC: Better for inter-service communication but less suitable for web frontend

### Decision: Real-Time Updates Strategy
**What:** Server-Sent Events (SSE) for vessel status, WebSocket for interactive features
**Why:**
- SSE simpler for one-way real-time data (vessel positions, status)
- WebSocket for bidirectional communication if needed for collaborative planning
- Lower overhead than constant polling
- Graceful degradation if connection lost

**Alternatives considered:**
- Polling: Higher server load, less responsive
- Full WebSocket: More complex, unnecessary for mostly one-way updates

### Decision: Data Model for Loading Plans
**What:** Separate entities for LoadingPlan, Vessel, Cargo, Berth, with relationships
**Why:**
- Clear separation of concerns
- Flexible to add new vessel types and cargo categories
- Supports complex cargo compatibility rules
- Easy to query and filter

**Key Entities:**
- `LoadingPlan`: Container for a scheduled loading operation
- `Vessel`: Vessel information with type-specific capacity constraints
- `CargoItem`: Individual cargo assignment with type, quantity, destination
- `Berth`: Port berth with specifications and availability
- `CargoCompatibilityRule`: Rules for cargo segregation

**Alternatives considered:**
- Monolithic plan structure: Less flexible, harder to validate
- Event sourcing: Overkill for planning operations

### Decision: Cargo Compatibility Validation
**What:** Rule-based validation engine with pre-defined compatibility matrix
**Why:**
- Based on PRIO operational data (tank cleaning times, segregation requirements)
- Fast validation for real-time UI feedback
- Easy to maintain and update rules
- Clear error messages for planners

**Compatibility Matrix Source:**
- From PRIO logistics data model document
- Examples: Diesel → Water requires 4h cleaning, Oil-based Mud → Water-based Mud requires 6h cleaning

**Alternatives considered:**
- Machine learning: Not enough data, rules are well-defined
- External service: Adds complexity, rules are domain-specific

### Decision: Timeline Visualization Library
**What:** Use a specialized timeline library (e.g., vis-timeline, dhtmlx-gantt, or custom)
**Why:**
- Complex interactive timeline requires specialized components
- Drag-and-drop scheduling needs smooth UX
- Library handles edge cases (overlaps, zooming, scrolling)

**Alternatives considered:**
- Custom timeline: Too much development effort
- Simple calendar view: Not sufficient for detailed scheduling

### Decision: State Management
**What:** React Context + useReducer for global state, local state for component-specific data
**Why:**
- Context provides shared state (vessels, plans, berths) without prop drilling
- useReducer handles complex state updates (plan modifications, validations)
- Local state for UI-only concerns (filters, view preferences)
- Simpler than Redux for this scope

**Alternatives considered:**
- Redux: More boilerplate, overkill for dashboard scope
- Zustand: Lighter alternative, but Context sufficient
- Local state only: Would require excessive prop drilling

## Risks / Trade-offs

### Risk: Integration Complexity
**Mitigation:**
- Start with comprehensive mock data based on `references/inventory.md` estimates
- Mock data will include realistic vessel fleet, cargo types, berth specifications, and operational parameters
- Define clear API contracts early
- Phased integration (vessel tracking first, then port systems)
- Fallback to manual data entry if integrations fail

### Risk: Performance with Large Datasets
**Mitigation:**
- Virtualize timeline and lists for many vessels/plans
- Paginate or filter cargo lists
- Lazy load detailed cargo information
- Optimize re-renders with React.memo and useMemo

### Risk: Real-Time Update Reliability
**Mitigation:**
- Implement reconnection logic for SSE/WebSocket
- Cache last known state
- Show connection status indicator
- Fallback to polling if real-time fails

### Risk: Cargo Compatibility Rule Complexity
**Mitigation:**
- Start with core compatibility rules from PRIO data model
- Make rules configurable (database-driven)
- Clear error messages explaining conflicts
- Allow override with planner confirmation for edge cases

### Trade-off: Feature Completeness vs. Time to Market
**Decision:** Start with core features (scheduling, cargo assignment, basic validation), add advanced features (optimization suggestions, weather integration) in iterations

## Migration Plan

### Phase 1: Core Dashboard (MVP)
- Basic timeline view
- Vessel and berth display (using mock data from inventory.md)
- Simple cargo assignment
- Basic compatibility validation
- Mock data service with realistic PRIO operational data

### Phase 2: Enhanced Features
- Drag-and-drop interface
- Real-time vessel status
- Loading sequence optimization
- Advanced filtering and search

### Phase 3: Integration
- Connect to vessel tracking system
- Integrate port berth management
- Connect cargo ordering system

### Phase 4: Polish and Optimization
- Performance optimization
- Advanced UX features
- Accessibility improvements
- User training and documentation

**Rollback Plan:**
- Feature flags for new functionality
- Keep existing planning tools as backup
- Gradual rollout to user groups

## Mock Data Strategy

### Data Source
All initial mock data will be based on estimates and specifications from `references/inventory.md`, which contains comprehensive PRIO logistics operational data including:
- Vessel fleet characteristics (Standard PSV, Large PSV, CSV specifications)
- Cargo types and requirements (liquid bulk, dry bulk, deck cargo)
- Port of Macaé specifications and operational parameters
- Cargo compatibility matrix and tank cleaning times
- Demand profiles by installation
- Operational time windows and constraints

### Mock Data Structure
**Vessels:**
- Standard PSV (UT 755): 2,450 t deck, 2,500 m³ liquid capacity
- Large PSV (UT 874): 3,200 t deck, 3,500 m³ liquid capacity
- CSV: 3,500-4,500 t deck capacity
- Based on sections 2.1-2.2 of inventory.md

**Cargo Types:**
- Liquid: Diesel (850 kg/m³), Water (1,000 kg/m³), Drilling Mud (1,200-1,400 kg/m³), etc.
- Dry Bulk: Cement (1,500 kg/m³), Barite (2,500-4,200 kg/m³), Bentonite (600-800 kg/m³)
- Deck: Drill pipes, containers, equipment (various weights)
- Based on section 3.1 of inventory.md

**Berths:**
- Macaé port specifications: 7.9m max draught, 97m max length, 5,513 t max deadweight
- Multiple berths with 24/7 operations
- Based on section 1.1 of inventory.md

**Compatibility Rules:**
- Tank cleaning times: Diesel→Water (4h), OBM→WBM (6h), Methanol→Any (8h)
- Based on section 3.3 of inventory.md

**Operational Times:**
- Loading times: Liquid (2-4h), Dry bulk (1-3h), Deck cargo (3-6h)
- Total turnaround: 6-12 hours (average 8 hours)
- Based on section 1.1 of inventory.md

## Open Questions

1. **Authentication/Authorization:** How do we integrate with PRIO's existing auth system?
2. **Data Persistence:** Where should loading plans be stored? Existing database or new?
3. **Collaborative Planning:** Do multiple planners need to work on the same plan simultaneously?
4. **Audit Trail:** What level of change tracking is required for loading plans?
5. **Mobile Support:** Is responsive web sufficient, or do planners need native mobile apps?
6. **Offline Capability:** Do planners need to work offline, or is online-only acceptable?
7. **Reporting:** What reports/analytics are needed from loading planning data?
8. **Integration Priority:** Which external system integration is most critical first?
9. **Mock Data Refresh:** How often should mock data be updated to reflect operational changes?
