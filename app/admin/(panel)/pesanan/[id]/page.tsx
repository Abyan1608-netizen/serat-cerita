import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MessageCircle } from "lucide-react";
import OrderEditor from "@/components/admin/OrderEditor";
import RefundPanel from "@/components/admin/RefundPanel";
import StatusBadge from "@/components/admin/StatusBadge";
import { adminButtonOutline, adminCard } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatRupiah, isPaid, whatsappLink } from "@/lib/format";
import { syncPendingOrder } from "@/lib/orders";
import type { Order, Refund, RefundRequest } from "@/lib/types";

export const metadata = { title: "Detail pesanan" };

export default async function OrderDetailPage(props: PageProps<"/admin/pesanan/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await props.params;
  const { data } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const order = await syncPendingOrder(data as Order);
  const { data: refundRows } = await supabase
    .from("refunds")
    .select("*")
    .eq("order_id", order.id)
    .order("refunded_at");
  const refunds = (refundRows ?? []) as Refund[];
  const { data: requestRow } = await supabase
    .from("refund_requests")
    .select("*")
    .eq("order_id", order.id)
    .eq("status", "pending")
    .maybeSingle();

  const hpp = (order.order_items ?? []).reduce((sum, item) => sum + item.cost * item.quantity, 0);

  return (
    <>
      <Link href="/admin/pesanan" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900">
        <ArrowLeft size={16} /> Semua pesanan
      </Link>

      <div className="mb-6 mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{order.code}</h1>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-6">
          <section className={adminCard}>
            <h2 className="font-semibold">Barang</h2>
            <ul className="mt-4 divide-y divide-stone-100 text-sm">
              {order.order_items?.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 py-2.5">
                  <span>{item.product_name} <span className="text-stone-500">× {item.quantity}</span></span>
                  <span className="tabular-nums">{formatRupiah(item.price * item.quantity)}</span>
                </li>
              ))}
              <li className="flex justify-between gap-4 py-2.5 text-stone-600">
                <span>Ongkir ({order.shipping_name})</span>
                <span className="tabular-nums">{formatRupiah(order.shipping_cost)}</span>
              </li>
              <li className="flex justify-between gap-4 py-2.5 font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatRupiah(order.total)}</span>
              </li>
              {order.refunded_total > 0 && (
                <li className="flex justify-between gap-4 py-2.5 text-rose-700">
                  <span>Dikembalikan (refund)</span>
                  <span className="tabular-nums">−{formatRupiah(order.refunded_total)}</span>
                </li>
              )}
            </ul>
            <p className="mt-2 text-xs text-stone-500">
              Modal (HPP) barang: {formatRupiah(hpp)} · Untung kotor: {formatRupiah(order.subtotal - hpp)}
            </p>
          </section>

          <section className={adminCard}>
            <h2 className="font-semibold">Pembeli</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-[140px_1fr]">
              <dt className="text-stone-500">Nama</dt>
              <dd>{order.customer_name}</dd>
              <dt className="text-stone-500">WhatsApp</dt>
              <dd>{order.customer_phone}</dd>
              {order.customer_email && (
                <>
                  <dt className="text-stone-500">Email</dt>
                  <dd>{order.customer_email}</dd>
                </>
              )}
              <dt className="text-stone-500">Alamat</dt>
              <dd className="whitespace-pre-line">{order.address}</dd>
              {order.note && (
                <>
                  <dt className="text-stone-500">Catatan</dt>
                  <dd className="whitespace-pre-line">{order.note}</dd>
                </>
              )}
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={whatsappLink(order.customer_phone, `Halo ${order.customer_name}, terima kasih sudah memesan di Serat Cerita (pesanan ${order.code}).`)}
                target="_blank"
                rel="noopener noreferrer"
                className={adminButtonOutline}
              >
                <MessageCircle size={16} /> Chat pembeli
              </a>
              <a href={`/pesanan/${order.code}`} target="_blank" className={adminButtonOutline}>
                <ExternalLink size={16} /> Halaman pembeli
              </a>
            </div>
          </section>
        </div>

        <div className="grid content-start gap-6">
          <section className={adminCard}>
            <h2 className="font-semibold">Ubah status</h2>
            <p className="mt-1 text-xs text-stone-500">
              Membatalkan pesanan akan mengembalikan stok produk secara otomatis.
            </p>
            <OrderEditor orderId={order.id} status={order.status} trackingNumber={order.tracking_number ?? ""} />
          </section>

          <section className={adminCard}>
            <h2 className="font-semibold">Pengembalian dana (refund)</h2>
            <RefundPanel
              order={order}
              refunds={refunds}
              canRefund={isPaid(order.status) && order.status !== "refunded"}
              request={(requestRow ?? null) as RefundRequest | null}
            />
          </section>

          <section className={`${adminCard} text-sm`}>
            <h2 className="font-semibold">Riwayat</h2>
            <dl className="mt-3 grid grid-cols-[120px_1fr] gap-2">
              <dt className="text-stone-500">Dibuat</dt>
              <dd>{formatDate(order.created_at, true)}</dd>
              <dt className="text-stone-500">Dibayar</dt>
              <dd>{order.paid_at ? formatDate(order.paid_at, true) : "—"}</dd>
              <dt className="text-stone-500">Metode</dt>
              <dd>{order.payment_method ?? "—"}</dd>
              <dt className="text-stone-500">Diperbarui</dt>
              <dd>{formatDate(order.updated_at, true)}</dd>
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
