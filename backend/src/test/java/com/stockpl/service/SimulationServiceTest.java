package com.stockpl.service;

import com.stockpl.dto.CreateTransactionRequest;
import com.stockpl.dto.SimulationRequest;
import com.stockpl.model.TransactionType;
import com.stockpl.repository.TransactionRepository;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SimulationServiceTest {

    private PortfolioService portfolioService;
    private SimulationService simulationService;
    private Validator validator;

    @BeforeEach
    void setUp() {
        TransactionRepository repository = new TransactionRepository();
        portfolioService = new PortfolioService(repository);
        simulationService = new SimulationService(portfolioService);
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void simulatesWithZeroChangePercent() {
        setup7203Holdings();

        var result = simulationService.simulate(request("7203", "2600", "0"));

        assertEquals(new BigDecimal("2600.00"), result.simulationPrice());
        assertEquals(150, result.quantity());
        assertEquals(new BigDecimal("390000.00"), result.costAmount());
        assertEquals(new BigDecimal("390000.00"), result.evaluationAmount());
        assertEquals(new BigDecimal("0.00"), result.profit());
        assertEquals(new BigDecimal("0.00"), result.profitRate());
    }

    @Test
    void simulatesWithMinusTenPercentChange() {
        setup7203Holdings();

        var result = simulationService.simulate(request("7203", "2500", "-10"));

        assertEquals(new BigDecimal("2250.00"), result.simulationPrice());
        assertEquals(new BigDecimal("390000.00"), result.costAmount());
        assertEquals(new BigDecimal("337500.00"), result.evaluationAmount());
        assertEquals(new BigDecimal("-52500.00"), result.profit());
        assertEquals(new BigDecimal("-13.46"), result.profitRate());
    }

    @Test
    void simulatesWithPlusTenPercentChange() {
        setup7203Holdings();

        var result = simulationService.simulate(request("7203", "2500", "10"));

        assertEquals(new BigDecimal("2750.00"), result.simulationPrice());
        assertEquals(new BigDecimal("390000.00"), result.costAmount());
        assertEquals(new BigDecimal("412500.00"), result.evaluationAmount());
        assertEquals(new BigDecimal("22500.00"), result.profit());
        assertEquals(new BigDecimal("5.77"), result.profitRate());
    }

    @Test
    void rejectsSymbolWithNoHoldings() {
        setup7203Holdings();

        assertThrows(ResponseStatusException.class, () ->
                simulationService.simulate(request("9999", "2500", "0")));
    }

    @Test
    void rejectsInvalidPrice() {
        Set<?> violations = validator.validate(request("7203", "0", "0"));

        assertFalse(violations.isEmpty());
    }

    private void setup7203Holdings() {
        portfolioService.addTransaction(buy("7203", 100, "2500", "2024-01-10"));
        portfolioService.addTransaction(buy("7203", 100, "2700", "2024-02-10"));
        portfolioService.addTransaction(sell("7203", 50, "3000", "2024-03-10"));
    }

    private static SimulationRequest request(String symbol, String currentPrice, String changePercent) {
        return new SimulationRequest(
                symbol,
                new BigDecimal(currentPrice),
                new BigDecimal(changePercent)
        );
    }

    private static CreateTransactionRequest buy(String symbol, int qty, String price, String date) {
        return new CreateTransactionRequest(
                symbol,
                TransactionType.BUY,
                qty,
                new BigDecimal(price),
                LocalDate.parse(date)
        );
    }

    private static CreateTransactionRequest sell(String symbol, int qty, String price, String date) {
        return new CreateTransactionRequest(
                symbol,
                TransactionType.SELL,
                qty,
                new BigDecimal(price),
                LocalDate.parse(date)
        );
    }
}
