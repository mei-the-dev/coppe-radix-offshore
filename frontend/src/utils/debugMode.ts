/**
 * Debug Mode Configuration
 * Controls debug logging and development tools
 */

const DEBUG_ENABLED = import.meta.env.DEV && (
  import.meta.env.VITE_DEBUG === 'true' ||
  (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function' && localStorage.getItem('debug') === 'true')
);

export const isDebugEnabled = () => DEBUG_ENABLED;

export const enableDebug = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('debug', 'true');
    console.log('%c🔍 Debug mode enabled', 'color: #10b981; font-weight: bold;');
    console.log('Refresh the page to apply changes');
  }
};

export const disableDebug = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('debug');
    console.log('%c🔍 Debug mode disabled', 'color: #ef4444; font-weight: bold;');
    console.log('Refresh the page to apply changes');
  }
};

export const debugLog = (category: string, message: string, data?: unknown) => {
  if (!isDebugEnabled()) return;

  const styles = {
    component: 'color: #3b82f6; font-weight: bold;',
    api: 'color: #8b5cf6; font-weight: bold;',
    render: 'color: #10b981; font-weight: bold;',
    style: 'color: #f59e0b; font-weight: bold;',
    error: 'color: #ef4444; font-weight: bold;',
  };

  const style = styles[category as keyof typeof styles] || 'color: #6b7280;';

  console.log(`%c[${category.toUpperCase()}]`, style, message, data || '');
};

export const debugGroup = (label: string, fn: () => void) => {
  if (!isDebugEnabled()) {
    fn();
    return;
  }
  console.group(`🔍 ${label}`);
  fn();
  console.groupEnd();
};
