import { useVessels, useBerths, useLoadingPlans } from '../hooks';
import { useLoadingPlanStore } from '../stores';
import { Alert } from '../components/feedback';
import { Stack } from '../components/layout';
import { Button } from '../components/action';
import KanbanBoard from '../components/organisms/KanbanBoard/KanbanBoard';

export default function PlanningRoute() {
  const { data: vessels = [], isLoading: vesselsLoading, error: vesselsError } = useVessels();
  const { data: berths = [], isLoading: berthsLoading, error: berthsError } = useBerths();
  const { data: loadingPlans = [], isLoading: plansLoading, error: plansError } = useLoadingPlans();
  const setLoadingPlans = useLoadingPlanStore((state) => state.setLoadingPlans);

  const isLoading = vesselsLoading || berthsLoading || plansLoading;
  const error = vesselsError || berthsError || plansError;

  if (isLoading) {
    return (
      <Stack direction="column" align="center" justify="center" gap="md" className="app-loading">
        <div className="loading-spinner" role="status" aria-live="polite">
          Loading planning board...
        </div>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack direction="column" align="center" justify="center" gap="md" className="app-error">
        <Alert
          severity="error"
          title="Error loading planning board"
          onClose={() => {}}
        >
          {error instanceof Error ? error.message : 'Failed to load data'}
        </Alert>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Stack>
    );
  }

  return (
    <div>
      <h2>Planning Board</h2>
      <KanbanBoard plans={loadingPlans} />
    </div>
  );
}
