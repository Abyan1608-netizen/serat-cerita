import type { OrderStatus } from "@/lib/types";

export const TIME_ZONE = "Asia/Jakarta";

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | Date, withTime = false): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
}

/** Tanggal (YYYY-MM-DD) menurut zona waktu WIB. */
export function dateKey(value: string | Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending_payment: "Menunggu pembayaran",
  paid: "Sudah dibayar",
  processing: "Sedang dikerjakan",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  expired: "Kedaluwarsa",
  refunded: "Dana dikembalikan",
};

/**
 * Status pesanan yang pernah dibayar. Pesanan "refunded" tetap dihitung sebagai
 * penjualan pada tanggal bayarnya; refund-nya dikurangkan pada tanggal refund.
 */
export const PAID_STATUSES: OrderStatus[] = [
  "paid",
  "processing",
  "shipped",
  "completed",
  "refunded",
];

export function isPaid(status: OrderStatus): boolean {
  return PAID_STATUSES.includes(status);
}

/** Ubah 08xx / +628xx / 628xx menjadi 628xx (format wa.me). */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

export function whatsappLink(phone: string, message?: string): string {
  const base = `https://wa.me/${normalizePhone(phone)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
