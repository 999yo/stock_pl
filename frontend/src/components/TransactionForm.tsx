import { FormEvent, useState } from "react";
import type { CreateTransactionInput, TransactionType } from "../types";

interface Props {
  onSubmit: (input: CreateTransactionInput) => Promise<void>;
}

const today = new Date().toISOString().slice(0, 10);

export function TransactionForm({ onSubmit }: Props) {
  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState<TransactionType>("BUY");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [tradedAt, setTradedAt] = useState(today);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        symbol: symbol.toUpperCase(),
        type,
        quantity: Number(quantity),
        price: Number(price),
        tradedAt,
      });
      setSymbol("");
      setQuantity("");
      setPrice("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <h2 className="mb-4 text-lg font-semibold">取引を登録</h2>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <Field label="銘柄コード">
          <input
            required
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="7203"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </Field>

        <Field label="種別">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as TransactionType)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >
            <option value="BUY">買付</option>
            <option value="SELL">売却</option>
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="数量（株）">
            <input
              required
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </Field>
          <Field label="単価（円）">
            <input
              required
              type="number"
              min={0.01}
              step={0.01}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </Field>
        </div>

        <Field label="約定日">
          <input
            required
            type="date"
            value={tradedAt}
            onChange={(e) => setTradedAt(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-emerald-600 py-2.5 font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
        >
          {submitting ? "登録中..." : "登録する"}
        </button>
      </form>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-400">{label}</span>
      {children}
    </label>
  );
}
