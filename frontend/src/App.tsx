import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { HoldingsChart } from "./components/HoldingsChart";
import { ProfitChart } from "./components/ProfitChart";
import { SummaryCards } from "./components/SummaryCards";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import type {
  CreateTransactionInput,
  HoldingChartPoint,
  PortfolioSummary,
  ProfitChartPoint,
  SimulationResult,
  Transaction,
} from "./types";

function formatYen(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

const SAMPLE_DATA: CreateTransactionInput[] = [
  { symbol: "7203", type: "BUY", quantity: 100, price: 2500, tradedAt: "2024-01-10" },
  { symbol: "7203", type: "BUY", quantity: 100, price: 2700, tradedAt: "2024-02-15" },
  { symbol: "7203", type: "SELL", quantity: 50, price: 3000, tradedAt: "2024-03-20" },
  { symbol: "9984", type: "BUY", quantity: 20, price: 8000, tradedAt: "2024-04-01" },
  { symbol: "6758", type: "BUY", quantity: 30, price: 12000, tradedAt: "2024-05-10" },
  { symbol: "9984", type: "SELL", quantity: 10, price: 9500, tradedAt: "2024-06-01" },
];

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [profitChart, setProfitChart] = useState<ProfitChartPoint[]>([]);
  const [holdingsChart, setHoldingsChart] = useState<HoldingChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulationSymbol, setSimulationSymbol] = useState("7203");
  const [simulationCurrentPrice, setSimulationCurrentPrice] = useState(2500);
  const [simulationChangePercent, setSimulationChangePercent] = useState(-10);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [simulationLoading, setSimulationLoading] = useState(false);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [txs, sum, profit, holdings] = await Promise.all([
        api.listTransactions(),
        api.getSummary(),
        api.getProfitChart(),
        api.getHoldingsChart(),
      ]);
      setTransactions(txs);
      setSummary(sum);
      setProfitChart(profit);
      setHoldingsChart(holdings);
    } catch (e) {
      setError(e instanceof Error ? e.message : "データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCreate = async (input: CreateTransactionInput) => {
    setError(null);
    try {
      await api.createTransaction(input);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "取引の登録に失敗しました");
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      await api.deleteTransaction(id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "取引の削除に失敗しました");
    }
  };

  const handleSimulation = async () => {
    setError(null);

    if (!simulationSymbol.trim()) {
      setError("銘柄コードを入力してください");
      return;
    }
    if (simulationCurrentPrice <= 0 || Number.isNaN(simulationCurrentPrice)) {
      setError("現在株価は0より大きい値を入力してください");
      return;
    }
    if (Number.isNaN(simulationChangePercent)) {
      setError("株価変動率を入力してください");
      return;
    }

    setSimulationLoading(true);
    try {
      const result = await api.simulate({
        symbol: simulationSymbol.trim().toUpperCase(),
        currentPrice: simulationCurrentPrice,
        changePercent: simulationChangePercent,
      });
      setSimulationResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "シミュレーションに失敗しました");
    } finally {
      setSimulationLoading(false);
    }
  };

  const loadSampleData = async () => {
    setError(null);
    setLoading(true);
    try {
      for (const item of SAMPLE_DATA) {
        await api.createTransaction(item);
      }
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "サンプルデータの読み込みに失敗しました");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">Portfolio Project</p>
          <h1 className="text-3xl font-bold tracking-tight">Stock PL</h1>
          <p className="mt-1 text-slate-400">平均取得単価法による株損益通算アプリ</p>
        </div>
        <button
          type="button"
          onClick={() => void loadSampleData()}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-500 hover:text-emerald-400"
        >
          サンプルデータを読み込む
        </button>
      </header>

      {error && (
        <div className="mb-6 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-400">読み込み中...</p>
      ) : (
        <>
          {summary && <SummaryCards summary={summary} />}

          <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="mb-4 text-lg font-semibold">株価変動シミュレーション</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-sm text-slate-400">銘柄コード</span>
                <input
                  value={simulationSymbol}
                  onChange={(e) => setSimulationSymbol(e.target.value)}
                  placeholder="7203"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-slate-400">現在株価</span>
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={simulationCurrentPrice}
                  onChange={(e) =>
                    setSimulationCurrentPrice(
                      e.target.value === "" ? NaN : Number(e.target.value),
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-slate-400">株価変動率（%）</span>
                <input
                  type="number"
                  step={0.01}
                  value={simulationChangePercent}
                  onChange={(e) =>
                    setSimulationChangePercent(
                      e.target.value === "" ? NaN : Number(e.target.value),
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => void handleSimulation()}
              disabled={simulationLoading}
              className="mt-4 w-full rounded-lg bg-emerald-600 py-2.5 font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50 sm:w-auto sm:px-8"
            >
              {simulationLoading ? "計算中..." : "シミュレーション実行"}
            </button>

            {simulationResult && (
              <div className="mt-6 grid gap-3 border-t border-slate-800 pt-6 sm:grid-cols-2 lg:grid-cols-4">
                <ResultItem label="銘柄コード" value={simulationResult.symbol} />
                <ResultItem label="現在株価" value={formatYen(simulationResult.currentPrice)} />
                <ResultItem
                  label="変動率"
                  value={`${formatNumber(simulationResult.changePercent)}%`}
                />
                <ResultItem label="想定株価" value={formatYen(simulationResult.simulationPrice)} />
                <ResultItem
                  label="保有株数"
                  value={`${formatNumber(simulationResult.quantity)}株`}
                />
                <ResultItem label="投資額" value={formatYen(simulationResult.costAmount)} />
                <ResultItem label="評価額" value={formatYen(simulationResult.evaluationAmount)} />
                <ResultItem
                  label="損益"
                  value={formatYen(simulationResult.profit)}
                  valueClass={
                    simulationResult.profit >= 0 ? "text-emerald-400" : "text-red-400"
                  }
                />
                <ResultItem
                  label="損益率"
                  value={`${formatNumber(simulationResult.profitRate)}%`}
                  valueClass={
                    simulationResult.profitRate >= 0 ? "text-emerald-400" : "text-red-400"
                  }
                />
              </div>
            )}
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <ProfitChart data={profitChart} />
            <HoldingsChart data={holdingsChart} />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <TransactionForm onSubmit={handleCreate} />
            <TransactionList transactions={transactions} onDelete={handleDelete} />
          </div>
        </>
      )}
    </div>
  );
}

function ResultItem({
  label,
  value,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-1 font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}
