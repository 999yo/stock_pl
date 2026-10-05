import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PriceProfitPoint } from "../utils/riskSimulation";

interface Props {
  data: PriceProfitPoint[];
  averageCost: number;
  currentPrice: number;
  tolerancePrice: number;
  maxLossTolerance: number;
}

function formatYen(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("ja-JP").format(Math.round(value));
}

export function RiskSimulationChart({
  data,
  averageCost,
  currentPrice,
  tolerancePrice,
  maxLossTolerance,
}: Props) {
  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={data} margin={{ top: 16, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="price"
          type="number"
          domain={["dataMin", "dataMax"]}
          stroke="#94a3b8"
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
          label={{ value: "想定株価", position: "insideBottom", offset: -4, fill: "#94a3b8" }}
        />
        <YAxis
          stroke="#94a3b8"
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          label={{ value: "損益", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
        />
        <Tooltip
          contentStyle={{ background: "#0f172a", border: "1px solid #334155" }}
          formatter={(value: number) => [formatYen(value), "損益"]}
          labelFormatter={(label) => `想定株価: ${formatPrice(Number(label))}円`}
        />
        <ReferenceLine y={0} stroke="#64748b" strokeDasharray="4 4" />
        <ReferenceLine
          x={averageCost}
          stroke="#60a5fa"
          strokeDasharray="4 4"
          label={{ value: "平均取得単価", fill: "#60a5fa", fontSize: 11 }}
        />
        <ReferenceLine
          x={currentPrice}
          stroke="#34d399"
          strokeDasharray="4 4"
          label={{ value: "現在株価", fill: "#34d399", fontSize: 11 }}
        />
        {maxLossTolerance > 0 && tolerancePrice > 0 && (
          <ReferenceLine
            x={tolerancePrice}
            stroke="#f87171"
            strokeDasharray="4 4"
            label={{ value: "損失許容ライン", fill: "#f87171", fontSize: 11 }}
          />
        )}
        {maxLossTolerance > 0 && (
          <ReferenceLine
            y={-maxLossTolerance}
            stroke="#f87171"
            strokeDasharray="6 3"
            label={{ value: "最大損失", fill: "#f87171", fontSize: 11 }}
          />
        )}
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#a78bfa"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
