"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { getProductsByIds, getSettings } from "@/lib/data";
import { normalizePhone } from "@/lib/format";
import { createSnapTransaction, isMidtransConfigured } from "@/lib/midtrans";
import { generateOrderCode, orderSummaryLines } from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyOwner } from "@/lib/telegram";
import type { Order, OrderItem, Product } from "@/lib/types";

const idsSchema = z.array(z.uuid()).max(50);

/** Data produk terbaru untuk isi keranjang (harga & stok). */
export async function loadCartProducts(ids: string[]): Promise<Product[]> {
  const parsed = idsSchema.safeParse(ids);
  if (!parsed.success) return [];
  return getProductsByIds(parsed.data);
}

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Nama wajib diisi").max(80),
  phone: z
    .string()
    .trim()
    .transform(normalizePhone)
    .pipe(z.string().regex(/^62\d{8,13}$/, "Nomor WhatsApp tidak valid")),
  email: z.union([z.literal(""), z.email("Email tidak valid")]).default(""),
  address: z.string().trim().min(10, "Alamat lengkap wajib diisi").max(500),
  note: z.string().trim().max(500).default(""),
  shipping: z.number().int().min(0),
  items: z
    .array(z.object({ productId: z.uuid(), quantity: z.number().int().min(1).max(99) }))
    .min(1, "Keranjang kosong")
    .max(50),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutResult =
  | { ok: true; code: string; paymentUrl: string | null }
  | { ok: false; error: string };

async function siteOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = parsed.data;

  const settings = await getSettings();
  const shipping = settings.checkout.shippingOptions[data.shipping];
  if (!shipping) return { ok: false, error: "Pilih metode pengiriman" };

  // Gabungkan baris produk yang sama.
  const quantities = new Map<string, number>();
  for (const item of data.items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }

  const supabase = createAdminClient();
  const code = generateOrderCode();
  const { data: created, error } = await supabase
    .rpc("place_order", {
      p_code: code,
      p_customer_name: data.name,
      p_customer_phone: data.phone,
      p_customer_email: data.email,
      p_address: data.address,
      p_note: data.note,
      p_shipping_name: shipping.name,
      p_shipping_cost: shipping.price,
      p_items: [...quantities].map(([product_id, quantity]) => ({ product_id, quantity })),
    })
    .single();

  if (error || !created) {
    const message = error?.message ?? "";
    return {
      ok: false,
      error: /stok|tidak tersedia|kosong/i.test(message)
        ? message
        : "Pesanan gagal dibuat. Silakan coba lagi.",
    };
  }

  const order = created as Order;
  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", order.id);
  order.order_items = (items ?? []) as OrderItem[];

  let paymentUrl: string | null = null;
  if (isMidtransConfigured()) {
    try {
      const snap = await createSnapTransaction({
        orderCode: order.code,
        grossAmount: order.total,
        items: [
          ...order.order_items.map((item) => ({
            id: item.product_id ?? item.id,
            name: item.product_name,
            price: item.price,
            quantity: item.quantity,
          })),
          ...(order.shipping_cost > 0
            ? [{ id: "ongkir", name: `Ongkir (${order.shipping_name})`, price: order.shipping_cost, quantity: 1 }]
            : []),
        ],
        customer: { name: order.customer_name, phone: order.customer_phone, email: order.customer_email, address: order.address },
        finishUrl: `${await siteOrigin()}/pesanan/${order.code}`,
      });
      paymentUrl = snap.redirect_url;
      await supabase.from("orders").update({ payment_url: paymentUrl }).eq("id", order.id);
    } catch (snapError) {
      console.error(snapError);
      // Pesanan tetap tersimpan; pembeli bisa membayar lewat konfirmasi admin.
    }
  }

  await notifyOwner([
    `🛍️ **Pesanan baru** — ${order.code}`,
    `${order.customer_name} · ${order.customer_phone}`,
    order.address,
    ...orderSummaryLines(order),
    order.note ? `Catatan: ${order.note}` : "",
    "Status: menunggu pembayaran",
  ].filter(Boolean));

  return { ok: true, code: order.code, paymentUrl };
}

