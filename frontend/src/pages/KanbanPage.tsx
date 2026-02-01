import React from 'react';
import { KanbanBoard } from '../components/organisms/KanbanBoard/KanbanBoard';
import './KanbanPage.css';

export const KanbanPage: React.FC = () => {
  return (
    <main className="kanban-page">
      <h1 className="kanban-page__title">Kanban Board</h1>
      <KanbanBoard />
    </main>
  );
};

export default KanbanPage;
