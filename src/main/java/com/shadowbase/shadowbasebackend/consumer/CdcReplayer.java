package com.shadowbase.shadowbasebackend.consumer;

import com.shadowbase.shadowbasebackend.service.MetricsService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.messaging.handler.annotation.Payload;

@Component
public class CdcReplayer {

    private final MetricsService metricsService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public CdcReplayer(MetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @KafkaListener(
            topics = "shadowbase.public.customers",
            groupId = "shadowbase-replayer"
    )
    public void consume(@Payload(required = false) String message) {
    	if (message == null || message.trim().isEmpty()) {
    	    System.out.println("Empty CDC message received. Ignoring...");
    	    return;
    	}

        try {
            System.out.println("CDC Event Received:");
            System.out.println(message);

            JsonNode root = objectMapper.readTree(message);
            JsonNode payload = root.get("payload");

            String operation = payload.get("op").asText();

            switch (operation) {
                case "c":
                    System.out.println("Operation: INSERT");
                    break;

                case "u":
                    System.out.println("Operation: UPDATE");
                    break;

                case "d":
                    System.out.println("Operation: DELETE");
                    break;

                default:
                    System.out.println("Operation: UNKNOWN");
            }

            metricsService.incrementQueriesReplayed();

        } catch (Exception e) {
            metricsService.incrementErrors();
            System.err.println("CDC Replay Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}