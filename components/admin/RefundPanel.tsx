"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MessageCircle } from "lucide-react";
import { recordRefund } from "@/app/admin/actions";
import MoneyInput from "@/components/admin/MoneyInput";
import { adminButton, adminButtonOutline, adminHint, adminInput, adminLabel } from "@/components/admin/ui";
import { formatDate, formatRupiah, whatsappLink } from "@/lib/format";
import type { Order, Refund } from "@/lib/types";

export default function RefundPanel({
  order,
  refunds,
  canRefund,
}: {
  order: Pick<Order, "id" | "code" | "customer_name" | "customer_phone" | "total" | "refunded_total">;
  refunds: Refund[];
  canRefund: boolean;
}) {
  const router = useRouter();
  const remaining = order.total - order.refunded_total;
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(remaining);
  const [method, setMethod] = useState("");
  const [note, setNote] = useState("");
  const [restock, setRestock] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ amount: number; method: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const full = amount === remaining;

  function submit() {
    setError(null);
    if (amount < 1 || amount > remaining) {
      setError(`Jumlah harus antara Rp 1 dan ${formatRupiah(remaining)}`);
      return;
    }
    const message = full
      ? `Kembalikan SELURUH sisa dana ${formatRupiah(amount)} untuk ${order.code}?${restock ? " Stok barang akan dikembalikan." : ""}`
      : `Catat refund sebagian ${formatRupiah(amount)} untuk ${order.code}?`;
    if (!confirm(message)) return;

    startTransition(async () => {
      const result = await recordRefund({ orderId: order.id, amount, method, note, restock: full && restock });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone({ amount, method });
      setOpen(false);
      setNote("");
      router.refresh();
    });
  }

  return (
    <div className="mt-3 grid gap-4 text-sm">
      <p className="text-stone-600">
        Dikembalikan: <strong className="tabular-nums">{formatRupiah(order.refunded_total)}</strong> dari{" "}
        <span className="tabular-nums">{formatRupiah(order.total)}</span>
      </p>

      {refunds.length > 0 && (
        <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200">
          {refunds.map((refund) => (
            <li key={refund.id} className="px-3 py-2.5">
              <div className="flex justify-between gap-3">
                <span className="font-medium tabular-nums">{formatRupiah(refund.amount)}</span>
                <span className="text-xs text-stone-500">{formatDate(refund.refunded_at, true)}</span>
              </div>
              <p className="text-xs text-stone-600">
                {refund.method}
                {refund.restocked && " · stok dikembalikan"}
              </p>
              {refund.note && <p className="mt-0.5 text-xs text-stone-500">{refund.note}</p>}
            </li>
          ))}
        </ul>
      )}

      {done && (
        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-900">
          <p>Refund {formatRupiah(done.amount)} tercatat.</p>
          <a
            href={whatsappLink(
              order.customer_phone,
              `Halo ${order.customer_name}, dana pesanan ${order.code} sebesar ${formatRupiah(done.amount)} sudah kami kembalikan melalui ${done.method}. Mohon dicek ya, terima kasih.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={`${adminButtonOutline} mt-2`}
          >
            <MessageCircle size={16} /> Kabari pembeli via WhatsApp
          </a>
        </div>
      )}

      {canRefund && remaining > 0 && !open && (
        <button
          type="button"
          onClick={() => {
            setAmount(remaining);
            setOpen(true);
            setDone(null);
          }}
          className={`${adminButtonOutline} w-fit`}
        >
          Catat refund
        </button>
      )}

      {!canRefund && order.refunded_total === 0 && (
        <p className={adminHint}>Refund hanya bisa dicatat untuk pesanan yang sudah dibayar.</p>
      )}

      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="grid gap-3 rounded-xl border border-stone-200 p-4"
        >
          <p className={adminHint}>
            Kirim dulu uangnya ke pembeli (transfer, e-wallet, atau lewat dashboard Midtrans), lalu catat di sini.
          </p>
          <div className={adminLabel}>
            <label htmlFor="refund-amount">Jumlah dikembalikan</label>
            <MoneyInput id="refund-amount" value={amount} onChange={setAmount} />
            <span className={adminHint}>Maksimal {formatRupiah(remaining)}{full ? " (refund penuh)" : " (refund sebagian)"}</span>
          </div>
          <label className={adminLabel}>
            Cara pengembalian
            <input
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              required
              placeholder="mis. Transfer BCA a.n. Budi"
              className={adminInput}
            />
          </label>
          <label className={adminLabel}>
            Alasan / catatan (opsional)
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="mis. Barang rusak saat pengiriman" className={adminInput} />
          </label>
          {full && (
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} className="h-4 w-4 accent-stone-900" />
              Kembalikan stok barang (barang kembali ke toko / belum dikirim)
            </label>
          )}
          {error && <p role="alert" className="text-red-700">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className={adminButton}>
              {pending ? "Menyimpan…" : "Simpan refund"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className={adminButtonOutline}>
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
