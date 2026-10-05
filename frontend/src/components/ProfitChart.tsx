import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProfitChartPoint } from "../types";

interface Props {
  data: ProfitChartPoint[];
}

function formatYen(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProfitChart({ data }: Props) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <h2 className="mb-4 text-lg font-semibold">累積実現損益</h2>
      {data.length === 0 ? (
        <p className="text-sm text-slate-500">グラフを表示するデータがありません</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis
              stroke="#94a3b8"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #334155" }}
              formatter={(value: number) => [formatYen(value), "累積損益"]}
            />
            <Line
              type="monotone"
              dataKey="cumulativeRealizedProfit"
              stroke="#34d399"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
