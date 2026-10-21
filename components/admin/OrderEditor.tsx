"use client";

import { useState, useTransition } from "react";
import { updateOrder } from "@/app/admin/actions";
import { adminButton, adminInput, adminLabel } from "@/components/admin/ui";
import { orderStatusLabels } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export default function OrderEditor({
  orderId,
  status: initialStatus,
  trackingNumber: initialTracking,
}: {
  orderId: string;
  status: OrderStatus;
  trackingNumber: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [tracking, setTracking] = useState(initialTracking);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  if (initialStatus === "refunded") {
    return (
      <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-900">
        Dana pesanan ini sudah dikembalikan penuh, jadi statusnya tidak bisa diubah lagi.
      </p>
    );
  }

  function save() {
    if ((status === "cancelled" || status === "expired") && status !== initialStatus) {
      if (!confirm("Batalkan pesanan ini? Stok produk akan dikembalikan.")) return;
    }
    startTransition(async () => {
      const result = await updateOrder(orderId, { status, trackingNumber: tracking });
      setMessage(result.ok ? { ok: true, text: result.message ?? "Tersimpan" } : { ok: false, text: result.error });
    });
  }

  return (
    <div className="mt-4 grid gap-4">
      <label className={adminLabel}>
        Status
        <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className={adminInput}>
          {(Object.keys(orderStatusLabels) as OrderStatus[])
            .filter((value) => value !== "refunded")
            .map((value) => (
            <option key={value} value={value}>{orderStatusLabels[value]}</option>
          ))}
        </select>
      </label>
      <label className={adminLabel}>
        Nomor resi (opsional)
        <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="mis. JNE 0123456789" className={adminInput} />
      </label>
      <button type="button" onClick={save} disabled={pending} className={adminButton}>
        {pending ? "Menyimpan…" : "Simpan"}
      </button>
      {message && (
        <p role="status" className={`text-sm ${message.ok ? "text-emerald-700" : "text-red-700"}`}>{message.text}</p>
      )}
    </div>
  );
}
