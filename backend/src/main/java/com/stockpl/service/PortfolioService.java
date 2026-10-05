package com.stockpl.service;

import com.stockpl.dto.CreateTransactionRequest;
import com.stockpl.dto.HoldingChartPoint;
import com.stockpl.dto.HoldingSummary;
import com.stockpl.dto.PortfolioSummary;
import com.stockpl.dto.ProfitChartPoint;
import com.stockpl.model.Transaction;
import com.stockpl.model.TransactionType;
import com.stockpl.repository.TransactionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PortfolioService {

    private static final int SCALE = 4;

    private final TransactionRepository transactionRepository;

    public PortfolioService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<Transaction> listTransactions() {
        return transactionRepository.findAll();
    }

    public Transaction addTransaction(CreateTransactionRequest request) {
        String symbol = request.symbol().trim().toUpperCase();
        if (request.type() == TransactionType.SELL) {
            validateSell(symbol, request.quantity());
        }

        Transaction transaction = new Transaction(
                null,
                symbol,
                request.type(),
                request.quantity(),
                request.price().setScale(SCALE, RoundingMode.HALF_UP),
                request.tradedAt()
        );
        return transactionRepository.save(transaction);
    }

    public void deleteTransaction(Long id) {
        if (!transactionRepository.deleteById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found: " + id);
        }
    }

    public PortfolioSummary getSummary() {
        List<Transaction> transactions = transactionRepository.findAll();
        Map<String, PositionState> positions = new HashMap<>();
        BigDecimal realizedProfit = BigDecimal.ZERO;

        for (Transaction tx : transactions) {
            PositionState state = positions.computeIfAbsent(tx.symbol(), key -> new PositionState());
            if (tx.type() == TransactionType.BUY) {
                state.applyBuy(tx.quantity(), tx.price());
            } else {
                realizedProfit = realizedProfit.add(state.applySell(tx.quantity(), tx.price()));
            }
        }

        List<HoldingSummary> holdings = positions.entrySet().stream()
                .filter(entry -> entry.getValue().quantity > 0)
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    PositionState state = entry.getValue();
                    return new HoldingSummary(
                            entry.getKey(),
                            state.quantity,
                            state.averageCost,
                            state.totalCost.setScale(2, RoundingMode.HALF_UP)
                    );
                })
                .toList();

        BigDecimal totalInvested = holdings.stream()
                .map(HoldingSummary::totalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new PortfolioSummary(
                totalInvested,
                realizedProfit.setScale(2, RoundingMode.HALF_UP),
                transactions.size(),
                holdings
        );
    }

    public List<ProfitChartPoint> getProfitChart() {
        List<Transaction> transactions = transactionRepository.findAll();
        Map<String, PositionState> positions = new HashMap<>();
        BigDecimal cumulative = BigDecimal.ZERO;
        List<ProfitChartPoint> points = new ArrayList<>();

        for (Transaction tx : transactions) {
            PositionState state = positions.computeIfAbsent(tx.symbol(), key -> new PositionState());
            if (tx.type() == TransactionType.SELL) {
                cumulative = cumulative.add(state.applySell(tx.quantity(), tx.price()));
            } else {
                state.applyBuy(tx.quantity(), tx.price());
            }
            points.add(new ProfitChartPoint(
                    tx.tradedAt(),
                    cumulative.setScale(2, RoundingMode.HALF_UP)
            ));
        }

        return points;
    }

    public List<HoldingChartPoint> getHoldingChart() {
        return getSummary().holdings().stream()
                .map(h -> new HoldingChartPoint(h.symbol(), h.totalCost()))
                .sorted(Comparator.comparing(HoldingChartPoint::totalCost).reversed())
                .toList();
    }

    private void validateSell(String symbol, int quantity) {
        int available = getAvailableQuantity(symbol);
        if (quantity > available) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient holdings for " + symbol + ". Available: " + available
            );
        }
    }

    private int getAvailableQuantity(String symbol) {
        return transactionRepository.findAll().stream()
                .filter(tx -> tx.symbol().equals(symbol))
                .mapToInt(tx -> tx.type() == TransactionType.BUY ? tx.quantity() : -tx.quantity())
                .sum();
    }

    private static final class PositionState {
        private int quantity;
        private BigDecimal averageCost = BigDecimal.ZERO;
        private BigDecimal totalCost = BigDecimal.ZERO;

        void applyBuy(int buyQuantity, BigDecimal price) {
            BigDecimal buyAmount = price.multiply(BigDecimal.valueOf(buyQuantity));
            totalCost = totalCost.add(buyAmount);
            quantity += buyQuantity;
            if (quantity > 0) {
                averageCost = totalCost.divide(BigDecimal.valueOf(quantity), SCALE, RoundingMode.HALF_UP);
            }
        }

        BigDecimal applySell(int sellQuantity, BigDecimal price) {
            if (sellQuantity > quantity) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Sell quantity exceeds holdings"
                );
            }

            BigDecimal profit = price.subtract(averageCost)
                    .multiply(BigDecimal.valueOf(sellQuantity));
            totalCost = totalCost.subtract(averageCost.multiply(BigDecimal.valueOf(sellQuantity)));
            quantity -= sellQuantity;

            if (quantity == 0) {
                averageCost = BigDecimal.ZERO;
                totalCost = BigDecimal.ZERO;
            }

            return profit;
        }
    }
}
