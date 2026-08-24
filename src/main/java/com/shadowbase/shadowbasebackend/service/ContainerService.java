package com.shadowbase.shadowbasebackend.service;

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
                .withPassword("shadowbase");

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
}