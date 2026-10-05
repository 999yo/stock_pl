import type { Transaction } from "../types";

interface Props {
  transactions: Transaction[];
  onDelete: (id: number) => Promise<void>;
}

function formatYen(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function TransactionList({ transactions, onDelete }: Props) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <h2 className="mb-4 text-lg font-semibold">取引履歴</h2>
      {transactions.length === 0 ? (
        <p className="text-sm text-slate-500">まだ取引がありません</p>
      ) : (
        <ul className="max-h-96 space-y-2 overflow-y-auto">
          {[...transactions].reverse().map((tx) => (
            <li
              key={tx.id}
              className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2 text-sm"
            >
              <div>
                <span className="font-mono font-medium">{tx.symbol}</span>
                <span
                  className={`ml-2 rounded px-1.5 py-0.5 text-xs ${
                    tx.type === "BUY"
                      ? "bg-blue-950 text-blue-300"
                      : "bg-orange-950 text-orange-300"
                  }`}
                >
                  {tx.type === "BUY" ? "買" : "売"}
                </span>
                <p className="mt-0.5 text-slate-400">
                  {tx.quantity}株 × {formatYen(tx.price)} / {tx.tradedAt}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void onDelete(tx.id)}
                className="text-xs text-slate-500 transition hover:text-red-400"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
