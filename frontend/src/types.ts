export type TransactionType = "BUY" | "SELL";

export interface Transaction {
  id: number;
  symbol: string;
  type: TransactionType;
  quantity: number;
  price: number;
  tradedAt: string;
}

export interface HoldingSummary {
  symbol: string;
  quantity: number;
  averageCost: number;
  totalCost: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  realizedProfit: number;
  totalTransactions: number;
  holdings: HoldingSummary[];
}

export interface ProfitChartPoint {
  date: string;
  cumulativeRealizedProfit: number;
}

export interface HoldingChartPoint {
  symbol: string;
  totalCost: number;
}

export interface CreateTransactionInput {
  symbol: string;
  type: TransactionType;
  quantity: number;
  price: number;
  tradedAt: string;
}

export interface SimulationRequest {
  symbol: string;
  currentPrice: number;
  changePercent: number;
}

export interface SimulationResult {
  symbol: string;
  currentPrice: number;
  changePercent: number;
  simulationPrice: number;
  quantity: number;
  costAmount: number;
  evaluationAmount: number;
  profit: number;
  profitRate: number;
}
