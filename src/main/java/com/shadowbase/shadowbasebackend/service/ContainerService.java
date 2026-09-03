package com.shadowbase.shadowbasebackend.service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.testcontainers.containers.PostgreSQLContainer;

@Service
public class ContainerService {

    private PostgreSQLContainer<?> postgresContainer;

    // =========================
    // START CONTAINER
    // =========================

    public String startContainer() {

        if (postgresContainer != null && postgresContainer.isRunning()) {
            return "PostgreSQL container is already running!";
        }

        postgresContainer = new PostgreSQLContainer<>("postgres:16")
                .withDatabaseName("shadowbase")
                .withUsername("shadowbase")
                .withPassword("shadowbase123");

        postgresContainer.start();

        return "PostgreSQL Shadow container started successfully on port: "
                + postgresContainer.getMappedPort(5432);
    }

    // =========================
    // STATUS
    // =========================

    public String getStatus() {

        if (postgresContainer != null && postgresContainer.isRunning()) {
            return "Shadow PostgreSQL container is RUNNING";
        }

        return "Shadow PostgreSQL container is STOPPED";
    }

    // =========================
    // STOP CONTAINER
    // =========================

    public String stopContainer() {

        if (postgresContainer != null && postgresContainer.isRunning()) {

            postgresContainer.stop();

            return "Shadow PostgreSQL container stopped successfully!";
        }

        return "No running Shadow PostgreSQL container found.";
    }

    // =========================
    // SEED DATABASE
    // =========================

    public String seedDatabase() {

        if (postgresContainer == null || !postgresContainer.isRunning()) {
            return "No running Shadow PostgreSQL container found.";
        }

        String jdbcUrl = postgresContainer.getJdbcUrl();
        String username = postgresContainer.getUsername();
        String password = postgresContainer.getPassword();

        try (Connection connection =
                     DriverManager.getConnection(jdbcUrl, username, password);
             Statement statement = connection.createStatement()) {

            statement.execute("""
                CREATE TABLE IF NOT EXISTS customers (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100),
                    email VARCHAR(150)
                )
            """);

            statement.execute("""
                CREATE TABLE IF NOT EXISTS migration_history (
                    id SERIAL PRIMARY KEY,
                    migration_sql TEXT NOT NULL,
                    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """);

            statement.execute("""
                INSERT INTO customers (name, email)
                VALUES
                    ('Harshada', 'harshada@example.com'),
                    ('Rahul', 'rahul@example.com'),
                    ('Priya', 'priya@example.com')
            """);

            return "Shadow database seeded successfully!";

        } catch (SQLException e) {

            return "Failed to seed Shadow database: " + e.getMessage();
        }
    }

    // =========================
    // GET CUSTOMERS
    // =========================

    public List<Map<String, Object>> getCustomers() {

        List<Map<String, Object>> customers = new ArrayList<>();

        if (postgresContainer == null || !postgresContainer.isRunning()) {
            return customers;
        }

        String jdbcUrl = postgresContainer.getJdbcUrl();
        String username = postgresContainer.getUsername();
        String password = postgresContainer.getPassword();

        try (Connection connection =
                     DriverManager.getConnection(jdbcUrl, username, password);
             Statement statement = connection.createStatement();
             var resultSet = statement.executeQuery(
                     "SELECT id, name, email, " +
                     "NULL AS phone, NULL AS city, " +
                     "address FROM customers")) {

            while (resultSet.next()) {

                Map<String, Object> customer = new HashMap<>();

                customer.put("id", resultSet.getInt("id"));
                customer.put("name", resultSet.getString("name"));
                customer.put("email", resultSet.getString("email"));
                customer.put("phone", resultSet.getString("phone"));
                customer.put("city", resultSet.getString("city"));
                customer.put("address", resultSet.getString("address"));

                customers.add(customer);
            }

            return customers;

        } catch (SQLException e) {

            throw new RuntimeException(
                    "Failed to fetch customers: " + e.getMessage());
        }
    }

    // =========================
    // EXECUTE MIGRATION
    // =========================

    public String executeMigration(String sql) {

        if (postgresContainer == null || !postgresContainer.isRunning()) {
            return "No running Shadow PostgreSQL container found.";
        }

        String normalizedSql = sql.trim().toUpperCase();

        if (normalizedSql.startsWith("DROP DATABASE")
                || normalizedSql.startsWith("DROP SCHEMA")) {

            return "Migration blocked: Dangerous SQL operation is not allowed!";
        }

        String jdbcUrl = postgresContainer.getJdbcUrl();
        String username = postgresContainer.getUsername();
        String password = postgresContainer.getPassword();

        try (Connection connection =
                     DriverManager.getConnection(jdbcUrl, username, password);
             Statement statement = connection.createStatement()) {

            statement.execute(sql);

            String historySql =
                    "INSERT INTO migration_history (migration_sql) VALUES (?)";

            try (var preparedStatement =
                         connection.prepareStatement(historySql)) {

                preparedStatement.setString(1, sql);
                preparedStatement.executeUpdate();
            }

            return "Migration executed successfully!";

        } catch (SQLException e) {

            return "Migration failed: " + e.getMessage();
        }
    }

    // =========================
    // MIGRATION HISTORY
    // =========================

    public String getMigrationHistory() {

        if (postgresContainer == null || !postgresContainer.isRunning()) {
            return "No running Shadow PostgreSQL container found.";
        }

        String jdbcUrl = postgresContainer.getJdbcUrl();
        String username = postgresContainer.getUsername();
        String password = postgresContainer.getPassword();

        StringBuilder result = new StringBuilder();

        try (Connection connection =
                     DriverManager.getConnection(jdbcUrl, username, password);
             Statement statement = connection.createStatement();
             var resultSet = statement.executeQuery(
                     "SELECT id, migration_sql, executed_at " +
                     "FROM migration_history ORDER BY id")) {

            while (resultSet.next()) {

                result.append("ID: ")
                      .append(resultSet.getInt("id"))
                      .append(", SQL: ")
                      .append(resultSet.getString("migration_sql"))
                      .append(", Executed At: ")
                      .append(resultSet.getTimestamp("executed_at"))
                      .append("\n");
            }

            if (result.length() == 0) {
                return "No migrations found.";
            }

            return result.toString();

        } catch (SQLException e) {

            return "Failed to fetch migration history: "
                    + e.getMessage();
        }
    }

    // =========================
    // ROLLBACK MIGRATION
    // =========================

    public String rollbackMigration(String sql) {

        if (postgresContainer == null || !postgresContainer.isRunning()) {
            return "No running Shadow PostgreSQL container found.";
        }

        if (sql == null || sql.trim().isEmpty()) {
            return "Rollback SQL cannot be empty.";
        }

        String jdbcUrl = postgresContainer.getJdbcUrl();
        String username = postgresContainer.getUsername();
        String password = postgresContainer.getPassword();

        try (Connection connection =
                     DriverManager.getConnection(jdbcUrl, username, password);
             Statement statement = connection.createStatement()) {

            statement.execute(sql);

            return "Rollback executed successfully!";

        } catch (SQLException e) {

            return "Rollback failed: " + e.getMessage();
        }
    }
}