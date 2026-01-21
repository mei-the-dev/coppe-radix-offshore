## ADDED Requirements

### Requirement: Mock Data Service
The system SHALL provide mock data for initial development and testing, based on estimates from `references/inventory.md`.

#### Scenario: System uses mock data
- **WHEN** the dashboard is in development or integration systems are unavailable
- **THEN** the system:
  - Provides realistic mock vessel fleet data (Standard PSV, Large PSV, CSV with specifications from inventory.md section 2)
  - Includes mock cargo catalog with all cargo types (liquid bulk, dry bulk, deck cargo from inventory.md section 3)
  - Displays mock berth data for Macaé port (specifications from inventory.md section 1.1)
  - Implements cargo compatibility rules based on inventory.md section 3.3
  - Uses operational time estimates from inventory.md (loading times, turnaround times)
  - Provides mock vessel status and position data for testing

### Requirement: Loading Plan Dashboard
The system SHALL provide a beautiful, interactive dashboard for planning and monitoring Platform Supply Vessel (PSV) loading operations at the Port of Macaé.

#### Scenario: Planner views loading schedule
- **WHEN** a logistics planner opens the loading planning dashboard
- **THEN** the dashboard displays:
  - A timeline view showing scheduled vessel loading operations
  - Current vessel positions and status (in port, in transit, at platform)
  - Available berths at Macaé port with their status
  - Weather conditions affecting operations (if available)
  - Upcoming loading operations sorted by scheduled time

#### Scenario: Planner creates new loading plan
- **WHEN** a planner selects a vessel and creates a new loading plan
- **THEN** the system:
  - Shows available berths and time slots
  - Displays vessel capacity constraints (deck cargo, liquid tanks, dry bulk)
  - Allows planner to assign cargo items via drag-and-drop interface
  - Validates cargo compatibility in real-time
  - Calculates estimated loading duration based on cargo types and volumes

### Requirement: Vessel Scheduling Timeline
The system SHALL provide an interactive timeline view for scheduling vessel loading operations at Macaé port.

#### Scenario: Timeline displays vessel schedule
- **WHEN** viewing the timeline
- **THEN** the timeline shows:
  - Vessels scheduled for loading with their time windows
  - Berth assignments for each vessel
  - Loading duration estimates
  - Buffer times between operations
  - Color coding for vessel types (Standard PSV, Large PSV, CSV)

#### Scenario: Planner reschedules vessel
- **WHEN** a planner drags a vessel to a different time slot on the timeline
- **THEN** the system:
  - Validates berth availability for the new time slot
  - Checks for conflicts with other scheduled operations
  - Updates estimated completion time
  - Shows warnings if the change affects downstream operations

### Requirement: Cargo Planning Interface
The system SHALL provide a visual interface for planning cargo allocation to vessels, considering compatibility and capacity constraints.

#### Scenario: Planner assigns liquid cargo
- **WHEN** a planner drags liquid cargo (e.g., diesel, water, drilling mud) to a vessel
- **THEN** the system:
  - Shows available tank capacity for the cargo type
  - Validates cargo compatibility with existing cargo in tanks
  - Displays tank cleaning requirements if cargo types are incompatible
  - Updates vessel capacity utilization indicators
  - Shows estimated loading time for the cargo type

#### Scenario: Planner assigns deck cargo
- **WHEN** a planner assigns deck cargo (e.g., drill pipes, containers, equipment) to a vessel
- **THEN** the system:
  - Validates deck cargo capacity (tonnes and deck area)
  - Checks stability constraints (center of gravity, maximum height)
  - Shows visual representation of deck layout
  - Warns if deck cargo exceeds weight distribution limits
  - Suggests optimal loading sequence for stability

#### Scenario: Planner assigns dry bulk cargo
- **WHEN** a planner assigns dry bulk cargo (e.g., cement, barite, bentonite) to a vessel
- **THEN** the system:
  - Validates dry bulk capacity
  - Checks pneumatic transfer system availability
  - Shows weather constraints for dry bulk operations
  - Displays estimated loading time

#### Scenario: Cargo compatibility validation
- **WHEN** a planner attempts to assign incompatible cargo types to the same vessel
- **THEN** the system:
  - Displays a clear warning message
  - Shows required tank cleaning time between incompatible cargoes
  - Suggests alternative vessel assignments
  - Highlights the compatibility conflict visually

### Requirement: Real-Time Vessel Status
The system SHALL display real-time status and position of vessels in the fleet.

#### Scenario: Vessel status updates
- **WHEN** viewing the dashboard
- **THEN** the system displays:
  - Current vessel position (at Macaé port, in transit, at platform)
  - Vessel status (loading, standby, in transit, maintenance)
  - Estimated time of arrival (ETA) for vessels en route to port
  - Current cargo on board
  - Vessel availability for next loading operation

#### Scenario: Vessel arrives at port
- **WHEN** a vessel arrives at Macaé port
- **THEN** the system:
  - Updates vessel status to "in port"
  - Shows available berths for the vessel
  - Displays assigned loading plan if one exists
  - Enables planner to start loading operations

### Requirement: Berth Management
The system SHALL manage berth availability and assignments at Macaé port.

#### Scenario: Berth availability display
- **WHEN** viewing berth information
- **THEN** the system shows:
  - Available berths with their specifications (maximum draught, vessel length, deadweight)
  - Current berth assignments and scheduled operations
  - Estimated berth availability times
  - Berth status (available, occupied, maintenance, reserved)

