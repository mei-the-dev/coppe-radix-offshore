import { useState, useId } from 'react';
import { TabButton } from '../TabButton';
import './Tabs.css';

interface TabsProps {
  items: Array<{ id: string; label: string; content: React.ReactNode }>;
  defaultActiveId?: string;
  activeId?: string;
  onChange?: (id: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
  'aria-label'?: string;
}

export function Tabs({
  items,
  defaultActiveId,
  activeId: controlledActiveId,
  onChange,
  variant = 'default',
  className = '',
  'aria-label': ariaLabel,
}: TabsProps) {
  const [internalActiveId, setInternalActiveId] = useState(defaultActiveId || items[0]?.id);
  const tabsId = useId();
  const activeId = controlledActiveId ?? internalActiveId;

  const handleTabChange = (id: string) => {
    if (!controlledActiveId) {
      setInternalActiveId(id);
    }
    onChange?.(id);
  };

  // WCAG: Keyboard navigation for tabs (Arrow keys)
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    handleTabChange(items[newIndex].id);
    // Focus the new tab button
    const tabButton = document.getElementById(`${tabsId}-tab-${items[newIndex].id}`);
    tabButton?.focus();
  };

  return (
    <div
      className={`molecule-tabs molecule-tabs--${variant} ${className}`}
      role="tablist"
      aria-label={ariaLabel || 'Tabs'}
    >
      {items.map((item, index) => {
        const isActive = item.id === activeId;
        const tabId = `${tabsId}-tab-${item.id}`;
        const panelId = `${tabsId}-panel-${item.id}`;

        return (
          <TabButton
            key={item.id}
            id={tabId}
            active={isActive}
            onClick={() => handleTabChange(item.id)}
            onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e, index)}
            aria-controls={panelId}
            aria-selected={isActive}
          >
            {item.label}
          </TabButton>
        );
      })}

      {items.map((item) => {
        const isActive = item.id === activeId;
        const panelId = `${tabsId}-panel-${item.id}`;
        const tabId = `${tabsId}-tab-${item.id}`;

        return (
          <div
            key={`panel-${item.id}`}
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId}
            hidden={!isActive}
            className="molecule-tabs__panel"
          >
            {isActive && item.content}
          </div>
        );
      })}
    </div>
  );
}
