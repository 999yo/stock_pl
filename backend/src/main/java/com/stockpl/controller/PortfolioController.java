package com.stockpl.controller;

import com.stockpl.dto.CreateTransactionRequest;
import com.stockpl.dto.HoldingChartPoint;
import com.stockpl.dto.PortfolioSummary;
import com.stockpl.dto.ProfitChartPoint;
import com.stockpl.model.Transaction;
import com.stockpl.service.PortfolioService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("/transactions")
    public List<Transaction> listTransactions() {
        return portfolioService.listTransactions();
    }

    @PostMapping("/transactions")
    public Transaction createTransaction(@Valid @RequestBody CreateTransactionRequest request) {
        return portfolioService.addTransaction(request);
    }

    @DeleteMapping("/transactions/{id}")
    public void deleteTransaction(@PathVariable Long id) {
        portfolioService.deleteTransaction(id);
    }

    @GetMapping("/portfolio/summary")
    public PortfolioSummary getSummary() {
        return portfolioService.getSummary();
    }

    @GetMapping("/portfolio/charts/profit")
    public List<ProfitChartPoint> getProfitChart() {
        return portfolioService.getProfitChart();
    }

    @GetMapping("/portfolio/charts/holdings")
    public List<HoldingChartPoint> getHoldingsChart() {
        return portfolioService.getHoldingChart();
    }
}
