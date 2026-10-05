package com.stockpl.dto;

import java.math.BigDecimal;
import java.util.List;

public record PortfolioSummary(
        BigDecimal totalInvested,
        BigDecimal realizedProfit,
        int totalTransactions,
        List<HoldingSummary> holdings
) {
}
