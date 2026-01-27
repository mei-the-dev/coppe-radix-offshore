/** Nav items for the main app layout. Split from AppLayout to reduce complexity. */
export const NAV_ITEMS = [
  { path: '/simulation', label: 'Visualization', icon: 'simulation' },
  { path: '/model', label: 'Model', icon: 'model' },
  { path: '/data', label: 'Data Structure', icon: 'data' },
  { path: '/metrics', label: 'Metrics', icon: 'metrics' },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
