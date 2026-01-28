# Change: Add Beautiful Dashboard UX for Planning PSV Loading at Macaé Port

**Note:** The supply base was later corrected to **Porto do Açu** (São João da Barra, RJ); the app uses Porto do Açu as the hub.

## Why
PRIO logistics planners need an intuitive, visual dashboard to efficiently plan and schedule Platform Supply Vessel (PSV) loading operations at the supply base (Porto do Açu). Currently, planning loading operations requires manual coordination across multiple systems and spreadsheets, leading to:
- Inefficient berth utilization and vessel turnaround times
- Difficulty visualizing cargo compatibility and loading sequences
- Limited visibility into real-time port operations and vessel status
- Challenges optimizing multi-vessel loading schedules

A beautiful, user-friendly dashboard will enable planners to:
- Visually plan loading operations with drag-and-drop scheduling
- Monitor real-time vessel positions and loading progress
- Optimize cargo allocation across vessels considering compatibility constraints
- Reduce planning time and improve operational efficiency

## What Changes
- Add new `loading-planning` capability for Macaé port loading operations
- Create beautiful, modern dashboard UI with:
  - Interactive timeline view for vessel scheduling
  - Visual cargo planning interface with drag-and-drop
  - Real-time vessel status and berth availability
  - Cargo compatibility visualization and warnings
  - Loading sequence optimization suggestions
  - Weather and operational constraint indicators
- Integrate with vessel tracking and port systems
- Support multiple vessel types (Standard PSV, Large PSV, CSV)
- Handle all cargo categories (liquid bulk, dry bulk, deck cargo)

## Impact
- Affected specs: `loading-planning` (new capability)
- Affected code: New frontend dashboard components, backend API endpoints for loading planning
- Dependencies:
  - Vessel tracking system integration (Phase 3 - initially using mock data)
  - Port berth management system (Phase 3 - initially using mock data)
  - Cargo inventory/ordering system (Phase 3 - initially using mock data)
  - Weather forecast service (optional for initial version)
- Mock Data: Initial development will use mock data based on estimates from `references/inventory.md`
