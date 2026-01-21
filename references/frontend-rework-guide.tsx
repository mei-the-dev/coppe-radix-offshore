<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Macaé Loading Dashboard - Redesigned UX</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --purple-50: #faf5ff;
            --purple-100: #f3e8ff;
            --purple-500: #a855f7;
            --purple-600: #9333ea;
            --purple-700: #7e22ce;
            --purple-900: #581c87;
            --pink-500: #ec4899;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-300: #d1d5db;
            --gray-600: #4b5563;
            --gray-700: #374151;
            --gray-800: #1f2937;
            --gray-900: #111827;
            --green-500: #10b981;
            --green-100: #d1fae5;
            --yellow-500: #f59e0b;
            --yellow-100: #fef3c7;
            --red-500: #ef4444;
            --red-100: #fee2e2;
            --blue-500: #3b82f6;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, var(--purple-50) 0%, var(--gray-50) 100%);
            color: var(--gray-900);
            min-height: 100vh;
        }

        /* Header */
        .header {
            background: linear-gradient(135deg, var(--purple-600) 0%, var(--pink-500) 100%);
            color: white;
            padding: 1.5rem 2rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .header-content {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1.5rem;
            font-weight: 700;
        }

        .header-actions {
            display: flex;
            gap: 1rem;
            align-items: center;
        }

        .icon-btn {
            width: 40px;
            height: 40px;
            border-radius: 0.5rem;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .icon-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }

        /* Navigation */
        .nav-container {
            background: white;
            border-bottom: 1px solid var(--gray-200);
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .nav-tabs {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            gap: 0.5rem;
            padding: 0 2rem;
        }

        .tab {
            padding: 1rem 1.5rem;
            background: none;
            border: none;
            color: var(--gray-600);
            font-weight: 500;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .tab:hover {
            color: var(--purple-600);
            background: var(--purple-50);
        }

        .tab.active {
            color: var(--purple-600);
            border-bottom-color: var(--purple-600);
        }

        /* Main Content */
        .main-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }

        /* Dashboard Grid */
        .dashboard-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .dashboard-section {
            background: white;
            border-radius: 1rem;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: all 0.3s;
        }

        .dashboard-section:hover {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--gray-100);
        }

        .section-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--gray-900);
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--purple-600), var(--pink-500));
            color: white;
            border: none;
            padding: 0.625rem 1.25rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(168, 85, 247, 0.3);
        }

        /* Vessel Cards */
        .vessel-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            max-height: 500px;
            overflow-y: auto;
            padding-right: 0.5rem;
        }

        .vessel-card {
            background: linear-gradient(135deg, var(--gray-50), white);
            border: 1px solid var(--gray-200);
            border-radius: 0.75rem;
            padding: 1rem;
            transition: all 0.2s;
            cursor: pointer;
        }

        .vessel-card:hover {
            border-color: var(--purple-300);
            box-shadow: 0 4px 12px rgba(168, 85, 247, 0.15);
            transform: translateX(4px);
        }

        .vessel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
        }

        .vessel-name {
            font-weight: 700;
            font-size: 1.125rem;
            color: var(--gray-900);
        }

        .badge {
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .badge-available {
            background: var(--green-100);
            color: var(--green-500);
        }

        .badge-in-port {
            background: var(--blue-100);
            color: var(--blue-500);
        }

        .badge-in-transit {
            background: var(--yellow-100);
            color: var(--yellow-500);
        }

        .badge-occupied {
            background: var(--red-100);
            color: var(--red-500);
        }

        .vessel-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: var(--gray-600);
        }

        .detail-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        /* Timeline */
        .timeline {
            position: relative;
            padding-left: 2rem;
        }

        .timeline-item {
            position: relative;
            padding-bottom: 2rem;
        }

        .timeline-item::before {
            content: '';
            position: absolute;
            left: -2rem;
            top: 0;
            width: 2px;
            height: 100%;
            background: var(--gray-200);
        }

        .timeline-dot {
            position: absolute;
            left: -2.5rem;
            top: 0;
            width: 1rem;
            height: 1rem;
            border-radius: 50%;
            background: var(--purple-500);
            border: 3px solid white;
            box-shadow: 0 0 0 2px var(--purple-200);
        }

        .timeline-content {
            background: var(--gray-50);
            padding: 1rem;
            border-radius: 0.5rem;
            border-left: 3px solid var(--purple-500);
        }

        .timeline-time {
            font-size: 0.75rem;
            color: var(--gray-500);
            margin-bottom: 0.25rem;
        }

        .timeline-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        /* Berth Grid */
        .berth-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
        }

        .berth-card {
            background: white;
            border: 2px solid var(--gray-200);
            border-radius: 0.75rem;
            padding: 1.25rem;
            text-align: center;
            transition: all 0.2s;
        }

        .berth-card:hover {
            border-color: var(--purple-300);
            transform: scale(1.05);
        }

        .berth-available {
            border-color: var(--green-500);
            background: linear-gradient(135deg, white, var(--green-50));
        }

        .berth-occupied {
            border-color: var(--red-500);
            background: linear-gradient(135deg, white, var(--red-50));
        }

        .berth-name {
            font-weight: 700;
            font-size: 1.125rem;
            margin-bottom: 0.5rem;
        }

        .berth-status {
            font-size: 0.875rem;
            color: var(--gray-600);
            margin-bottom: 1rem;
        }

        /* Stats Cards */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: white;
            border-radius: 1rem;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-left: 4px solid var(--purple-500);
        }

        .stat-label {
            font-size: 0.875rem;
            color: var(--gray-600);
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            font-weight: 600;
        }

        .stat-value {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--purple-600), var(--pink-500));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-track {
            background: var(--gray-100);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
            background: var(--purple-300);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--purple-500);
        }

        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .dashboard-section {
            animation: fadeIn 0.4s ease-out;
        }

        .dashboard-section:nth-child(1) { animation-delay: 0.1s; }
        .dashboard-section:nth-child(2) { animation-delay: 0.2s; }
        .dashboard-section:nth-child(3) { animation-delay: 0.3s; }
        .dashboard-section:nth-child(4) { animation-delay: 0.4s; }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="header-content">
            <div class="logo">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
                <span>Macaé Loading Dashboard</span>
            </div>
            <div class="header-actions">
                <button class="icon-btn" aria-label="Notifications">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                </button>
                <button class="icon-btn" aria-label="Settings">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6m-6-6h6m6 0h-6"></path>
                    </svg>
                </button>
                <button class="icon-btn" aria-label="User Profile">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </button>
            </div>
        </div>
    </header>

    <!-- Navigation -->
    <nav class="nav-container">
        <div class="nav-tabs">
            <button class="tab active">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
                Planning
            </button>
            <button class="tab">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Simulation
            </button>
            <button class="tab">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
                Model
            </button>
            <button class="tab">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
                Data Structure
            </button>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
        <!-- Stats Overview -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Active Vessels</div>
                <div class="stat-value">12</div>
            </div>
            <div class="stat-card" style="border-left-color: var(--green-500);">
                <div class="stat-label">Available Berths</div>
                <div class="stat-value">3</div>
            </div>
            <div class="stat-card" style="border-left-color: var(--blue-500);">
                <div class="stat-label">Active Plans</div>
                <div class="stat-value">8</div>
            </div>
        </div>

        <!-- Dashboard Grid -->
        <div class="dashboard-grid">
            <!-- Vessel Fleet -->
            <div class="dashboard-section">
                <div class="section-header">
                    <h2 class="section-title">Vessel Fleet</h2>
                    <button class="btn-primary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Vessel
                    </button>
                </div>
                <div class="vessel-list">
                    <div class="vessel-card">
                        <div class="vessel-header">
                            <span class="vessel-name">PSV Standard Alpha</span>
                            <span class="badge badge-available">Available</span>
                        </div>
                        <div class="vessel-details">
                            <div class="detail-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                Macaé Port
                            </div>
                            <div class="detail-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                </svg>
                                Deck: 2450t
                            </div>
                            <div class="detail-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                Liquid: 2500m³
                            </div>
                            <div class="detail-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                </svg>
                                12 knots
                            </div>
                        </div>
                    </div>

                    <div class="vessel-card">
                        <div class="vessel-header">
                            <span class="vessel-name">PSV Standard Beta</span>
                            <span class="badge badge-in-transit">In Transit</span>
                        </div>
                        <div class="vessel-details">
                            <div class="detail-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                En route to FPSO
                            </div>
                            <div class="detail-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                </svg>
                                Deck: 2450t
                            </div>
                            <div class="detail-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                </svg>
                                Liquid: 2500m³
                            </div>
                            <div class="detail-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                </svg>
                                12 knots
                            </div>
                        </div>
                    </div>

                    <div class="vessel-card">
                        <div class="vessel-header">
                            <span class="vessel-name">PSV Large Gamma</span>
                            <span class="badge badge-available">Available</span>
                        </div>
                        <div class="vessel-details">
                            <div class="detail-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                </svg>
                                FPSO Peregrino
                            </div>
                            <div class="detail-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                </svg>
                                Deck: 3000t
                            </div>
                            <div class="detail-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                </svg>
                                Liquid: 3250m³
                            </div>
                            <div class="detail-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                </svg>
                                13 knots
                            </div>
                        </div>
                    </div>

                    <div class="vessel-card">
                        <div class="vessel-header">
                            <span class="vessel-name">CSV Normand Pioneer</span>
                            <span class="badge badge-in-port">In Port</span>
                        </div>
                        <div class="vessel-details">
                            <div class="detail-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                </svg>
                                Macaé Port
                            </div>
                            <div class="detail-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                </svg>
                                Deck: 4000t
                            </div>
                            <div class="detail-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                </svg>
                                Liquid: 3000m³
                            </div>
                            <div class="detail-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                </svg>
                                15 knots
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Berth Availability -->
            <div class="dashboard-section">
                <div class="section-header">
                    <h2 class="section-title">Berth Availability</h2>
                </div>
                <div class="berth-grid">
                    <div class="berth-card berth-available">
                        <div class="berth-name">Berth 1</div>
                        <span class="badge badge-available">Available</span>
                        <div class="berth-status">Max DWT: 5513t</div>
                        <div style="font-size: 0.75rem; color: var(--gray-500);">Length: 97m</div>
                    </div>
                    <div class="berth-card berth-occupied">
                        <div class="berth-name">Berth 2</div>
                        <span class="badge badge-occupied">Occupied</span>
                        <div class="berth-status">vessel-001</div>
                        <div style="font-size: 0.75rem; color: var(--gray-500);">Length: 97m</div>
                    </div>
                    <div class="berth-card berth-available">
                        <div class="berth-name">Berth 3</div>
                        <span class="badge badge-available">Available</span>
                        <div class="berth-status">Max DWT: 5513t</div>
                        <div style="font-size: 0.75rem; color: var(--gray-500);">Length: 97m</div>
                    </div>
                </div>
            </div>

            <!-- Loading Schedule Timeline -->
            <div class="dashboard-section" style="grid-column: 1 / -1;">
                <div class="section-header">
                    <h2 class="section-title">Loading Schedule Timeline</h2>
                    <button class="btn-primary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Create Loading Plan
                    </button>
                </div>
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <div class="timeline-time">Today, 08:00 - 16:00</div>
                            <div class="timeline-title">PSV Standard Alpha - Berth 1</div>
                            <div style="font-size: 0.875rem; color: var(--gray-600); margin-top: 0.5rem;">
                                Loading drill pipes, drilling mud, and general cargo
                            </div>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot" style="background: var(--blue-500); box-shadow: 0 0 0 2px var(--blue-200);"></div>
                        <div class="timeline-content" style="border-left-color: var(--blue-500);">
                            <div class="timeline-time">Tomorrow, 06:00 - 14:00</div>
                            <div class="timeline-title">CSV Normand Pioneer - Berth 2</div>
                            <div style="font-size: 0.875rem; color: var(--gray-600); margin-top: 0.5rem;">
                                Loading construction materials and ROV equipment
                            </div>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot" style="background: var(--green-500); box-shadow: 0 0 0 2px var(--green-200);"></div>
                        <div class="timeline-content" style="border-left-color: var(--green-500);">
                            <div class="timeline-time">Jan 23, 10:00 - 18:00</div>
                            <div class="timeline-title">PSV Large Gamma - Berth 3</div>
                            <div style="font-size: 0.875rem; color: var(--gray-600); margin-top: 0.5rem;">
                                Loading completion fluids and well intervention tools
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</body>
</html>