import { Visualization } from '../components/organisms';

/**
 * /simulation page: self-sufficient offshore logistics map.
 * Renders Visualization which fetches its own data and shows:
 * - Map background (ocean chart style)
 * - Trip routes, vessel loading, platform delivery, offloading
 * - Supply bases, installations, vessels, berths, trips, orders
 */
export default function SimulationRoute() {
  return (
    <div
      className="dashboard-section dashboard-section-wide"
      style={{ flex: '1 1 0', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <Visualization />
    </div>
  );
}
