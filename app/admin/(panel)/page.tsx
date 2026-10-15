import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import SalesChart from "@/components/admin/SalesChart";
import StatusBadge from "@/components/admin/StatusBadge";
import { adminCard } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatRupiah } from "@/lib/format";
import { expireStaleOrders } from "@/lib/orders";
import { getDashboard, monthLabel } from "@/lib/reports";

export const metadata = { title: "Ringkasan" };

function Stat({ label, value, hint, href }: { label: string; value: string; hint?: string; href?: string }) {
  const body = (
    <>
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
    </>
  );
  return href ? (
    <Link href={href} className={`${adminCard} block transition hover:border-stone-400`}>{body}</Link>
  ) : (
    <div className={adminCard}>{body}</div>
  );
}

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();
  await expireStaleOrders();
  const d = await getDashboard(supabase);

  return (
    <>
      <PageHeader title="Ringkasan penjualan" description={`Data bulan ${monthLabel(d.month)} (waktu WIB).`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Penjualan hari ini" value={formatRupiah(d.today.sales)} hint={`${d.today.orders} pesanan dibayar`} />
        <Stat label="Penjualan bulan ini" value={formatRupiah(d.thisMonth.sales)} hint={`${d.thisMonth.orders} pesanan · ${d.thisMonth.items} barang`} />
        <Stat label="Perlu diproses" value={String(d.toProcess)} hint="Sudah dibayar, belum dikirim" href="/admin/pesanan?status=paid" />
        <Stat label="Menunggu pembayaran" value={String(d.pendingPayment)} href="/admin/pesanan?status=pending_payment" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className={adminCard}>
          <h2 className="font-semibold">Penjualan harian</h2>
          <p className="mb-6 text-sm text-stone-500">30 hari terakhir, nilai produk dari pesanan yang sudah dibayar</p>
          <SalesChart data={d.daily} />
        </section>

        <section className={adminCard}>
          <h2 className="font-semibold">Produk terlaris bulan ini</h2>
          {d.topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-stone-500">Belum ada penjualan bulan ini.</p>
          ) : (
            <ol className="mt-4 divide-y divide-stone-100">
              {d.topProducts.map((product, index) => (
                <li key={product.name} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="w-5 text-stone-400 tabular-nums">{index + 1}</span>
                    <span className="truncate">{product.name}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="font-medium tabular-nums">{product.quantity} pcs</span>
                    <span className="block text-xs text-stone-500 tabular-nums">{formatRupiah(product.revenue)}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <section className={`${adminCard} mt-6`}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Pesanan terbaru</h2>
          <Link href="/admin/pesanan" className="text-sm text-stone-500 underline">Semua pesanan</Link>
        </div>
        {d.recent.length === 0 ? (
          <p className="mt-4 text-sm text-stone-500">Belum ada pesanan.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <tbody className="divide-y divide-stone-100">
                {d.recent.map((order) => (
                  <tr key={order.id}>
                    <td className="py-3">
                      <Link href={`/admin/pesanan/${order.id}`} className="font-medium hover:underline">{order.code}</Link>
                      <p className="text-xs text-stone-500">{formatDate(order.created_at, true)}</p>
                    </td>
                    <td className="py-3">{order.customer_name}</td>
                    <td className="py-3"><StatusBadge status={order.status} /></td>
                    <td className="py-3 text-right font-medium tabular-nums">{formatRupiah(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
