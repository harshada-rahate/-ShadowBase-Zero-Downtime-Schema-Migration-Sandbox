
import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import "./App.css";
import MetricsDashboard from "./MetricsDashboard";

const API = "http://localhost:8080";

function App() {
  const [status, setStatus] = useState("Checking...");
  const [customers, setCustomers] = useState([]);

  const [migrationSql, setMigrationSql] = useState(
    "ALTER TABLE customers ADD COLUMN address VARCHAR(200);"
  );

  const [message, setMessage] = useState("");

  // Migration History
  const [migrationHistory, setMigrationHistory] = useState([]);

  // --------------------------------------------------
  // CHECK CONTAINER STATUS
  // --------------------------------------------------
  const checkStatus = async () => {
    try {
      const response = await fetch(
        `${API}/api/container/status`
      );

      const data = await response.text();

      if (response.ok) {
        setStatus(data);
      } else {
        setStatus("Container Error");
      }
    } catch (error) {
      console.error("Status error:", error);
      setStatus("Backend Offline");
    }
  };

  // --------------------------------------------------
  // START CONTAINER
  // --------------------------------------------------
  const startContainer = async () => {
    try {
      setMessage("Starting database container...");

      const response = await fetch(
        `${API}/api/container/start`,
        {
          method: "POST",
        }
      );

      const data = await response.text();

      if (response.ok) {
        setMessage(`✅ ${data}`);
        await checkStatus();
      } else {
        setMessage(`❌ ${data}`);
      }
    } catch (error) {
      console.error("Start container error:", error);

      setMessage(
        "❌ Failed to connect to backend."
      );
    }
  };

  // --------------------------------------------------
  // SEED DATABASE
  // --------------------------------------------------
  const seedDatabase = async () => {
    try {
      setMessage("Seeding database...");

      const response = await fetch(
        `${API}/api/container/seed`,
        {
          method: "POST",
        }
      );

      const data = await response.text();

      if (response.ok) {
        setMessage(`✅ ${data}`);

        await loadCustomers();
      } else {
        setMessage(`❌ ${data}`);
      }
    } catch (error) {
      console.error("Seed error:", error);

      setMessage(
        "❌ Failed to seed database."
      );
    }
  };

  // --------------------------------------------------
  // LOAD CUSTOMERS
  // --------------------------------------------------
  const loadCustomers = async () => {
    try {
      const response = await fetch(
        `${API}/api/container/customers`
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(errorText);
      }

      const data = await response.json();

      setCustomers(data);
    } catch (error) {
      console.error(
        "Customer loading error:",
        error
      );

      setMessage(
        "❌ Could not load customers."
      );
    }
  };

  // --------------------------------------------------
  // RUN MIGRATION
  // --------------------------------------------------
  const runMigration = async () => {
    if (!migrationSql.trim()) {
      setMessage(
        "Please enter migration SQL."
      );
      return;
    }

    const migration = {
      id: Date.now(),
      sql: migrationSql,
      time: new Date().toLocaleString(),
      status: "Running",
    };

    // Add migration immediately
    setMigrationHistory((prev) => [
      migration,
      ...prev,
    ]);

    try {
      setMessage("Running migration...");

      const response = await fetch(
        `${API}/api/container/migrate`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            sql: migrationSql,
          }),
        }
      );

      const data = await response.text();

      // SUCCESS
      if (response.ok) {
        setMessage(`✅ ${data}`);

        setMigrationHistory((prev) =>
          prev.map((item) =>
            item.id === migration.id
              ? {
                  ...item,
                  status: "Success",
                }
              : item
          )
        );

        await loadCustomers();
      }

      // FAILED
      else {
        setMessage(`❌ ${data}`);

        setMigrationHistory((prev) =>
          prev.map((item) =>
            item.id === migration.id
              ? {
                  ...item,
                  status: "Failed",
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error(
        "Migration error:",
        error
      );

      setMessage(
        "❌ Migration request failed."
      );

      setMigrationHistory((prev) =>
        prev.map((item) =>
          item.id === migration.id
            ? {
                ...item,
                status: "Failed",
              }
            : item
        )
      );
    }
  };

  // --------------------------------------------------
  // ROLLBACK MIGRATION
  // --------------------------------------------------
  const rollbackMigration = async (
    migration
  ) => {
    try {
      setMessage(
        "Rolling back migration..."
      );

      const response = await fetch(
        `${API}/api/container/rollback`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            sql: migration.sql,
          }),
        }
      );

      const data = await response.text();

      if (response.ok) {
        setMessage(
          `✅ Rollback successful: ${data}`
        );

        setMigrationHistory((prev) =>
          prev.map((item) =>
            item.id === migration.id
              ? {
                  ...item,
                  status: "Rolled Back",
                }
              : item
          )
        );

        await loadCustomers();
      } else {
        setMessage(
          `❌ Rollback failed: ${data}`
        );
      }
    } catch (error) {
      console.error(
        "Rollback error:",
        error
      );

      setMessage(
        "❌ Rollback request failed."
      );
    }
  };

  // --------------------------------------------------
  // STOP CONTAINER
  // --------------------------------------------------
  const stopContainer = async () => {
    try {
      setMessage(
        "Stopping database container..."
      );

      const response = await fetch(
        `${API}/api/container/stop`,
        {
          method: "POST",
        }
      );

      const data = await response.text();

      if (response.ok) {
        setMessage(`✅ ${data}`);

        setCustomers([]);

        await checkStatus();
      } else {
        setMessage(`❌ ${data}`);
      }
    } catch (error) {
      console.error(
        "Stop container error:",
        error
      );

      setMessage(
        "❌ Failed to stop container."
      );
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------
  useEffect(() => {
    checkStatus();
    loadCustomers();
  }, []);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="header">

        <div>
          <h1>ShadowBase</h1>

          <p>
            Zero-Downtime Schema Migration Sandbox
          </p>
        </div>

        <div className="status">

          <span className="status-dot"></span>

          {status}

        </div>

      </header>


      <main className="dashboard">

        {/* ================= HERO ================= */}

        <section className="hero-card">

          <div>

            <span className="badge">
              DATABASE MIGRATION PLATFORM
            </span>

            <h2>
              Test database schema changes
              <br />

              <span>
                without touching production.
              </span>
            </h2>

            <p>
              ShadowBase creates an isolated
              PostgreSQL environment where
              migration SQL can be tested safely
              before deployment.
            </p>

          </div>

          <div className="hero-icon">
            DB
          </div>

        </section>


        {/* ================= METRICS ================= */}

        <MetricsDashboard />


        {/* ================= MAIN CARDS ================= */}

        <section className="cards">


          {/* CONTAINER CARD */}

          <div className="card">

            <div className="card-icon">
              01
            </div>

            <h3>
              Database Container
            </h3>

            <p>
              Start and manage an isolated
              PostgreSQL container for migration
              testing.
            </p>

            <div className="button-group">

              <button
                onClick={startContainer}
              >
                Start Container
              </button>

              <button
                className="secondary"
                onClick={checkStatus}
              >
                Check Status
              </button>

            </div>

          </div>


          {/* SEED CARD */}

          <div className="card">

            <div className="card-icon">
              02
            </div>

            <h3>
              Seed Database
            </h3>

            <p>
              Create the initial database schema
              and sample customer records.
            </p>

            <button
              onClick={seedDatabase}
            >
              Seed Database
            </button>

          </div>


          {/* MIGRATION RUNNER */}

          <div className="card">

            <div className="card-icon">
              03
            </div>

            <h3>
              Migration Runner
            </h3>

            <p>
              Execute schema changes inside
              the ShadowBase environment.
            </p>


            {/* MONACO EDITOR */}

            <div className="editor-container">

              <Editor
                height="180px"

                defaultLanguage="sql"

                theme="vs-dark"

                value={migrationSql}

                onChange={(value) =>
                  setMigrationSql(
                    value || ""
                  )
                }

                options={{
                  minimap: {
                    enabled: false,
                  },

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


            <button
              onClick={runMigration}
            >
              Run Migration
            </button>

          </div>

        </section>


        {/* ================= MIGRATION HISTORY ================= */}

        <section className="database-section">

          <div className="section-header">

            <div>

              <span className="badge">
                MIGRATION LOG
              </span>

              <h2>
                Migration History
              </h2>

            </div>

          </div>


          <div className="migration-history">

            {migrationHistory.length === 0 ? (

              <div className="empty">

                No migrations executed yet.

              </div>

            ) : (

              migrationHistory.map(
                (migration, index) => (

                  <div
                    className="migration-item"
                    key={migration.id}
                  >

                    <div className="migration-info">

                      <strong>
                        Migration #
                        {migrationHistory.length -
                          index}
                      </strong>

                      <span>
                        {migration.time}
                      </span>

                      <code>
                        {migration.sql}
                      </code>

                    </div>


                    <div className="migration-actions">

                      <span
                        className={`migration-status ${migration.status
                          .toLowerCase()
                          .replace(
                            " ",
                            "-"
                          )}`}
                      >
                        {migration.status}
                      </span>


                      {/* ROLLBACK */}

                      {migration.status ===
                        "Success" && (

                        <button
                          className="danger"
                          onClick={() =>
                            rollbackMigration(
                              migration
                            )
                          }
                        >
                          Rollback
                        </button>

                      )}

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </section>


        {/* ================= DATABASE SECTION ================= */}

        <section className="database-section">

          <div className="section-header">

            <div>

              <span className="badge">
                SHADOW DATABASE
              </span>

              <h2>
                Customers Table
              </h2>

            </div>


            <button
              className="secondary"
              onClick={loadCustomers}
            >
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

                  customers.map(
                    (customer, index) => (

                      <tr
                        key={
                          customer.id ||
                          index
                        }
                      >

                        <td>
                          {customer.id}
                        </td>

                        <td>
                          {customer.name}
                        </td>

                        <td>
                          {customer.email}
                        </td>

                        <td>
                          {customer.phone ||
                            "-"}
                        </td>

                        <td>
                          {customer.city ||
                            "-"}
                        </td>

                        <td>
                          {customer.address ||
                            "-"}
                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="6"
                      className="empty"
                    >
                      No customer records
                      loaded.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* ================= BOTTOM SECTION ================= */}

        <section className="bottom-section">

          <div className="message-box">

            <strong>
              System Message
            </strong>

            <p>
              {message || "Ready."}
            </p>

          </div>


          <button
            className="danger"
            onClick={stopContainer}
          >
            Stop Container
          </button>

        </section>

      </main>

    </div>
  );
}

export default App;
```
