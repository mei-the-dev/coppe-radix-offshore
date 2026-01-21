import { useVessels, useBerths, useLoadingPlans } from '../hooks';
import { useLoadingPlanStore } from '../stores';
import { Dashboard } from '../components/templates';
import { Alert, ErrorBoundary, SkeletonCard } from '../components/feedback';
import { Stack } from '../components/layout';
import { Button } from '../components/action';

export default function DashboardPage() {
  const { data: vessels = [], isLoading: vesselsLoading, error: vesselsError } = useVessels();
  const { data: berths = [], isLoading: berthsLoading, error: berthsError } = useBerths();
  const { data: loadingPlans = [], isLoading: plansLoading, error: plansError } = useLoadingPlans();
  const setLoadingPlans = useLoadingPlanStore((state) => state.setLoadingPlans);

  const isLoading = vesselsLoading || berthsLoading || plansLoading;
  const error = vesselsError || berthsError || plansError;

  if (isLoading) {
    return (
      <Stack direction="column" gap="lg" className="app-loading">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack direction="column" align="center" justify="center" gap="md" className="app-error">
        <Alert
          severity="error"
          title="Error loading dashboard"
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
    <ErrorBoundary>
      <Dashboard
        vessels={vessels}
        berths={berths}
        loadingPlans={loadingPlans}
        onPlansChange={setLoadingPlans}
      />
    </ErrorBoundary>
  );
}
