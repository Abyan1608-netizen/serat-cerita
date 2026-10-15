import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { adminCard, adminInput } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatRupiah, orderStatusLabels } from "@/lib/format";
import { expireStaleOrders } from "@/lib/orders";
import type { Order, OrderStatus } from "@/lib/types";

export const metadata = { title: "Pesanan" };

const filters: { value: string; label: string }[] = [
  { value: "", label: "Semua" },
  ...(Object.keys(orderStatusLabels) as OrderStatus[]).map((status) => ({
    value: status,
    label: orderStatusLabels[status],
  })),
];

export default async function OrdersPage(props: PageProps<"/admin/pesanan">) {
  const { supabase } = await requireAdmin();
  await expireStaleOrders();
  const params = await props.searchParams;
  const status = typeof params.status === "string" ? params.status : "";
  const q = typeof params.q === "string" ? params.q.trim() : "";

  let query = supabase
    .from("orders")
    .select("id, code, customer_name, customer_phone, total, status, created_at, shipping_name")
    .order("created_at", { ascending: false })
    .limit(100);
  if (status && status in orderStatusLabels) query = query.eq("status", status);
  if (q) {
    const safe = q.replace(/[%,()]/g, " ");
    query = query.or(`code.ilike.%${safe}%,customer_name.ilike.%${safe}%,customer_phone.ilike.%${safe}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  const orders = data as Order[];

  const href = (value: string) => {
    const search = new URLSearchParams();
    if (value) search.set("status", value);
    if (q) search.set("q", q);
    return search.size ? `/admin/pesanan?${search}` : "/admin/pesanan";
  };

  return (
    <>
      <PageHeader title="Pesanan" description="Klik pesanan untuk melihat detail dan mengubah status." />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Link
              key={filter.value || "all"}
              href={href(filter.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                filter.value === status ? "bg-stone-900 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
              }`}
            >
              {filter.label}
            </Link>
          ))}
        </nav>
        <form className="lg:w-72">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Cari kode, nama, atau no. HP" className={adminInput} />
        </form>
      </div>

      <div className={`${adminCard} overflow-x-auto p-0 sm:p-0`}>
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-stone-500">Tidak ada pesanan.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Pesanan</th>
                <th className="px-5 py-3 font-medium">Pembeli</th>
                <th className="px-5 py-3 font-medium">Pengiriman</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/pesanan/${order.id}`} className="font-medium hover:underline">{order.code}</Link>
                    <p className="text-xs text-stone-500">{formatDate(order.created_at, true)}</p>
                  </td>
                  <td className="px-5 py-3">
                    {order.customer_name}
                    <p className="text-xs text-stone-500">{order.customer_phone}</p>
                  </td>
                  <td className="px-5 py-3 text-stone-600">{order.shipping_name}</td>
                  <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-5 py-3 text-right font-medium tabular-nums">{formatRupiah(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
