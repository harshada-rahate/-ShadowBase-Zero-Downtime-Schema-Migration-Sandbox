package com.shadowbase.shadowbasebackend.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class MetricsService {

    private int queriesReplayed = 0;
    private int errors = 0;

    public synchronized void incrementQueriesReplayed() {
        queriesReplayed++;
    }

    public synchronized void incrementErrors() {
        errors++;
    }

    public synchronized Map<String, Object> getMetrics() {

        double errorRate = queriesReplayed == 0
                ? 0.0
                : ((double) errors / queriesReplayed) * 100;

        Map<String, Object> metrics = new HashMap<>();

        metrics.put("queriesReplayed", queriesReplayed);
        metrics.put("errors", errors);
        metrics.put("errorRate", errorRate);

        return metrics;
    }
}