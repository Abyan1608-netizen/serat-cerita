import Link from "next/link";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import ExpenseManager from "@/components/admin/ExpenseManager";
import PageHeader from "@/components/admin/PageHeader";
import { adminButtonOutline, adminCard } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatRupiah } from "@/lib/format";
import { currentMonth, getFinance, monthLabel, shiftMonth } from "@/lib/reports";

export const metadata = { title: "Keuangan" };

function Line({ label, value, strong, negative }: { label: string; value: number; strong?: boolean; negative?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-2.5 ${strong ? "border-t border-stone-200 font-semibold" : ""}`}>
      <span className={strong ? "" : "text-stone-600"}>{label}</span>
      <span className={`tabular-nums ${strong && value < 0 ? "text-red-700" : ""}`}>
        {negative && value > 0 ? "−" : ""}
        {formatRupiah(value)}
      </span>
    </div>
  );
}

export default async function FinancePage(props: PageProps<"/admin/keuangan">) {
  const { supabase } = await requireAdmin();
  const param = (await props.searchParams).bulan;
  const month = typeof param === "string" && /^\d{4}-\d{2}$/.test(param) ? param : currentMonth();
  const f = await getFinance(supabase, month);
  const c = f.current;
  const isCurrent = month >= currentMonth();

  return (
    <>
      <PageHeader
        title="Laporan keuangan"
        description="Dihitung dari pesanan yang sudah dibayar (tanggal bayar) dan pengeluaran yang Anda catat."
        actions={
          <a href={`/admin/keuangan/unduh?bulan=${month}`} className={adminButtonOutline}>
            <Download size={16} /> Unduh Excel (CSV)
          </a>
        }
      />

      <div className="mb-6 flex items-center gap-2">
        <Link href={`/admin/keuangan?bulan=${shiftMonth(month, -1)}`} aria-label="Bulan sebelumnya" className="rounded-lg p-2 hover:bg-white"><ChevronLeft size={18} /></Link>
        <span className="min-w-40 text-center font-medium capitalize">{monthLabel(month)}</span>
        {!isCurrent && (
          <Link href={`/admin/keuangan?bulan=${shiftMonth(month, 1)}`} aria-label="Bulan berikutnya" className="rounded-lg p-2 hover:bg-white"><ChevronRight size={18} /></Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <section className={`${adminCard} text-sm`}>
          <h2 className="mb-2 font-semibold">Laba rugi</h2>
          <Line label={`Penjualan produk (${c.orders} pesanan, ${c.items} barang)`} value={c.sales} />
          <Line label="Modal barang terjual (HPP)" value={c.cogs} negative />
          <Line label="Laba kotor" value={c.sales - c.cogs} strong />
          <Line label="Pengeluaran" value={c.expenses} negative />
          <Line label="Laba bersih" value={c.profit} strong />
          <p className="mt-4 text-xs leading-5 text-stone-500">
            Ongkir yang dibayar pembeli ({formatRupiah(c.shipping)}) tidak dihitung sebagai laba karena diteruskan ke kurir.
            Bila ada selisih ongkir, catat sebagai pengeluaran.
          </p>
        </section>

        <ExpenseManager month={month} expenses={f.expenses} />
      </div>

      <section className={`${adminCard} mt-6 overflow-x-auto`}>
        <h2 className="mb-4 font-semibold">12 bulan terakhir</h2>
        <table className="w-full min-w-[640px] text-right text-sm">
          <thead className="text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="py-2 text-left font-medium">Bulan</th>
              <th className="py-2 font-medium">Pesanan</th>
              <th className="py-2 font-medium">Penjualan</th>
              <th className="py-2 font-medium">HPP</th>
              <th className="py-2 font-medium">Pengeluaran</th>
              <th className="py-2 font-medium">Laba bersih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 tabular-nums">
            {f.rows.map((row) => (
              <tr key={row.month} className={row.month === month ? "bg-stone-50 font-medium" : ""}>
                <td className="py-2.5 text-left capitalize">
                  <Link href={`/admin/keuangan?bulan=${row.month}`} className="hover:underline">{monthLabel(row.month)}</Link>
                </td>
                <td className="py-2.5">{row.orders}</td>
                <td className="py-2.5">{formatRupiah(row.sales)}</td>
                <td className="py-2.5">{formatRupiah(row.cogs)}</td>
                <td className="py-2.5">{formatRupiah(row.expenses)}</td>
                <td className={`py-2.5 ${row.profit < 0 ? "text-red-700" : ""}`}>{formatRupiah(row.profit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={`${adminCard} mt-6 overflow-x-auto`}>
        <h2 className="mb-4 font-semibold">Pesanan dibayar bulan ini</h2>
        {f.orders.length === 0 ? (
          <p className="text-sm text-stone-500">Belum ada.</p>
        ) : (
          <table className="w-full min-w-[480px] text-sm">
            <tbody className="divide-y divide-stone-100">
              {f.orders.map((order) => (
                <tr key={order.id}>
                  <td className="py-2.5">
                    <Link href={`/admin/pesanan/${order.id}`} className="hover:underline">{order.code}</Link>
                  </td>
                  <td className="py-2.5 text-stone-500">{formatDate(order.paid_at!, true)}</td>
                  <td className="py-2.5 text-right tabular-nums">{formatRupiah(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
