import { NextResponse } from "next/server";
import { getTransactionStatus, isValidSignature, type MidtransStatus } from "@/lib/midtrans";
import { applyPaymentStatus, getOrderByCode } from "@/lib/orders";

/**
 * Notifikasi pembayaran dari Midtrans.
 * Atur di Midtrans Dashboard → Settings → Payment → Notification URL:
 *   https://<domain-anda>/api/midtrans
 */
export async function POST(request: Request) {
  let notification: MidtransStatus;
  try {
    notification = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (!isValidSignature(notification)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 403 });
  }

  const order = await getOrderByCode(notification.order_id);
  // Notifikasi uji dari dashboard Midtrans memakai order_id acak — balas OK.
  if (!order) return NextResponse.json({ ok: true, ignored: true });

  // Ambil ulang status langsung dari Midtrans sebagai sumber kebenaran.
  const status = (await getTransactionStatus(order.code)) ?? notification;
  if (Number(status.gross_amount) !== order.total) {
    console.error(`Nominal tidak cocok untuk ${order.code}`);
    return NextResponse.json({ error: "amount mismatch" }, { status: 400 });
  }

  await applyPaymentStatus(order, status);
  return NextResponse.json({ ok: true });
}
