"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelUnpaidOrder, requestRefund, type BuyerActionResult } from "@/app/(store)/pesanan/[code]/actions";
import { buttonOutline, buttonPrimary, field, label } from "@/components/store/ui";
import { formatDate } from "@/lib/format";
import type { OrderStatus, RefundRequest } from "@/lib/types";

export default function OrderActions({
  code,
  status,
  refundable,
  request,
}: {
  code: string;
  status: OrderStatus;
  /** Masih ada dana yang bisa dikembalikan. */
  refundable: boolean;
  request: Pick<RefundRequest, "status" | "admin_note" | "created_at"> | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "cancel" | "refund">("idle");
  const [result, setResult] = useState<BuyerActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const canCancel = status === "pending_payment";
  const canRequest =
    refundable && ["paid", "processing", "shipped", "completed"].includes(status) && request?.status !== "pending";

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const phone = String(data.get("phone") ?? "");
    startTransition(async () => {
      const res =
        mode === "cancel"
          ? await cancelUnpaidOrder(code, phone)
          : await requestRefund(code, phone, {
              reason: String(data.get("reason") ?? ""),
              account: String(data.get("account") ?? ""),
            });
      setResult(res);
      if (res.ok) {
        setMode("idle");
        router.refresh();
      }
    });
  }

  return (
    <div className="mt-8 space-y-4 text-sm">
      {request?.status === "pending" && (
        <div className="rounded-[1.5rem] border border-line bg-surface p-6">
          <p className="font-medium">Permintaan pembatalan/refund sedang ditinjau</p>
          <p className="mt-1 text-ink-muted">
            Dikirim {formatDate(request.created_at, true)} WIB. Kami akan mengabari Anda lewat WhatsApp.
          </p>
        </div>
      )}
      {request?.status === "rejected" && (
        <div className="rounded-[1.5rem] border border-line bg-surface p-6">
          <p className="font-medium">Permintaan refund tidak dapat disetujui</p>
          {request.admin_note && <p className="mt-1 text-ink-muted">Alasan: {request.admin_note}</p>}
        </div>
      )}

      {result?.ok && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-emerald-900">{result.message}</p>}

      {mode === "idle" && (canCancel || canRequest) && (
        <button
          type="button"
          onClick={() => {
            setMode(canCancel ? "cancel" : "refund");
            setResult(null);
          }}
          className={buttonOutline}
        >
          {canCancel ? "Batalkan pesanan" : "Ajukan pembatalan / refund"}
        </button>
      )}

      {mode !== "idle" && (
        <form onSubmit={submit} className="grid gap-4 rounded-[1.5rem] border border-line p-6">
          <p className="font-medium">{mode === "cancel" ? "Batalkan pesanan ini?" : "Ajukan pembatalan / pengembalian dana"}</p>
          <p className="text-ink-muted">
            {mode === "cancel"
              ? "Pesanan belum dibayar, jadi akan langsung dibatalkan dan tagihannya tidak berlaku lagi."
              : "Permintaan akan ditinjau sesuai "}
            {mode === "refund" && (
              <>
                <Link href="/info/kebijakan-pengembalian" className="underline">Kebijakan Pengembalian</Link>. Dana dikirim ke rekening/e-wallet
                yang Anda isi setelah disetujui.
              </>
            )}
          </p>

          <label className={label}>
            Nomor WhatsApp yang dipakai saat memesan
            <input name="phone" required inputMode="tel" placeholder="08xxxxxxxxxx" className={field} />
          </label>

          {mode === "refund" && (
            <>
              <label className={label}>
                Alasan
                <textarea name="reason" required rows={3} placeholder="mis. Tidak jadi membeli / barang rusak saat diterima" className={field} />
              </label>
              <label className={label}>
                Rekening atau e-wallet tujuan pengembalian dana
                <input name="account" required placeholder="mis. BCA 1234567890 a.n. Budi / GoPay 0812…" className={field} />
              </label>
            </>
          )}

          {result && !result.ok && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-red-800">{result.error}</p>}

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={pending} className={buttonPrimary}>
              {pending ? "Memproses…" : mode === "cancel" ? "Ya, batalkan" : "Kirim permintaan"}
            </button>
            <button type="button" onClick={() => setMode("idle")} className={buttonOutline}>
              Kembali
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
