import './LoadingPlanTimeline.css';
import type { LoadingPlan, Vessel, Berth } from '../../types';
import { IconWarning } from '../../assets/icons';

interface LoadingPlanTimelineProps {
  plans: LoadingPlan[];
  vessels: Vessel[];
  berths: Berth[];
}

export default function LoadingPlanTimeline({ plans, vessels, berths }: LoadingPlanTimelineProps) {
  if (plans.length === 0) {
    return (
      <div className="timeline-empty">
        <p>No loading plans scheduled. Create one to get started.</p>
      </div>
    );
  }

  const getVesselName = (vesselId: string) => {
    return vessels.find(v => v.id === vesselId)?.name || vesselId;
  };

  const getBerthName = (berthId: string) => {
    return berths.find(b => b.id === berthId)?.name || berthId;
  };

  return (
    <div className="loading-plan-timeline">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`plan-card ${plan.isValid ? '' : 'plan-invalid'}`}
        >
          <div className="plan-header">
            <h4>{getVesselName(plan.vesselId)}</h4>
            <span className={`plan-status plan-status-${plan.status}`}>
              {plan.status}
            </span>
          </div>
          <div className="plan-details">
            <div>Berth: {getBerthName(plan.berthId)}</div>
            <div>Start: {new Date(plan.scheduledStart).toLocaleString()}</div>
            <div>Duration: {plan.estimatedDuration}h</div>
            <div>Cargo Items: {plan.cargoItems.length}</div>
          </div>
          {plan.validationErrors && plan.validationErrors.length > 0 && (
            <div className="plan-errors">
              <strong>
                <IconWarning size={16} className="error-icon" />
                Validation Errors:
              </strong>
              <ul>
                {plan.validationErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
