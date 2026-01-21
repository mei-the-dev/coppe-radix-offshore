import React, { useState } from 'react';
import { Code, Layers, Palette, Layout, Zap, CheckCircle, AlertCircle } from 'lucide-react';

const FrontendReworkGuide = () => {
  const [activePhase, setActivePhase] = useState('assessment');

  const phases = [
    { id: 'assessment', label: 'Assessment', icon: AlertCircle },
    { id: 'architecture', label: 'Architecture', icon: Layers },
    { id: 'components', label: 'Components', icon: Layout },
    { id: 'design', label: 'Design System', icon: Palette },
    { id: 'optimization', label: 'Optimization', icon: Zap },
    { id: 'testing', label: 'Testing', icon: CheckCircle }
  ];

  const implementationSteps = {
    assessment: [
      {
        title: "Code Quality Audit",
        priority: "HIGH",
        tasks: [
          "Run TypeScript strict mode checks on all files",
          "Identify unused dependencies and dead code",
          "Check for accessibility violations using axe-core",
          "Measure bundle size and identify optimization opportunities",
          "Review component coupling and identify refactoring candidates"
        ]
      },
      {
        title: "Performance Baseline",
        priority: "HIGH",
        tasks: [
          "Measure Core Web Vitals (LCP, FID, CLS)",
          "Profile React component render performance",
          "Analyze bundle composition with webpack-bundle-analyzer",
          "Test on throttled network conditions",
          "Measure time-to-interactive for each page"
        ]
      },
      {
        title: "UX/UI Review",
        priority: "MEDIUM",
        tasks: [
          "Conduct heuristic evaluation of current interface",
          "Identify inconsistencies in component usage",
          "Review color contrast ratios for WCAG compliance",
          "Test keyboard navigation flows",
          "Gather user feedback on pain points"
        ]
      }
    ],
    architecture: [
      {
        title: "State Management Refactor",
        priority: "HIGH",
        tasks: [
          "Implement Zustand for global state (vessels, berths, plans)",
          "Create state slices: vessels, berths, plans, simulation, ui",
          "Add React Query for server state management",
          "Implement optimistic updates for CRUD operations",
          "Add state persistence for user preferences"
        ]
      },
      {
        title: "Routing Implementation",
        priority: "HIGH",
        tasks: [
          "Install React Router v6",
          "Create routes: /dashboard, /planning, /simulation, /model, /data",
          "Implement protected routes structure",
          "Add route-based code splitting",
          "Create breadcrumb navigation component"
        ]
      },
      {
        title: "API Layer Enhancement",
        priority: "MEDIUM",
        tasks: [
          "Wrap API client with React Query",
          "Implement request/response interceptors",
          "Add retry logic with exponential backoff",
          "Create TypeScript types from API schema",
          "Add request deduplication"
        ]
      }
    ],
    components: [
      {
        title: "Component Migration",
        priority: "HIGH",
        tasks: [
          "Complete migration from Atomic Design to Intent-Based architecture",
          "Refactor remaining atoms/molecules to action/display/navigation",
          "Create compound component patterns for complex UIs",
          "Implement proper prop drilling alternatives",
          "Add forwardRef to all interactive components"
        ]
      },
      {
        title: "New Component Development",
        priority: "MEDIUM",
        tasks: [
          "DataTable component with sorting, filtering, pagination",
          "DateTimePicker for scheduling operations",
          "MapView component for vessel tracking",
          "Timeline component for loading schedules",
          "FormBuilder for dynamic form creation"
        ]
      },
      {
        title: "Component Enhancement",
        priority: "MEDIUM",
        tasks: [
          "Add loading states to all async components",
          "Implement error boundaries for graceful failures",
          "Add skeleton loaders for better perceived performance",
          "Create responsive variants for all components",
          "Add animation transitions using Framer Motion"
        ]
      }
    ],
    design: [
      {
        title: "Design Token Expansion",
        priority: "HIGH",
        tasks: [
          "Add elevation tokens for shadow system",
          "Create motion tokens for animations",
          "Define radius tokens for border-radius scale",
          "Add opacity tokens for transparency levels",
          "Create focus ring tokens for accessibility"
        ]
      },
      {
        title: "Theme Enhancement",
        priority: "MEDIUM",
        tasks: [
          "Add high contrast theme variant",
          "Create colorblind-friendly color modes",
          "Implement theme preview system",
          "Add theme transition animations",
          "Create theme export/import functionality"
        ]
      },
      {
        title: "Typography System",
        priority: "MEDIUM",
        tasks: [
          "Implement fluid typography scale",
          "Add text style presets (heading, body, caption)",
          "Create responsive font sizing",
          "Add proper font loading strategy",
          "Implement text truncation utilities"
        ]
      }
    ],
    optimization: [
      {
        title: "Performance Optimization",
        priority: "HIGH",
        tasks: [
          "Implement React.memo for expensive components",
          "Add useMemo/useCallback where beneficial",
          "Implement virtual scrolling for vessel/cargo lists",
          "Add image lazy loading and optimization",
          "Code split by route and heavy components"
        ]
      },
      {
        title: "Bundle Optimization",
        priority: "HIGH",
        tasks: [
          "Analyze and reduce bundle size",
          "Implement dynamic imports for large dependencies",
          "Remove unused CSS with PurgeCSS",
          "Optimize SVG assets",
          "Enable compression in production build"
        ]
      },
      {
        title: "Caching Strategy",
        priority: "MEDIUM",
        tasks: [
          "Implement service worker for offline support",
          "Add HTTP caching headers configuration",
          "Use React Query cache for API responses",
          "Implement localStorage for user preferences",
          "Add cache invalidation strategies"
        ]
      }
    ],
    testing: [
      {
        title: "Unit Testing",
        priority: "HIGH",
        tasks: [
          "Achieve 80%+ coverage for utility functions",
          "Test all component variants and states",
          "Add tests for custom hooks",
          "Test error handling scenarios",
          "Add snapshot tests for complex components"
        ]
      },
      {
        title: "Integration Testing",
        priority: "HIGH",
        tasks: [
          "Test complete user flows (create plan, assign cargo)",
          "Test form submissions and validation",
          "Test navigation and routing",
          "Test API integration with MSW",
          "Test state management interactions"
        ]
      },
      {
        title: "E2E & Visual Testing",
        priority: "MEDIUM",
        tasks: [
          "Create Playwright tests for critical paths",
          "Add visual regression tests",
          "Test responsive layouts across breakpoints",
          "Add cross-browser compatibility tests",
          "Implement accessibility automated testing"
        ]
      }
    ]
  };

  const activeSteps = implementationSteps[activePhase] || [];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Macaé Loading Dashboard - Frontend Rework Plan
          </h1>
          <p className="text-gray-600">
            AI Code Agent Implementation Instructions
          </p>
        </div>

        {/* Phase Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Implementation Phases</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {phases.map((phase) => {
              const Icon = phase.icon;
              const isActive = activePhase === phase.id;
              return (
                <button
                  key={phase.id}
                  onClick={() => setActivePhase(phase.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isActive
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
                  <div className={`text-sm font-medium ${isActive ? 'text-purple-900' : 'text-gray-700'}`}>
                    {phase.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Implementation Steps */}
        <div className="space-y-6">
          {activeSteps.map((step, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(step.priority)}`}>
                    {step.priority}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {step.tasks.map((task, taskIdx) => (
                    <li key={taskIdx} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-0.5">
                        <Code className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-gray-700">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Reference */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-2xl font-bold mb-4">Quick Start Commands</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="font-mono text-sm">
                <div className="text-purple-200 mb-2"># Install dependencies</div>
                <div>npm install zustand react-query react-router-dom framer-motion</div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="font-mono text-sm">
                <div className="text-purple-200 mb-2"># Run analysis</div>
                <div>npm run build -- --analyze</div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="font-mono text-sm">
                <div className="text-purple-200 mb-2"># Type checking</div>
                <div>npm run type-check</div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="font-mono text-sm">
                <div className="text-purple-200 mb-2"># Run tests with coverage</div>
                <div>npm test -- --coverage</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrontendReworkGuide;