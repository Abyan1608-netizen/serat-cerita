import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { dateKey, PAID_STATUSES } from "@/lib/format";
import type { Expense, Order, OrderItem, Refund } from "@/lib/types";

export type RefundRow = Refund & { order: Pick<Order, "code" | "customer_name"> | null };

type PaidOrder = Pick<Order, "id" | "code" | "subtotal" | "shipping_cost" | "total" | "paid_at"> & {
  order_items: Pick<OrderItem, "product_id" | "product_name" | "price" | "cost" | "quantity">[];
};

/** Awal bulan (WIB) dalam format ISO, mis. monthStart("2026-10") → 2026-10-01T00:00:00+07:00 */
function monthStart(month: string): string {
  return `${month}-01T00:00:00+07:00`;
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function currentMonth(): string {
  return dateKey(new Date()).slice(0, 7);
}

export function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, 1)),
  );
}

async function paidOrdersBetween(supabase: SupabaseClient, from: string, to: string): Promise<PaidOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, code, subtotal, shipping_cost, total, paid_at, order_items(product_id, product_name, price, cost, quantity)")
    .in("status", PAID_STATUSES)
    .gte("paid_at", from)
    .lt("paid_at", to)
    .order("paid_at");
  if (error) throw error;
  return data as PaidOrder[];
}

async function refundsBetween(supabase: SupabaseClient, from: string, to: string): Promise<RefundRow[]> {
  const { data, error } = await supabase
    .from("refunds")
    .select("*, order:orders(code, customer_name)")
    .gte("refunded_at", from)
    .lt("refunded_at", to)
    .order("refunded_at", { ascending: false });
  // Bila tabel refunds belum dibuat (schema.sql belum dijalankan ulang), anggap kosong.
  if (error) return [];
  return data as RefundRow[];
}

function refundTotals(refunds: RefundRow[]) {
  return {
    refunds: refunds.reduce((sum, r) => sum + r.amount, 0),
    cogsReversed: refunds.reduce((sum, r) => sum + r.cogs_reversed, 0),
  };
}

function totals(orders: PaidOrder[]) {
  let sales = 0;
  let shipping = 0;
  let cogs = 0;
  let items = 0;
  for (const order of orders) {
    sales += order.subtotal;
    shipping += order.shipping_cost;
    for (const item of order.order_items) {
      cogs += item.cost * item.quantity;
      items += item.quantity;
    }
  }
  return { sales, shipping, cogs, items, orders: orders.length };
}

export async function getDashboard(supabase: SupabaseClient) {
  const today = dateKey(new Date());
  const month = today.slice(0, 7);
  const since = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
  const sinceKey = dateKey(since);
  const from = [`${sinceKey}T00:00:00+07:00`, monthStart(month)].sort()[0];

  const [orders, refunds, pending, toProcess, recent] = await Promise.all([
    paidOrdersBetween(supabase, from, monthStart(shiftMonth(month, 1))),
    refundsBetween(supabase, from, monthStart(shiftMonth(month, 1))),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending_payment"),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["paid", "processing"]),
    supabase.from("orders").select("id, code, customer_name, total, status, created_at").order("created_at", { ascending: false }).limit(8),
  ]);

  const byDay = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    byDay.set(dateKey(new Date(since.getTime() + i * 24 * 60 * 60 * 1000)), 0);
  }
  for (const order of orders) {
    const key = dateKey(order.paid_at!);
    if (byDay.has(key)) byDay.set(key, byDay.get(key)! + order.subtotal);
  }

  const monthOrders = orders.filter((order) => dateKey(order.paid_at!).startsWith(month));
  const todayOrders = orders.filter((order) => dateKey(order.paid_at!) === today);

  const productTotals = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const order of monthOrders) {
    for (const item of order.order_items) {
      const key = item.product_id ?? item.product_name;
      const entry = productTotals.get(key) ?? { name: item.product_name, quantity: 0, revenue: 0 };
      entry.quantity += item.quantity;
      entry.revenue += item.price * item.quantity;
      productTotals.set(key, entry);
    }
  }

  return {
    month,
    today: { ...totals(todayOrders), ...refundTotals(refunds.filter((r) => dateKey(r.refunded_at) === today)) },
    thisMonth: {
      ...totals(monthOrders),
      ...refundTotals(refunds.filter((r) => dateKey(r.refunded_at).startsWith(month))),
    },
    pendingPayment: pending.count ?? 0,
    toProcess: toProcess.count ?? 0,
    daily: [...byDay].map(([date, value]) => ({ date, value })),
    topProducts: [...productTotals.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
    recent: (recent.data ?? []) as Pick<Order, "id" | "code" | "customer_name" | "total" | "status" | "created_at">[],
  };
}

export async function getFinance(supabase: SupabaseClient, month: string) {
  const firstMonth = shiftMonth(month, -11);
  const [orders, refunds, expensesResult] = await Promise.all([
    paidOrdersBetween(supabase, monthStart(firstMonth), monthStart(shiftMonth(month, 1))),
    refundsBetween(supabase, monthStart(firstMonth), monthStart(shiftMonth(month, 1))),
    supabase
      .from("expenses")
      .select("*")
      .gte("spent_on", `${firstMonth}-01`)
      .lt("spent_on", `${shiftMonth(month, 1)}-01`)
      .order("spent_on", { ascending: false }),
  ]);
  if (expensesResult.error) throw expensesResult.error;
  const expenses = expensesResult.data as Expense[];

  const months = Array.from({ length: 12 }, (_, i) => shiftMonth(firstMonth, i));
  const rows = months.map((m) => {
    const t = totals(orders.filter((order) => dateKey(order.paid_at!).startsWith(m)));
    const spent = expenses.filter((e) => e.spent_on.startsWith(m)).reduce((sum, e) => sum + e.amount, 0);
    const r = refundTotals(refunds.filter((x) => dateKey(x.refunded_at).startsWith(m)));
    // Refund mengurangi penjualan; bila stok dikembalikan, modal barangnya juga batal terpakai.
    const cogs = t.cogs - r.cogsReversed;
    return { month: m, ...t, ...r, cogs, expenses: spent, profit: t.sales - r.refunds - cogs - spent };
  });

  const current = rows[rows.length - 1];
  return {
    current,
    rows: rows.reverse(),
    expenses: expenses.filter((e) => e.spent_on.startsWith(month)),
    refunds: refunds.filter((r) => dateKey(r.refunded_at).startsWith(month)),
    orders: orders.filter((order) => dateKey(order.paid_at!).startsWith(month)),
  };
}
