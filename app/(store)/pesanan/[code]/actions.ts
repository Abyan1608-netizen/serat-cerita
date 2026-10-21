"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { formatRupiah, normalizePhone } from "@/lib/format";
import { cancelTransaction, isMidtransConfigured } from "@/lib/midtrans";
import { getOrderByCode, syncPendingOrder } from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyOwner } from "@/lib/telegram";

export type BuyerActionResult = { ok: true; message: string } | { ok: false; error: string };

const REFUNDABLE = ["paid", "processing", "shipped", "completed"];

/** Pastikan yang meminta adalah pemesan: nomor WA harus sama dengan saat memesan. */
async function verifiedOrder(code: string, phone: string) {
  const order = await getOrderByCode(code);
  if (!order || normalizePhone(phone) !== order.customer_phone) return null;
  return order;
}

export async function cancelUnpaidOrder(code: string, phone: string): Promise<BuyerActionResult> {
  const found = await verifiedOrder(code, phone);
  if (!found) return { ok: false, error: "Nomor WhatsApp tidak sesuai dengan pesanan ini." };

  // Cek dulu ke Midtrans: mungkin pembeli sudah membayar tapi status belum diperbarui.
  const order = await syncPendingOrder(found);
  if (order.status !== "pending_payment") {
    return { ok: false, error: "Pesanan ini sudah dibayar atau sudah tidak aktif. Muat ulang halaman." };
  }

  if (isMidtransConfigured()) await cancelTransaction(order.code);
  const { error } = await createAdminClient().rpc("set_order_status", {
    p_order_id: order.id,
    p_status: "cancelled",
  });
  if (error) return { ok: false, error: "Pesanan gagal dibatalkan. Silakan coba lagi." };

  await notifyOwner([
    `🚫 **Pesanan dibatalkan pembeli** — ${order.code}`,
    `${order.customer_name} · ${formatRupiah(order.total)} (belum dibayar). Stok sudah dikembalikan.`,
  ]);
  revalidatePath(`/pesanan/${order.code}`);
  return { ok: true, message: "Pesanan berhasil dibatalkan." };
}

const requestSchema = z.object({
  reason: z.string().trim().min(10, "Ceritakan alasannya (minimal 10 huruf)").max(1000),
  account: z
    .string()
    .trim()
    .min(5, "Isi rekening/e-wallet tujuan pengembalian dana")
    .max(200),
});

export async function requestRefund(
  code: string,
  phone: string,
  input: { reason: string; account: string },
): Promise<BuyerActionResult> {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const order = await verifiedOrder(code, phone);
  if (!order) return { ok: false, error: "Nomor WhatsApp tidak sesuai dengan pesanan ini." };
  if (!REFUNDABLE.includes(order.status) || order.refunded_total >= order.total) {
    return { ok: false, error: "Pesanan ini tidak bisa diajukan refund." };
  }

  const { error } = await createAdminClient().from("refund_requests").insert({
    order_id: order.id,
    reason: parsed.data.reason,
    refund_account: parsed.data.account,
  });
  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "Permintaan Anda sebelumnya masih ditinjau." : "Permintaan gagal dikirim. Silakan coba lagi.",
    };
  }

  await notifyOwner([
    `📨 **Permintaan refund** — ${order.code}`,
    `${order.customer_name} (${order.customer_phone}) · ${formatRupiah(order.total - order.refunded_total)}`,
    `Alasan: ${parsed.data.reason}`,
    `Tujuan dana: ${parsed.data.account}`,
    "Tinjau di Admin → Pesanan.",
  ]);
  revalidatePath(`/pesanan/${order.code}`);
  return { ok: true, message: "Permintaan terkirim. Kami akan meninjaunya dan mengabari Anda lewat WhatsApp." };
}
