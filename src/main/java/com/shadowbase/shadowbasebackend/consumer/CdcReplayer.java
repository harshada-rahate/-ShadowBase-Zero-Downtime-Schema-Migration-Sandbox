package com.shadowbase.shadowbasebackend.consumer;

import com.shadowbase.shadowbasebackend.service.MetricsService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class CdcReplayer {

    private final MetricsService metricsService;

    public CdcReplayer(MetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @KafkaListener(
            topics = "shadowbase.public.customers",
            groupId = "shadowbase-replayer"
    )
    public void consume(String message) {

        try {
            System.out.println("CDC Event Received:");
            System.out.println(message);

            // CDC event successfully received/replayed
            metricsService.incrementQueriesReplayed();

        } catch (Exception e) {

            metricsService.incrementErrors();

            System.err.println("CDC Replay Error: " + e.getMessage());
        }
    }
}