package com.shadowbase.shadowbasebackend.service;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

@Service
public class CdcReplayService {

    private final ContainerService containerService;

    public CdcReplayService(ContainerService containerService) {
        this.containerService = containerService;
    }

    public void replayInsert(JsonNode after) throws Exception {

        String jdbcUrl = containerService.getJdbcUrl();
        String username = containerService.getUsername();
        String password = containerService.getPassword();

        String sql = """
                INSERT INTO customers (id, name, email)
                VALUES (?, ?, ?)
                """;

        try (Connection connection =
                     DriverManager.getConnection(jdbcUrl, username, password);
             PreparedStatement statement =
                     connection.prepareStatement(sql)) {

            statement.setInt(1, after.get("id").asInt());
            statement.setString(2, after.get("name").asText());
            statement.setString(3, after.get("email").asText());

            statement.executeUpdate();
        }
    }

    public void replayUpdate(JsonNode after) throws Exception {

        String jdbcUrl = containerService.getJdbcUrl();
        String username = containerService.getUsername();
        String password = containerService.getPassword();

        String sql = """
                UPDATE customers
                SET name = ?, email = ?
                WHERE id = ?
                """;

        try (Connection connection =
                     DriverManager.getConnection(jdbcUrl, username, password);
             PreparedStatement statement =
                     connection.prepareStatement(sql)) {

            statement.setString(1, after.get("name").asText());
            statement.setString(2, after.get("email").asText());
            statement.setInt(3, after.get("id").asInt());

            statement.executeUpdate();
        }
    }

    public void replayDelete(JsonNode before) throws Exception {

        String jdbcUrl = containerService.getJdbcUrl();
        String username = containerService.getUsername();
        String password = containerService.getPassword();

        String sql = """
                DELETE FROM customers
                WHERE id = ?
                """;

        try (Connection connection =
                     DriverManager.getConnection(jdbcUrl, username, password);
             PreparedStatement statement =
                     connection.prepareStatement(sql)) {

            statement.setInt(1, before.get("id").asInt());

            statement.executeUpdate();
        }
    }
}