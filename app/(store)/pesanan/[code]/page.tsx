import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreditCard, MessageCircle, RefreshCw } from "lucide-react";
import Heading from "@/components/store/Heading";
import { buttonOutline, buttonPrimary, eyebrow } from "@/components/store/ui";
import { getSettings } from "@/lib/data";
import { formatDate, formatRupiah, isPaid, orderStatusLabels, whatsappLink } from "@/lib/format";
import { getOrderByCode, syncPendingOrder } from "@/lib/orders";

export const metadata: Metadata = { title: "Status pesanan", robots: { index: false } };

const steps = ["pending_payment", "paid", "processing", "shipped", "completed"] as const;

export default async function OrderPage(props: PageProps<"/pesanan/[code]">) {
  const { code } = await props.params;
  const found = await getOrderByCode(decodeURIComponent(code).toUpperCase());
  if (!found) notFound();

  const [order, settings] = await Promise.all([syncPendingOrder(found), getSettings()]);
  const wa = settings.store.whatsapp;
  const current = steps.indexOf(order.status as (typeof steps)[number]);
  const closed = ["cancelled", "expired", "refunded"].includes(order.status);

  return (
    <section className="px-6 py-16 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <p className={eyebrow}>Pesanan {order.code}</p>
        <Heading as="h1" italic={settings.fonts.headingItalic} className="mt-3 text-4xl sm:text-5xl">
          {orderStatusLabels[order.status]}
        </Heading>
        <p className="mt-3 text-sm text-ink-muted">
          Dibuat {formatDate(order.created_at, true)} WIB. Simpan kode <strong>{order.code}</strong> untuk melacak pesanan.
        </p>

        {!closed && (
          <ol className="mt-8 grid grid-cols-5 gap-2 text-center text-[10px] sm:text-xs">
            {steps.map((step, index) => (
              <li key={step}>
                <div className={`h-1.5 rounded-full ${index <= current ? "bg-accent" : "bg-line"}`} />
                <p className={`mt-2 ${index <= current ? "text-ink" : "text-ink-muted"}`}>{orderStatusLabels[step]}</p>
              </li>
            ))}
          </ol>
        )}

        {order.status === "pending_payment" && (
          <div className="mt-8 rounded-[1.5rem] border border-line bg-surface p-6">
            {order.payment_url ? (
              <>
                <p className="text-sm text-ink-muted">
                  Selesaikan pembayaran agar pesanan diproses. Tersedia QRIS, transfer bank, dan e-wallet.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href={order.payment_url} className={buttonPrimary}>
                    <CreditCard size={16} strokeWidth={1.5} />
                    Bayar sekarang
                  </a>
                  <Link href={`/pesanan/${order.code}`} className={buttonOutline}>
                    <RefreshCw size={16} strokeWidth={1.5} />
                    Saya sudah bayar
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-ink-muted">
                  Hubungi kami lewat WhatsApp untuk menyelesaikan pembayaran. Sebutkan kode pesanan Anda.
                </p>
                {wa && (
                  <a
                    href={whatsappLink(wa, `Halo ${settings.store.name}, saya ingin membayar pesanan ${order.code} (${formatRupiah(order.total)}).`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${buttonPrimary} mt-5`}
                  >
                    <MessageCircle size={16} strokeWidth={1.5} />
                    Bayar via WhatsApp
                  </a>
                )}
              </>
            )}
          </div>
        )}

        {order.refunded_total > 0 && (
          <div className="mt-8 rounded-[1.5rem] border border-line bg-surface p-6 text-sm">
            <p className="font-medium">
              Dana dikembalikan: {formatRupiah(order.refunded_total)}
              {order.refunded_total < order.total && ` dari ${formatRupiah(order.total)}`}
            </p>
            <p className="mt-1 text-ink-muted">
              Pengembalian dana sudah kami proses. Jika belum diterima, hubungi kami dengan menyebutkan kode pesanan.
            </p>
          </div>
        )}

        {order.status === "shipped" && order.tracking_number && (
          <p className="mt-8 rounded-[1.5rem] bg-surface p-6 text-sm">
            Nomor resi: <strong className="select-all">{order.tracking_number}</strong>
          </p>
        )}

        <div className="mt-10 rounded-[1.5rem] border border-line p-6">
          <ul className="space-y-2 text-sm">
            {order.order_items?.map((item) => (
              <li key={item.id} className="flex justify-between gap-4">
                <span className="text-ink-muted">{item.product_name} × {item.quantity}</span>
                <span>{formatRupiah(item.price * item.quantity)}</span>
              </li>
            ))}
            <li className="flex justify-between gap-4">
              <span className="text-ink-muted">Ongkir ({order.shipping_name})</span>
              <span>{formatRupiah(order.shipping_cost)}</span>
            </li>
          </ul>
          <div className="mt-4 flex justify-between border-t border-line pt-4 font-medium">
            <span>Total</span>
            <span>{formatRupiah(order.total)}</span>
          </div>
          {isPaid(order.status) && order.paid_at && (
            <p className="mt-2 text-xs text-ink-muted">Dibayar {formatDate(order.paid_at, true)} WIB</p>
          )}
          <div className="mt-6 text-sm text-ink-muted">
            <p className="text-ink">{order.customer_name}</p>
            <p className="whitespace-pre-line">{order.address}</p>
          </div>
        </div>

        {wa && (
          <a
            href={whatsappLink(wa, `Halo ${settings.store.name}, saya ingin bertanya tentang pesanan ${order.code}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 text-sm underline underline-offset-4 hover:text-accent"
          >
            <MessageCircle size={15} strokeWidth={1.5} />
            Tanya tentang pesanan ini
          </a>
        )}
      </div>
    </section>
  );
}
