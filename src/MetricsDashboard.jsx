import { useEffect, useState } from "react";

const API = "http://localhost:8080";

function MetricsDashboard() {
  const [metrics, setMetrics] = useState({
    queriesReplayed: 0,
    errors: 0,
    errorRate: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`${API}/api/metrics`);
        const data = await response.json();

        console.log("Metrics:", data);
        setMetrics(data);
      } catch (error) {
        console.error("Metrics error:", error);
      }
    };

    fetchMetrics();

    const interval = setInterval(fetchMetrics, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="metrics-section">
      <div className="metric-card">
        <p>Queries Replayed</p>
        <h2>{metrics.queriesReplayed}</h2>
      </div>

      <div className="metric-card">
        <p>Error Rate</p>
        <h2>{metrics.errorRate}%</h2>
      </div>

      <div className="metric-card">
        <p>Errors</p>
        <h2>{metrics.errors}</h2>
      </div>
    </section>
  );
}

export default MetricsDashboard;