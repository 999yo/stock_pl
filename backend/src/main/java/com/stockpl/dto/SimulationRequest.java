package com.stockpl.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record SimulationRequest(
        @NotBlank String symbol,
        @NotNull @DecimalMin("0.01") BigDecimal currentPrice,
        @NotNull BigDecimal changePercent
) {
}
