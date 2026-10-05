package com.stockpl.service;

import com.stockpl.dto.CreateTransactionRequest;
import com.stockpl.model.TransactionType;
import com.stockpl.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PortfolioServiceTest {

    private PortfolioService portfolioService;

    @BeforeEach
    void setUp() {
        TransactionRepository repository = new TransactionRepository();
        portfolioService = new PortfolioService(repository);
    }

    @Test
    void calculatesAverageCostAndRealizedProfit() {
        portfolioService.addTransaction(buy("7203", 100, "2500", "2024-01-10"));
        portfolioService.addTransaction(buy("7203", 100, "2700", "2024-02-10"));
        portfolioService.addTransaction(sell("7203", 50, "3000", "2024-03-10"));

        var summary = portfolioService.getSummary();

        assertEquals(new BigDecimal("20000.00"), summary.realizedProfit());
        assertEquals(1, summary.holdings().size());
        assertEquals(150, summary.holdings().getFirst().quantity());
        assertEquals(new BigDecimal("2600.0000"), summary.holdings().getFirst().averageCost());
    }

    @Test
    void rejectsSellWhenInsufficientHoldings() {
        portfolioService.addTransaction(buy("9984", 10, "8000", "2024-01-10"));

        assertThrows(ResponseStatusException.class, () ->
                portfolioService.addTransaction(sell("9984", 20, "9000", "2024-02-10")));
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
