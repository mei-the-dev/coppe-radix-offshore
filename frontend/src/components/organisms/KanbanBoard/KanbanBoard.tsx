import React, { useMemo } from 'react';
import { useLoadingPlans, useUpdateLoadingPlan, useCreateLoadingPlan, useDeleteLoadingPlan } from '../../../hooks/useLoadingPlans';
import { KanbanColumn } from '../../molecules/KanbanColumn/KanbanColumn';
import './KanbanBoard.css';

export const KanbanBoard: React.FC = () => {
  const { data: plans = [], isLoading, refetch } = useLoadingPlans();
  const updateMutation = useUpdateLoadingPlan();
  const createMutation = useCreateLoadingPlan();
  const deleteMutation = useDeleteLoadingPlan();

  // derive statuses present in data
  const statuses = useMemo(() => {
    const set = new Set<string>();
    plans.forEach((p: any) => set.add((p.status || 'planned')));

    // default preferred order
    const preferred = ['planned', 'ready', 'in_progress', 'completed', 'cancelled'];
    const fromData = Array.from(set);

    // Build final order: preferred (if present) then remaining
    const ordered = [...preferred.filter((s) => set.has(s)), ...fromData.filter((s) => !preferred.includes(s))];
    return ordered.length ? ordered : ['planned', 'in_progress', 'completed'];
  }, [plans]);

  const columns = useMemo(() => {
    const m: Record<string, any[]> = {};
    statuses.forEach((s) => (m[s] = []));
    plans.forEach((p: any) => {
      const key = p.status || 'planned';
      if (!m[key]) m[key] = [];
      m[key].push(p);
    });
    return m;
  }, [plans, statuses]);

  function handleDropCard(cardId: string, toStatus: string) {
    // Optimistic update via useUpdateLoadingPlan
    updateMutation.mutate({ id: cardId, updates: { status: toStatus } });
  }

  function handleAdd(status: string, payload: any) {
    // Prepare minimal plan payload — backend may require more fields
    const payloadToSend = {
      vesselId: payload.vesselId || '',
      berthId: payload.berthId || '',
      scheduledStart: payload.scheduledStart || new Date().toISOString(),
      status,
      title: payload.title || 'New plan',
      description: payload.description || '',
      cargoItems: payload.cargoItems || [],
    };
    createMutation.mutate(payloadToSend);
  }

  function handleEdit(card: any) {
    // for now: open inline edit not implemented — use update mutation to patch
    const updates = { title: `${card.title} (edited)` };
    updateMutation.mutate({ id: card.id, updates });
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id);
  }

  if (isLoading) return <div className="kanban-board__loading">Loading board...</div>;

  return (
    <div className="kanban-board">
      <div className="kanban-board__controls">
        <button className="atom-button atom-button--ghost" onClick={() => refetch()}>Refresh</button>
      </div>

      <div className="kanban-board__columns" role="list">
        {statuses.map((status) => (
          <KanbanColumn
            key={status}
            id={status}
            title={status.replace(/_/g, ' ').toUpperCase()}
            cards={columns[status] ?? []}
            availableStatuses={statuses}
            onAdd={handleAdd}
            onDropCard={handleDropCard}
            onEditCard={handleEdit}
            onDeleteCard={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