#### Scenario: Berth assignment
- **WHEN** a planner assigns a vessel to a berth
- **THEN** the system:
  - Validates vessel fits berth constraints (draught, length, deadweight)
  - Reserves the berth for the scheduled time window
  - Shows dock assignment time (30-60 minutes) in the schedule
  - Updates berth availability timeline

### Requirement: Loading Sequence Optimization
The system SHALL provide suggestions for optimal loading sequences based on cargo types and vessel stability requirements.

#### Scenario: Loading sequence suggestion
- **WHEN** a planner has assigned multiple cargo types to a vessel
- **THEN** the system:
  - Suggests optimal loading sequence (heavy items first, liquids for even keel, deck cargo distribution)
  - Shows estimated total loading time
  - Validates stability requirements (GM > 1.0 m, heel angle < 5 degrees)
  - Warns if loading sequence violates stability constraints

#### Scenario: Multi-cargo loading time calculation
- **WHEN** a planner assigns multiple cargo types
- **THEN** the system calculates:
  - Liquid cargo loading: 2-4 hours (based on volume and number of products)
  - Dry bulk loading: 1-3 hours
  - Deck cargo loading: 3-6 hours (based on complexity)
  - Total turnaround time: 6-12 hours (average 8 hours)
  - Tank cleaning time if required between incompatible cargoes

### Requirement: Visual Design and User Experience
The system SHALL provide a beautiful, modern, and intuitive user interface following best UX practices.

#### Scenario: Dashboard visual design
- **WHEN** viewing the dashboard
- **THEN** the interface:
  - Uses modern, clean design with appropriate color coding
  - Provides clear visual hierarchy and information organization
  - Supports responsive design for different screen sizes
  - Includes smooth animations and transitions
  - Displays loading states and progress indicators
  - Shows error messages clearly and helpfully

#### Scenario: Interactive elements
- **WHEN** interacting with dashboard elements
- **THEN** the system:
  - Provides immediate visual feedback for user actions
  - Supports drag-and-drop for intuitive cargo assignment
  - Enables keyboard shortcuts for power users
  - Shows tooltips and contextual help
  - Maintains state during user interactions

### Requirement: Vessel Type Support
The system SHALL support planning for different vessel types with their specific capacity constraints.

#### Scenario: Standard PSV planning
- **WHEN** planning for a Standard PSV (UT 755 type)
- **THEN** the system enforces:
  - Deck cargo capacity: 2,450 tonnes
  - Clear deck area: 900-1,000 m²
  - Liquid mud capacity: 2,500 m³
  - Dry bulk capacity: 600 m³
  - Fresh water capacity: 812 m³
  - Fuel oil capacity: 994 m³

#### Scenario: Large PSV planning
- **WHEN** planning for a Large PSV (UT 874 / PX 121 type)
- **THEN** the system enforces:
  - Deck cargo capacity: 2,800-3,200 tonnes
  - Clear deck area: 1,040-1,200 m²
  - Liquid mud capacity: 3,000-3,500 m³
  - Dry bulk capacity: 800-1,000 m³
  - Fresh water capacity: 1,000-1,500 m³
  - Diesel/fuel capacity: 1,200-1,500 m³

#### Scenario: CSV planning
- **WHEN** planning for a Construction Support Vessel (CSV)
- **THEN** the system enforces:
  - Deck cargo capacity: 3,500-4,500 tonnes
  - Clear deck area: 1,500+ m²
  - Special capabilities (trenching, pipe-laying) noted
  - Higher fuel consumption considerations

### Requirement: Cargo Category Support
The system SHALL support planning for all cargo categories used in PRIO operations.

#### Scenario: Liquid bulk cargo planning
- **WHEN** planning liquid bulk cargo
- **THEN** the system supports:
  - Diesel fuel (density 850 kg/m³)
  - Fresh water (density 1,000 kg/m³)
  - Drilling mud - oil-based (density 1,200-1,400 kg/m³)
  - Drilling mud - water-based (density 1,100-1,300 kg/m³)
  - Brine (density 1,200 kg/m³)
  - Methanol (density 792 kg/m³)
  - Chemical products (density 800-1,100 kg/m³)
  - Base oil (density 850-900 kg/m³)
  - Segregation requirements and tank cleaning times

#### Scenario: Dry bulk cargo planning
- **WHEN** planning dry bulk cargo
- **THEN** the system supports:
  - Cement (density 1,500 kg/m³)
  - Barite (density 2,500-4,200 kg/m³)
  - Bentonite (density 600-800 kg/m³)
  - Drilling chemicals - powder (density 800-1,200 kg/m³)
  - Pneumatic transfer rate considerations (50-100 m³/hour)
  - Weather sensitivity indicators

#### Scenario: Deck cargo planning
- **WHEN** planning deck cargo
- **THEN** the system supports:
  - Drill pipes (40 ft sections, 5-15 tonnes per pipe)
  - Casing pipes (10-30 tonnes per pipe)
  - Containers (20 ft and 40 ft)
  - Equipment and machinery (variable weights)
  - Chemical tanks and drums
  - Spare parts and tools (palletized)
  - Food and provisions
  - Waste containers (return cargo)
  - Maximum deck loading: 5-7 tonnes/m²
  - Crane capacity constraints at platforms
