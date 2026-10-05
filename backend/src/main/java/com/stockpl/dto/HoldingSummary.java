package com.stockpl.dto;

import java.math.BigDecimal;

public record HoldingSummary(
        String symbol,
        int quantity,
        BigDecimal averageCost,
        BigDecimal totalCost
) {
}
