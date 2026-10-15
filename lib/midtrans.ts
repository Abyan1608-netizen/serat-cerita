import "server-only";
import { createHash } from "node:crypto";

export function isMidtransConfigured(): boolean {
  return Boolean(process.env.MIDTRANS_SERVER_KEY);
}

export function isMidtransProduction(): boolean {
  return process.env.MIDTRANS_IS_PRODUCTION === "true";
}

function urls() {
  return isMidtransProduction()
    ? { snap: "https://app.midtrans.com/snap/v1/transactions", api: "https://api.midtrans.com/v2" }
    : {
        snap: "https://app.sandbox.midtrans.com/snap/v1/transactions",
        api: "https://api.sandbox.midtrans.com/v2",
      };
}

function authHeader(): string {
  const key = process.env.MIDTRANS_SERVER_KEY ?? "";
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

type SnapItem = { id: string; name: string; price: number; quantity: number };

export async function createSnapTransaction(input: {
  orderCode: string;
  grossAmount: number;
  items: SnapItem[];
  customer: { name: string; phone: string; email?: string | null; address: string };
  finishUrl: string;
}): Promise<{ token: string; redirect_url: string }> {
  const response = await fetch(urls().snap, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      transaction_details: { order_id: input.orderCode, gross_amount: input.grossAmount },
      // Midtrans membatasi nama item 50 karakter.
      item_details: input.items.map((item) => ({ ...item, name: item.name.slice(0, 50) })),
      customer_details: {
        first_name: input.customer.name,
        phone: input.customer.phone,
        email: input.customer.email || undefined,
        shipping_address: { first_name: input.customer.name, address: input.customer.address },
      },
      callbacks: { finish: input.finishUrl },
      expiry: { unit: "hours", duration: 24 },
    }),
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      `Midtrans: ${Array.isArray(data.error_messages) ? data.error_messages.join(", ") : response.status}`,
    );
  }
  return data;
}

export type MidtransStatus = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
  signature_key?: string;
};

/** Ambil status transaksi langsung dari Midtrans (sumber kebenaran). */
export async function getTransactionStatus(orderCode: string): Promise<MidtransStatus | null> {
  const response = await fetch(`${urls().api}/${encodeURIComponent(orderCode)}/status`, {
    headers: { Accept: "application/json", Authorization: authHeader() },
    cache: "no-store",
  });
  const data = await response.json();
  // 404 = pembeli belum memilih metode pembayaran.
  if (!response.ok || data.status_code === "404") return null;
  return data;
}

export function isValidSignature(notification: MidtransStatus): boolean {
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!key || !notification.signature_key) return false;
  const expected = createHash("sha512")
    .update(notification.order_id + notification.status_code + notification.gross_amount + key)
    .digest("hex");
  return expected === notification.signature_key;
}

/** Terjemahkan status Midtrans ke status pesanan kita. */
export function mapTransactionStatus(
  status: MidtransStatus,
): "paid" | "pending_payment" | "cancelled" | "expired" | null {
  switch (status.transaction_status) {
    case "capture":
      return status.fraud_status === "accept" || !status.fraud_status ? "paid" : null;
    case "settlement":
      return "paid";
    case "pending":
      return "pending_payment";
    case "deny":
    case "cancel":
    case "failure":
      return "cancelled";
    case "expire":
      return "expired";
    default:
      return null;
  }
}
