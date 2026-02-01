import React, { useState } from 'react';
import { KanbanCard } from '../KanbanCard/KanbanCard';
import './KanbanColumn.css';

interface KanbanColumnProps {
  id: string; // status value
  title: string;
  cards: Array<any>;
  availableStatuses?: string[];
  onAdd?: (status: string, payload: any) => void;
  onDropCard?: (cardId: string, toStatus: string) => void;
  onEditCard?: (card: any) => void;
  onDeleteCard?: (id: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  cards,
  availableStatuses = [],
  onAdd,
  onDropCard,
  onEditCard,
  onDeleteCard,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const idData = e.dataTransfer.getData('text/plain');
    if (!idData) return;
    if (onDropCard) onDropCard(idData, id);
  }

  function handleAddSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;
    if (onAdd) onAdd(id, { title: newTitle.trim(), description: '' });
    setNewTitle('');
    setIsAdding(false);
  }

  return (
    <section
      className="molecule-kanban-column"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      aria-label={`Column ${title}`}
    >
      <header className="molecule-kanban-column__header">
        <h2 className="molecule-kanban-column__title">{title}</h2>
        <div className="molecule-kanban-column__meta">{cards.length}</div>
      </header>

      <div className="molecule-kanban-column__list">
        {cards.map((c: any) => (
          <div
            key={c.id}
            draggable={true}
            onDragStart={(e) => e.dataTransfer.setData('text/plain', c.id)}
            className="molecule-kanban-column__card-wrapper"
          >
            <KanbanCard
              title={c.title || c.id}
              description={c.description}
              onEdit={() => onEditCard && onEditCard(c)}
              onDelete={() => onDeleteCard && onDeleteCard(c.id)}
            />

            {/* Keyboard accessible move control */}
            {availableStatuses.length > 0 && (
              <div className="molecule-kanban-column__move">
                <label className="sr-only" htmlFor={`move-${c.id}`}>Move card</label>
                <select
                  id={`move-${c.id}`}
                  defaultValue={id}
                  onChange={(e) => onDropCard && onDropCard(c.id, e.target.value)}
                  aria-label={`Move ${c.title} to another column`}
                >
                  {availableStatuses.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>

      <footer className="molecule-kanban-column__footer">
        {isAdding ? (
          <form onSubmit={handleAddSubmit} className="molecule-kanban-column__add-form">
            <input
              type="text"
              placeholder="Card title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="molecule-kanban-column__add-input"
              aria-label="New card title"
            />
            <div className="molecule-kanban-column__add-actions">
              <button type="submit" className="atom-button atom-button--primary atom-button--sm">Add</button>
              <button type="button" className="atom-button atom-button--ghost atom-button--sm" onClick={() => setIsAdding(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            className="atom-button atom-button--ghost"
            onClick={() => setIsAdding(true)}
            aria-label={`Add card to ${title}`}
          >
            + Add card
          </button>
        )}
      </footer>
    </section>
  );
};

export default KanbanColumn;
