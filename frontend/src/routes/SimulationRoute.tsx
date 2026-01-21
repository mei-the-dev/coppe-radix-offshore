import { useVessels, useBerths } from '../hooks';
import { Visualization } from '../components/organisms';

export default function SimulationRoute() {
  const { data: vessels = [] } = useVessels();
  const { data: berths = [] } = useBerths();

  return (
    <div className="dashboard-section dashboard-section-wide">
      <Visualization
        vessels={vessels}
        berths={berths}
      />
    </div>
  );
}
