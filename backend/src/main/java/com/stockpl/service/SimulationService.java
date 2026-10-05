package com.stockpl.service;

import com.stockpl.dto.HoldingSummary;
import com.stockpl.dto.SimulationRequest;
import com.stockpl.dto.SimulationResult;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class SimulationService {

    private static final int CALCULATION_SCALE = 8;
    private static final int MONEY_SCALE = 2;
    private static final int RATE_SCALE = 2;

    private final PortfolioService portfolioService;

    public SimulationService(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    public SimulationResult simulate(SimulationRequest request) {
        String symbol = request.symbol().trim().toUpperCase();
        HoldingSummary holding = portfolioService.getSummary().holdings().stream()
                .filter(h -> h.symbol().equals(symbol))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No holdings for symbol: " + symbol
                ));

        BigDecimal changeFactor = BigDecimal.ONE.add(
                request.changePercent().divide(BigDecimal.valueOf(100), CALCULATION_SCALE, RoundingMode.HALF_UP)
        );
        BigDecimal simulationPrice = request.currentPrice()
                .multiply(changeFactor)
                .setScale(MONEY_SCALE, RoundingMode.HALF_UP);

        int quantity = holding.quantity();
        BigDecimal costAmount = holding.averageCost()
                .multiply(BigDecimal.valueOf(quantity))
                .setScale(MONEY_SCALE, RoundingMode.HALF_UP);
        BigDecimal evaluationAmount = simulationPrice
                .multiply(BigDecimal.valueOf(quantity))
                .setScale(MONEY_SCALE, RoundingMode.HALF_UP);
        BigDecimal profit = evaluationAmount.subtract(costAmount);
        BigDecimal profitRate = costAmount.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : profit.divide(costAmount, CALCULATION_SCALE, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(RATE_SCALE, RoundingMode.HALF_UP);

        return new SimulationResult(
                symbol,
                request.currentPrice(),
                request.changePercent(),
                simulationPrice,
                quantity,
                costAmount,
                evaluationAmount,
                profit,
                profitRate
        );
    }
}
