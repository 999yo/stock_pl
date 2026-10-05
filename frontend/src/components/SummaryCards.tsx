import type { PortfolioSummary } from "../types";

interface Props {
  summary: PortfolioSummary;
}

function formatYen(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function SummaryCards({ summary }: Props) {
  const profitColor =
    summary.realizedProfit >= 0 ? "text-emerald-400" : "text-red-400";

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card label="実現損益" value={formatYen(summary.realizedProfit)} valueClass={profitColor} />
      <Card label="保有銘柄の取得総額" value={formatYen(summary.totalInvested)} />
      <Card label="取引件数" value={`${summary.totalTransactions} 件`} />
    </div>
  );
}

function Card({
  label,
  value,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}
