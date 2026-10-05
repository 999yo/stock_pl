package com.stockpl.dto;

import com.stockpl.model.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateTransactionRequest(
        @NotBlank String symbol,
        @NotNull TransactionType type,
        @Min(1) int quantity,
        @NotNull @DecimalMin("0.01") BigDecimal price,
        @NotNull LocalDate tradedAt
) {
}
