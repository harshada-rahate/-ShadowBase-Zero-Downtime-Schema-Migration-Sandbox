package com.shadowbase.shadowbasebackend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shadowbase.shadowbasebackend.service.ContainerService;

@RestController
@RequestMapping("/api/container")
public class ContainerController {

    private final ContainerService containerService;

    public ContainerController(ContainerService containerService) {
        this.containerService = containerService;
    }

    @PostMapping("/start")
    public String startContainer() {
        return containerService.startContainer();
    }

    @GetMapping("/status")
    public String getStatus() {
        return containerService.getStatus();
    }
    
    @PostMapping("/seed")
    public String seedDatabase() {
        return containerService.seedDatabase();
    }
    @GetMapping("/customers")
    public String getCustomers() {
        return containerService.getCustomers();
    }
    @PostMapping("/migrate")
    public String executeMigration(@RequestBody String sql) {
        return containerService.executeMigration(sql);
    }
    
    @PostMapping("/rollback")
    public String rollbackMigration(@RequestBody String sql) {
        return containerService.rollbackMigration(sql);
    }
    
    @GetMapping("/migrations")
    public String getMigrationHistory() {
        return containerService.getMigrationHistory();
    } 
    @PostMapping("/stop")
    public String stopContainer() {
        return containerService.stopContainer();
    }
}