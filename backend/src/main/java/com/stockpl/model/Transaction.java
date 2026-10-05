package com.stockpl.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public record Transaction(
        Long id,
        String symbol,
        TransactionType type,
        int quantity,
        BigDecimal price,
        LocalDate tradedAt
) {
}
