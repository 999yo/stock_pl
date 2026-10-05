package com.stockpl.controller;

import com.stockpl.dto.SimulationRequest;
import com.stockpl.dto.SimulationResult;
import com.stockpl.service.SimulationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SimulationController {

    private final SimulationService simulationService;

    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @PostMapping("/simulation")
    public SimulationResult simulate(@Valid @RequestBody SimulationRequest request) {
        return simulationService.simulate(request);
    }
}
