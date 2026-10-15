"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { addExpense, deleteExpense } from "@/app/admin/actions";
import MoneyInput from "@/components/admin/MoneyInput";
import { adminButton, adminCard, adminInput, adminLabel } from "@/components/admin/ui";
import { dateKey, formatDate, formatRupiah } from "@/lib/format";
import type { Expense } from "@/lib/types";

const categories = ["Bahan baku (benang, dll.)", "Kemasan", "Ongkir", "Promosi", "Peralatan", "Lainnya"];

export default function ExpenseManager({ month, expenses }: { month: string; expenses: Expense[] }) {
  const router = useRouter();
  const today = dateKey(new Date());
  const [spentOn, setSpentOn] = useState(today.startsWith(month) ? today : `${month}-01`);
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await addExpense({ spentOn, category, description, amount });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDescription("");
      setAmount(0);
      router.refresh();
    });
  }

  return (
    <section className={adminCard}>
      <h2 className="font-semibold">Pengeluaran</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="mt-4 grid gap-3 sm:grid-cols-2"
      >
        <label className={adminLabel}>
          Tanggal
          <input type="date" required value={spentOn} onChange={(e) => setSpentOn(e.target.value)} className={adminInput} />
        </label>
        <label className={adminLabel}>
          Jenis
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={adminInput}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className={adminLabel}>
          Keterangan
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="mis. Benang katun 10 gulung" className={adminInput} />
        </label>
        <div className={adminLabel}>
          <label htmlFor="expense-amount">Jumlah</label>
          <MoneyInput id="expense-amount" value={amount} onChange={setAmount} />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={pending || amount <= 0} className={adminButton}>
            {pending ? "Menyimpan…" : "Catat pengeluaran"}
          </button>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        </div>
      </form>

      {expenses.length > 0 && (
        <ul className="mt-6 divide-y divide-stone-100 border-t border-stone-100 text-sm">
          {expenses.map((expense) => (
            <li key={expense.id} className="flex items-center justify-between gap-3 py-2.5">
              <span className="min-w-0">
                <span className="block truncate">{expense.description || expense.category}</span>
                <span className="text-xs text-stone-500">{formatDate(expense.spent_on)} · {expense.category}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="tabular-nums">{formatRupiah(expense.amount)}</span>
                <button
                  type="button"
                  aria-label="Hapus pengeluaran"
                  onClick={() => {
                    if (!confirm("Hapus pengeluaran ini?")) return;
                    startTransition(async () => {
                      await deleteExpense(expense.id);
                      router.refresh();
                    });
                  }}
                  className="rounded-lg p-1.5 text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={15} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
