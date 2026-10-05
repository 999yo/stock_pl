package com.stockpl.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProfitChartPoint(
        LocalDate date,
        BigDecimal cumulativeRealizedProfit
) {
}
