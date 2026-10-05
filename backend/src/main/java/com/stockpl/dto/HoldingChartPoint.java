package com.stockpl.dto;

import java.math.BigDecimal;

public record HoldingChartPoint(
        String symbol,
        BigDecimal totalCost
) {
}
