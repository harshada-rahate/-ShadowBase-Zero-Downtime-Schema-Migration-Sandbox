import { useEffect, useState } from "react";

const API = "http://localhost:8080";

function MetricsDashboard() {
  const [metrics, setMetrics] = useState({
    queriesReplayed: 0,
    errors: 0,
    errorRate: 0,
  });

  const fetchMetrics = async () => {
    try {
      const response = await fetch(
        `${API}/api/metrics?_=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(`Metrics API error: ${response.status}`);
      }

      const data = await response.json();

      console.log("CDC Metrics:", data);

      setMetrics({
        queriesReplayed: Number(data.queriesReplayed || 0),
        errors: Number(data.errors || 0),
        errorRate: Number(data.errorRate || 0),
      });
    } catch (error) {
      console.error("Metrics error:", error);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Refresh metrics every second
    const interval = setInterval(() => {
      fetchMetrics();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="metrics-section">

      <div className="metric-card">
        <p>Queries Replayed</p>
        <h2>{metrics.queriesReplayed}</h2>
        <span>CDC Traffic</span>
      </div>

      <div className="metric-card">
        <p>Error Rate</p>
        <h2>{metrics.errorRate.toFixed(2)}%</h2>
        <span>Migration Safety</span>
      </div>

      <div className="metric-card">
        <p>Errors</p>
        <h2>{metrics.errors}</h2>
        <span>SQL Exceptions</span>
      </div>

    </section>
  );
}

export default MetricsDashboard;