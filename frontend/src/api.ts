import type {
  CreateTransactionInput,
  HoldingChartPoint,
  PortfolioSummary,
  ProfitChartPoint,
  SimulationRequest,
  SimulationResult,
  Transaction,
} from "./types";

const API_BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  listTransactions: () => request<Transaction[]>("/transactions"),
  createTransaction: (input: CreateTransactionInput) =>
    request<Transaction>("/transactions", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  deleteTransaction: (id: number) =>
    request<void>(`/transactions/${id}`, { method: "DELETE" }),
  getSummary: () => request<PortfolioSummary>("/portfolio/summary"),
  getProfitChart: () => request<ProfitChartPoint[]>("/portfolio/charts/profit"),
  getHoldingsChart: () =>
    request<HoldingChartPoint[]>("/portfolio/charts/holdings"),
  simulate: (input: SimulationRequest) =>
    request<SimulationResult>("/simulation", {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
