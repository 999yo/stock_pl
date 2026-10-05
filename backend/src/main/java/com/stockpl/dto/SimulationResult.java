package com.stockpl.dto;

import java.math.BigDecimal;

public record SimulationResult(
        String symbol,
        BigDecimal currentPrice,
        BigDecimal changePercent,
        BigDecimal simulationPrice,
        int quantity,
        BigDecimal costAmount,
        BigDecimal evaluationAmount,
        BigDecimal profit,
        BigDecimal profitRate
) {
}
