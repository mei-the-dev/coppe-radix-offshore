/** Nav items for the main app layout. Split from AppLayout to reduce complexity. */
export const NAV_ITEMS = [
  { path: '/kanban', label: 'Kanban', icon: 'kanban' },
  { path: '/planning', label: 'Planning', icon: 'planning' },
  { path: '/simulation', label: 'Visualization', icon: 'simulation' },
  { path: '/model', label: 'Model', icon: 'model' },
  { path: '/diagram', label: 'Diagram', icon: 'diagram' },
  { path: '/data', label: 'Data Explorer', icon: 'data' },
  { path: '/metrics', label: 'Metrics', icon: 'metrics' },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
