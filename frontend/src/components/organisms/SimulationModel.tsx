import './SimulationModel.css';

export default function SimulationModel() {
  return (
    <div className="simulation-model">
      <div className="model-header">
        <h2>Simulation Model Documentation</h2>
        <p className="model-subtitle">
          Understanding how the weekly vessel delivery simulation works
        </p>
      </div>

      <div className="model-content">
        <section className="model-section">
          <h3>Overview</h3>
          <p>
            This simulation models a weekly cycle of Platform Supply Vessel (PSV) operations
            for PRIO's offshore logistics network. It demonstrates vessel movements between
            the Port of Macaé and offshore platforms in the Campos Basin, including loading
            operations, transit, and delivery activities.
          </p>
        </section>

        <section className="model-section">
          <h3>Time Scaling</h3>
          <div className="info-box">
            <strong>Simulation Speed:</strong> 1 hour of real operations = 1 second of simulation time
          </div>
          <p>
            The simulation compresses time to allow visualization of weekly operations in minutes.
            This means:
          </p>
          <ul>
            <li><strong>8-hour loading operation</strong> → 8 seconds in simulation</li>
            <li><strong>6-hour transit to platform</strong> → 6 seconds in simulation</li>
            <li><strong>1 week of operations</strong> → ~168 seconds (~2.8 minutes) in simulation</li>
          </ul>
        </section>

        <section className="model-section">
          <h3>Vessel States</h3>
          <p>Vessels transition through the following operational states:</p>

          <div className="state-grid">
            <div className="state-card state-loading">
              <h4>Loading</h4>
              <p>Vessel is at Port of Macaé being loaded with cargo</p>
              <ul>
                <li>Duration: 6-12 hours (avg 8 hours)</li>
                <li>Fuel consumption: 3-7 tonnes/day</li>
                <li>Progress tracked: 0-100%</li>
              </ul>
            </div>

            <div className="state-card state-transit">
              <h4>Transit</h4>
              <p>Vessel is traveling from port to destination platform</p>
              <ul>
                <li>Speed: 12-15 knots (operational average)</li>
                <li>Distance: 46-81 NM depending on platform</li>
                <li>Fuel consumption: 16-22 tonnes/day</li>
                <li>ETA calculated based on distance and speed</li>
              </ul>
            </div>

            <div className="state-card state-platform">
              <h4>At Platform</h4>
              <p>Vessel is at offshore platform delivering cargo</p>
              <ul>
                <li>Duration: 4-8 hours</li>
                <li>Fuel consumption: 4-8 tonnes/day (DP operations)</li>
                <li>Includes discharge and backhaul loading</li>
              </ul>
            </div>

            <div className="state-card state-returning">
              <h4>Returning</h4>
              <p>Vessel is returning to port after delivery</p>
              <ul>
                <li>Speed: 12-15 knots</li>
                <li>May carry backhaul cargo (waste, equipment)</li>
                <li>Fuel consumption: 16-22 tonnes/day</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="model-section">
          <h3>Vessel Fleet</h3>
          <p>The simulation uses PRIO's heterogeneous vessel fleet:</p>

          <div className="fleet-table">
            <table>
              <thead>
                <tr>
                  <th>Vessel Type</th>
                  <th>Deck Capacity</th>
                  <th>Liquid Capacity</th>
                  <th>Operational Speed</th>
                  <th>DP Class</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Standard PSV</strong></td>
                  <td>2,450 t</td>
                  <td>2,500 m³</td>
                  <td>13 knots</td>
                  <td>DP-2</td>
                </tr>
                <tr>
                  <td><strong>Large PSV</strong></td>
                  <td>3,200 t</td>
                  <td>3,500 m³</td>
                  <td>12.5 knots</td>
                  <td>DP-2/DP-3</td>
                </tr>
                <tr>
                  <td><strong>CSV</strong></td>
                  <td>3,500-4,500 t</td>
                  <td>Variable</td>
                  <td>12-14 knots</td>
                  <td>DP-2/DP-3</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="model-section">
          <h3>Platform Network</h3>
          <p>The simulation includes 8 offshore installations in the Campos Basin:</p>

          <div className="platform-list">
            <div className="platform-item">
              <strong>FPSO Bravo</strong> - 70 NM from Macaé
            </div>
            <div className="platform-item">
              <strong>Platform Polvo A</strong> - 70 NM from Macaé
            </div>
            <div className="platform-item">
              <strong>FPSO Valente</strong> - 67 NM from Macaé
            </div>
            <div className="platform-item">
              <strong>FPSO Forte</strong> - 75 NM from Macaé
            </div>
            <div className="platform-item">
              <strong>FPSO Peregrino</strong> - 46 NM from Macaé (closest)
            </div>
            <div className="platform-item">
              <strong>Platform Peregrino A, B, C</strong> - 46 NM from Macaé
            </div>
          </div>

          <div className="info-box">
            <strong>Distance Range:</strong> 46-81 NM<br />
            <strong>Average Transit Time:</strong> 4-6 hours at 12.5 knots
          </div>
        </section>

        <section className="model-section">
          <h3>Loading Operations</h3>
          <p>Loading at Port of Macaé includes:</p>
          <ul>
            <li><strong>Liquid Cargo:</strong> 2-4 hours (diesel, water, drilling mud, chemicals)</li>
            <li><strong>Dry Bulk:</strong> 1-3 hours (cement, barite, bentonite)</li>
            <li><strong>Deck Cargo:</strong> 3-6 hours (drill pipes, containers, equipment)</li>
            <li><strong>Total Turnaround:</strong> 6-12 hours (average 8 hours)</li>
          </ul>

          <div className="info-box">
            <strong>Berth Capacity:</strong> Multiple berths available 24/7<br />
            <strong>Loading Progress:</strong> Tracked in real-time during simulation
          </div>
        </section>

        <section className="model-section">
          <h3>Metrics and Calculations</h3>

          <h4>Distance Calculation</h4>
          <p>
            Distances are calculated using the Haversine formula for great-circle distance
            between geographic coordinates (latitude/longitude), accounting for Earth's curvature.
          </p>

          <h4>Fuel Consumption</h4>
          <p>Estimated based on vessel type and operational state:</p>
          <ul>
            <li><strong>Transit/Returning:</strong> 16-22 tonnes/day (Standard PSV: 16.5, Large PSV: 20, CSV: 25)</li>
            <li><strong>Loading at Port:</strong> 3-7 tonnes/day (idle operations)</li>
            <li><strong>DP Operations (Platform):</strong> 4-8 tonnes/day (dynamic positioning)</li>
          </ul>

          <h4>ETA Calculation</h4>
          <p>
            Estimated Time of Arrival is calculated as: <code>Distance Remaining / Current Speed</code>
          </p>
        </section>

        <section className="model-section">
          <h3>Platform Consumption</h3>
          <p>
            Each platform has weekly consumption requirements that drive demand for deliveries:
          </p>
          <ul>
            <li><strong>Diesel:</strong> 50-600 m³/week (varies by platform size)</li>
            <li><strong>Water:</strong> 50-400 m³/week</li>
            <li><strong>Chemicals:</strong> 20-150 m³/week</li>
            <li><strong>Deck Cargo:</strong> 30-200 tonnes/week</li>
          </ul>
          <p>
            These consumption rates are based on PRIO operational data and determine
            delivery frequency requirements.
          </p>
        </section>

        <section className="model-section">
          <h3>Assumptions and Limitations</h3>

          <div className="assumptions-grid">
            <div className="assumption-card">
              <h4>✓ Included</h4>
              <ul>
                <li>Vessel movement and positioning</li>
                <li>Loading operations at port</li>
                <li>Transit time calculations</li>
                <li>Fuel consumption estimates</li>
                <li>Platform distance and coordinates</li>
                <li>Real-time progress tracking</li>
              </ul>
            </div>

            <div className="assumption-card">
              <h4>✗ Not Included</h4>
              <ul>
                <li>Weather delays and conditions</li>
                <li>Actual cargo loading/unloading details</li>
                <li>Cargo compatibility validation</li>
                <li>Berth scheduling conflicts</li>
                <li>Platform service time variability</li>
                <li>Emergency orders or disruptions</li>
                <li>Cost calculations</li>
                <li>Multi-vessel coordination</li>
              </ul>
            </div>
          </div>

          <div className="info-box warning">
            <strong>Note:</strong> This is a simplified visualization model. Real operations
            include weather constraints, cargo compatibility rules, berth scheduling, and
            operational variability that are not modeled here.
          </div>
        </section>

        <section className="model-section">
          <h3>Data Sources</h3>
          <p>
            Simulation parameters are based on PRIO operational data from:
          </p>
          <ul>
            <li>Vessel specifications (Standard PSV, Large PSV, CSV)</li>
            <li>Platform locations and distances from Macaé</li>
            <li>Operational time windows and turnaround times</li>
            <li>Fuel consumption rates by vessel type and operation</li>
            <li>Platform consumption requirements</li>
            <li>Port of Macaé specifications</li>
          </ul>
          <p>
            All data is derived from <code>references/inventory.md</code> and
            <code>references/prio-logistics-data-model.md</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
