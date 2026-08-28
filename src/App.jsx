import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import "./App.css";

const API = "http://localhost:8080";

function App() {
  const [status, setStatus] = useState("Checking...");
  const [customers, setCustomers] = useState([]);
  const [migrationSql, setMigrationSql] = useState(
     "ALTER TABLE customers ADD COLUMN address VARCHAR(200);"
  );
  const [message, setMessage] = useState("");
  const [metrics, setMetrics] = useState({
  replayed: 0,
  successful: 0,
  errors: 0,
});

  const checkStatus = async () => {
    try {
      const response = await fetch(`${API}/api/container/status`);
      const data = await response.text();
      setStatus(data);
    } catch (error) {
      setStatus("Backend Offline");
    }
  };

  const startContainer = async () => {
    try {
      setMessage("Starting database container...");

      const response = await fetch(`${API}/api/container/start`, {
        method: "POST",
      });

      const data = await response.text();
      setMessage(data);
      checkStatus();
    } catch (error) {
      setMessage("Failed to start container.");
    }
  };

  const seedDatabase = async () => {
    try {
      setMessage("Seeding database...");

      const response = await fetch(`${API}/api/container/seed`, {
        method: "POST",
      });

      const data = await response.text();
      setMessage(data);
      loadCustomers();
    } catch (error) {
      setMessage("Failed to seed database.");
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await fetch(`${API}/api/container/customers`);
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      setMessage("Could not load customers.");
    }
  };
const runMigration = async () => {
  if (!migrationSql.trim()) {
    setMessage("Please enter migration SQL.");
    return;
  }

  try {
    setMessage("Running migration...");

    const response = await fetch(`${API}/api/container/migrate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sql: migrationSql,
      }),
    });

    const data = await response.text();

    if (response.ok) {
      setMessage(`✅ ${data}`);

      setMetrics((prev) => ({
        ...prev,
        replayed: prev.replayed + 1,
        successful: prev.successful + 1,
      }));

      loadCustomers();
    } else {
      setMessage(`❌ ${data}`);

      setMetrics((prev) => ({
        ...prev,
        replayed: prev.replayed + 1,
        errors: prev.errors + 1,
      }));
    }
  } catch (error) {
    setMessage("❌ Migration request failed.");

    setMetrics((prev) => ({
      ...prev,
      replayed: prev.replayed + 1,
      errors: prev.errors + 1,
    }));
  }
};
  

  const stopContainer = async () => {
    try {
      setMessage("Stopping database container...");

      const response = await fetch(`${API}/api/container/stop`, {
        method: "POST",
      });

      const data = await response.text();
      setMessage(data);
      checkStatus();
    } catch (error) {
      setMessage("Failed to stop container.");
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>ShadowBase</h1>
          <p>Zero-Downtime Schema Migration Sandbox</p>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          {status}
        </div>
      </header>

      <main className="dashboard">
        <section className="hero-card">
          <div>
            <span className="badge">DATABASE MIGRATION PLATFORM</span>

            <h2>
              Test database schema changes
              <br />
              <span>without touching production.</span>
            </h2>

            <p>
              ShadowBase creates an isolated PostgreSQL environment where
              migration SQL can be tested safely before deployment.
            </p>
          </div>

          <div className="hero-icon">DB</div>
        </section>
          <section className="metrics-section">
  <div className="metric-card">
    <p>Queries Replayed</p>
    <h2>{metrics.replayed}</h2>
  </div>

  <div className="metric-card">
    <p>Successful</p>
    <h2>{metrics.successful}</h2>
  </div>

  <div className="metric-card">
    <p>SQL Errors</p>
    <h2>{metrics.errors}</h2>
  </div>

  <div className="metric-card">
    <p>Error Rate</p>
    <h2>
      {metrics.replayed === 0
        ? "0%"
        : `${((metrics.errors / metrics.replayed) * 100).toFixed(1)}%`}
    </h2>
  </div>
</section>
        <section className="cards">
          <div className="card">
            <div className="card-icon">01</div>
            <h3>Database Container</h3>
            <p>
              Start and manage an isolated PostgreSQL container for migration
              testing.
            </p>

            <div className="button-group">
              <button onClick={startContainer}>Start Container</button>
              <button className="secondary" onClick={checkStatus}>
                Check Status
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-icon">02</div>
            <h3>Seed Database</h3>
            <p>
              Create the initial database schema and sample customer records.
            </p>

            <button onClick={seedDatabase}>Seed Database</button>
          </div>

          <div className="card">
            <div className="card-icon">03</div>
            <h3>Migration Runner</h3>
            <p>
              Execute schema changes inside the ShadowBase environment.
            </p>

            <div className="editor-container">
  <Editor
    height="180px"
    defaultLanguage="sql"
    theme="vs-dark"
    value={migrationSql}
    onChange={(value) => setMigrationSql(value || "")}
    options={{
      minimap: { enabled: false },
      fontSize: 14,
      wordWrap: "on",
      automaticLayout: true,
      lineNumbers: "on",
      scrollBeyondLastLine: false,
      padding: {
        top: 12,
        bottom: 12,
      },
    }}
  />
</div>

            <button onClick={runMigration}>Run Migration</button>
          </div>
        </section>

        <section className="database-section">
          <div className="section-header">
            <div>
              <span className="badge">SHADOW DATABASE</span>
              <h2>Customers Table</h2>
            </div>

            <button className="secondary" onClick={loadCustomers}>
              Refresh
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Address</th>
                </tr>
              </thead>

              <tbody>
                {customers.length > 0 ? (
                  customers.map((customer, index) => (
                    <tr key={customer.id || index}>
                      <td>{customer.id}</td>
                      <td>{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone || "-"}</td>
                      <td>{customer.city || "-"}</td>
                      <td>{customer.address || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty">
                      No customer records loaded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bottom-section">
          <div className="message-box">
            <strong>System Message</strong>
            <p>{message || "Ready."}</p>
          </div>

          <button className="danger" onClick={stopContainer}>
            Stop Container
          </button>
        </section>
      </main>
    </div>
  );
}

export default App;