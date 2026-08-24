package com.shadowbase.shadowbasebackend.service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

import org.springframework.stereotype.Service;
import org.testcontainers.containers.PostgreSQLContainer;

@Service
public class ContainerService {

    private PostgreSQLContainer<?> postgresContainer;

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

    public String getStatus() {

        if (postgresContainer != null && postgresContainer.isRunning()) {
            return "Shadow PostgreSQL container is RUNNING";
        }

        return "Shadow PostgreSQL container is STOPPED";
    }

    public String stopContainer() {

        if (postgresContainer != null && postgresContainer.isRunning()) {
            postgresContainer.stop();
            return "Shadow PostgreSQL container stopped successfully!";
        }

        return "No running Shadow PostgreSQL container found.";
    }
    public String seedDatabase() {

        if (postgresContainer == null || !postgresContainer.isRunning()) {
            return "No running Shadow PostgreSQL container found.";
        }
        String jdbcUrl = postgresContainer.getJdbcUrl() ;
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
    public String getCustomers() {

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
                     "SELECT id, name, email FROM customers")) {

            while (resultSet.next()) {
                result.append("ID: ")
                      .append(resultSet.getInt("id"))
                      .append(", Name: ")
                      .append(resultSet.getString("name"))
                      .append(", Email: ")
                      .append(resultSet.getString("email"))
                      .append("\n");
            }

            return result.toString();

        } catch (SQLException e) {
            return "Failed to fetch customers: " + e.getMessage();
        }
    }
    public String executeMigration(String sql) {

        if (postgresContainer == null || !postgresContainer.isRunning()) {
            return "No running Shadow PostgreSQL container found.";
        }

        String jdbcUrl = postgresContainer.getJdbcUrl();
        String username = postgresContainer.getUsername();
        String password = postgresContainer.getPassword();

        try (Connection connection =
                     DriverManager.getConnection(jdbcUrl, username, password);
             Statement statement = connection.createStatement()) {

            statement.execute(sql);

            return "Migration executed successfully!";

        } catch (SQLException e) {
            return "Migration failed: " + e.getMessage();
        }
    }
}