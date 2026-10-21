import { getAdmin } from "@/lib/auth";
import { dateKey, orderStatusLabels, PAID_STATUSES } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { currentMonth, shiftMonth } from "@/lib/reports";
import type { Expense, Order, Refund } from "@/lib/types";

function csvCell(value: string | number | null | undefined): string {
  const text = String(value ?? "");
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Laporan bulanan dalam CSV (pemisah titik koma agar langsung rapi di Excel Indonesia). */
export async function GET(request: Request) {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });
  const param = new URL(request.url).searchParams.get("bulan") ?? "";
  const month = /^\d{4}-\d{2}$/.test(param) ? param : currentMonth();
  const from = `${month}-01T00:00:00+07:00`;
  const to = `${shiftMonth(month, 1)}-01T00:00:00+07:00`;

  const supabase = await createClient();
  const [{ data: orders }, { data: expenses }, { data: refunds }] = await Promise.all([
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .in("status", PAID_STATUSES)
      .gte("paid_at", from)
      .lt("paid_at", to)
      .order("paid_at"),
    supabase
      .from("expenses")
      .select("*")
      .gte("spent_on", `${month}-01`)
      .lt("spent_on", `${shiftMonth(month, 1)}-01`)
      .order("spent_on"),
    supabase
      .from("refunds")
      .select("*, order:orders(code, customer_name)")
      .gte("refunded_at", from)
      .lt("refunded_at", to)
      .order("refunded_at"),
  ]);

  const rows: (string | number | null)[][] = [
    ["PENJUALAN"],
    ["Tanggal bayar", "Kode", "Pembeli", "Status", "Barang", "Penjualan produk", "HPP", "Ongkir", "Total dibayar"],
  ];
  for (const order of (orders ?? []) as Order[]) {
    const items = order.order_items ?? [];
    rows.push([
      dateKey(order.paid_at!),
      order.code,
      order.customer_name,
      orderStatusLabels[order.status],
      items.map((i) => `${i.product_name} x${i.quantity}`).join(", "),
      order.subtotal,
      items.reduce((sum, i) => sum + i.cost * i.quantity, 0),
      order.shipping_cost,
      order.total,
    ]);
  }
  rows.push([], ["REFUND"], ["Tanggal", "Kode", "Pembeli", "Cara pengembalian", "Catatan", "Jumlah"]);
  for (const refund of (refunds ?? []) as (Refund & { order: { code: string; customer_name: string } | null })[]) {
    rows.push([
      dateKey(refund.refunded_at),
      refund.order?.code ?? "",
      refund.order?.customer_name ?? "",
      refund.method,
      refund.note,
      refund.amount,
    ]);
  }
  rows.push([], ["PENGELUARAN"], ["Tanggal", "Jenis", "Keterangan", "Jumlah"]);
  for (const expense of (expenses ?? []) as Expense[]) {
    rows.push([expense.spent_on, expense.category, expense.description, expense.amount]);
  }

  const csv = "﻿" + rows.map((row) => row.map(csvCell).join(";")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="laporan-${month}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
