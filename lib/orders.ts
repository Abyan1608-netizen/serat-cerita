import "server-only";
import { randomInt } from "node:crypto";
import { formatRupiah, orderStatusLabels } from "@/lib/format";
import {
  getTransactionStatus,
  isMidtransConfigured,
  mapTransactionStatus,
  type MidtransStatus,
} from "@/lib/midtrans";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyOwner } from "@/lib/telegram";
import type { Order, OrderStatus } from "@/lib/types";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Kode pesanan acak, mis. SC-251015-7KQ2MX (sulit ditebak). */
export function generateOrderCode(): string {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replace(/-/g, "");
  let suffix = "";
  for (let i = 0; i < 6; i++) suffix += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return `SC-${date}-${suffix}`;
}

export async function getOrderByCode(code: string): Promise<Order | null> {
  const { data } = await createAdminClient()
    .from("orders")
    .select("*, order_items(*)")
    .eq("code", code)
    .maybeSingle();
  return data as Order | null;
}

export function orderSummaryLines(order: Order): string[] {
  return [
    ...(order.order_items ?? []).map(
      (item) => `• ${item.product_name} × ${item.quantity}`,
    ),
    `Ongkir (${order.shipping_name}): ${formatRupiah(order.shipping_cost)}`,
    `**Total: ${formatRupiah(order.total)}**`,
  ];
}

/**
 * Terapkan status pembayaran dari Midtrans ke pesanan. Aturan transisinya ada
 * di fungsi database apply_payment_status: status yang sudah diatur admin tidak
 * tertimpa, dan notifikasi hanya dikirim sekali.
 */
export async function applyPaymentStatus(
  order: Order,
  status: MidtransStatus,
): Promise<Order> {
  const next = mapTransactionStatus(status);
  if (!next || next === "pending_payment" || next === order.status) return order;
  // Nominal di Midtrans harus sama persis dengan total pesanan.
  if (Number(status.gross_amount) !== order.total) {
    console.error(`Nominal Midtrans tidak cocok untuk ${order.code}: ${status.gross_amount} ≠ ${order.total}`);
    return order;
  }

  const supabase = createAdminClient();
  const { data: changed, error } = await supabase.rpc("apply_payment_status", {
    p_order_id: order.id,
    p_status: next,
    p_payment_method: status.payment_type ?? null,
  });
  if (error) throw error;

  const { data: fresh } = await supabase.from("orders").select("*").eq("id", order.id).single();
  const updated = { ...order, ...(fresh as Order) };
  if (!changed) return updated;

  if (next === "paid") {
    await notifyOwner([
      `✅ **Pembayaran diterima** — ${order.code}`,
      `${order.customer_name} (${order.customer_phone})`,
      ...orderSummaryLines(updated),
      `Metode: ${status.payment_type ?? "-"}`,
    ]);
  } else {
    await notifyOwner([
      `⚠️ Pesanan ${order.code} ${orderStatusLabels[next as OrderStatus].toLowerCase()}.`,
    ]);
  }

  return updated;
}

/** Cek ulang ke Midtrans untuk pesanan yang masih menunggu pembayaran. */
export async function syncPendingOrder(order: Order): Promise<Order> {
  if (order.status !== "pending_payment" || !isMidtransConfigured()) return order;
  try {
    const status = await getTransactionStatus(order.code);
    return status ? await applyPaymentStatus(order, status) : order;
  } catch (error) {
    console.error("Gagal cek status Midtrans:", error);
    return order;
  }
}

/**
 * Pesanan yang tidak dibayar > 24 jam dianggap kedaluwarsa agar stok kembali.
 * (Cadangan bila notifikasi dari Midtrans tidak sampai.)
 */
export async function expireStaleOrders(): Promise<void> {
  // Tanpa Midtrans, pembayaran dikonfirmasi manual oleh admin — jangan dibatalkan otomatis.
  if (!isMidtransConfigured()) return;
  const supabase = createAdminClient();
  const cutoff = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "pending_payment")
    .lt("created_at", cutoff)
    .limit(50);

  for (const order of (data ?? []) as Order[]) {
    const synced = await syncPendingOrder(order);
    if (synced.status === "pending_payment") {
      await supabase.rpc("set_order_status", {
        p_order_id: order.id,
        p_status: "expired",
      });
    }
  }
}
