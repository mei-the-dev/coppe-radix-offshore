import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Dashboard.css';
import type { Vessel, Berth, LoadingPlan } from '../../types';
import { VesselList, BerthStatus, LoadingPlanTimeline, CreateLoadingPlan } from '../organisms';
import { Button } from '../action';
import { Stack, Grid } from '../layout';
import { Modal } from '../feedback';
import { IconPlus } from '../../assets/icons';

interface DashboardProps {
  vessels: Vessel[];
  berths: Berth[];
  loadingPlans: LoadingPlan[];
  onPlansChange: (plans: LoadingPlan[]) => void;
}

export default function Dashboard({ vessels, berths, loadingPlans, onPlansChange }: DashboardProps) {
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const location = useLocation();

  const handlePlanCreated = (plan: LoadingPlan) => {
    onPlansChange([...loadingPlans, plan]);
    setShowCreatePlan(false);
  };

  // Show planning view for dashboard and planning routes
  const isPlanningView = location.pathname === '/dashboard' || location.pathname === '/planning';

  if (!isPlanningView) {
    return null; // Other routes handle their own content
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <Stack direction="row" justify="space-between" align="center" gap="md">
          <h2>Loading Operations Planning</h2>
          <Button
            variant="primary"
            onClick={() => setShowCreatePlan(true)}
          >
            <IconPlus size={18} />
            Create Loading Plan
          </Button>
        </Stack>
      </div>

      <Grid columns={{ xs: 1, md: 2 }} gap="lg">
        <div className="dashboard-section">
          <h3>Vessel Fleet</h3>
          <VesselList vessels={vessels} />
        </div>

        <div className="dashboard-section">
          <h3>Berth Availability</h3>
          <BerthStatus berths={berths} />
        </div>

        <div className="dashboard-section dashboard-section-wide">
          <h3>Loading Schedule Timeline</h3>
          <LoadingPlanTimeline
            plans={loadingPlans}
            vessels={vessels}
            berths={berths}
          />
        </div>
      </Grid>

      <Modal.Root open={showCreatePlan} onOpenChange={setShowCreatePlan}>
        <Modal.Header>
          <Modal.Title>Create Loading Plan</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Content>
          <CreateLoadingPlan
            vessels={vessels}
            berths={berths}
            onClose={() => setShowCreatePlan(false)}
            onPlanCreated={handlePlanCreated}
          />
        </Modal.Content>
      </Modal.Root>
    </div>
  );
}
