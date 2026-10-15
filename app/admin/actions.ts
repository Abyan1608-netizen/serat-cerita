"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { settingsSchema, type StoreSettings } from "@/lib/settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { detectChatId, isTelegramConfigured, sendTestMessage } from "@/lib/telegram";
import type { OrderStatus } from "@/lib/types";

export type ActionResult = { ok: true; message?: string; id?: string } | { ok: false; error: string };

const fail = (error: string): ActionResult => ({ ok: false, error });

function refreshAll() {
  revalidatePath("/", "layout");
}

export async function signOut() {
  const { supabase } = await requireAdmin();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------- Pesanan

const statuses = ["pending_payment", "paid", "processing", "shipped", "completed", "cancelled", "expired"] as const;

export async function updateOrder(
  orderId: string,
  input: { status: OrderStatus; trackingNumber: string },
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(statuses), tracking: z.string().trim().max(80) })
    .safeParse({ id: orderId, status: input.status, tracking: input.trackingNumber });
  if (!parsed.success) return fail("Data tidak valid");

  const { error } = await supabase.rpc("set_order_status", {
    p_order_id: parsed.data.id,
    p_status: parsed.data.status,
  });
  if (error) return fail(error.message);

  await supabase
    .from("orders")
    .update({ tracking_number: parsed.data.tracking || null })
    .eq("id", parsed.data.id);

  refreshAll();
  return { ok: true, message: "Pesanan diperbarui" };
}

// ---------------------------------------------------------------- Produk

const productSchema = z.object({
  name: z.string().trim().min(1, "Nama produk wajib diisi").max(120),
  slug: z.string().trim().max(80),
  categoryId: z.union([z.uuid(), z.literal("")]),
  description: z.string().trim().max(3000),
  details: z.array(z.string().trim().min(1).max(200)).max(20),
  price: z.number().int().min(0, "Harga tidak boleh minus"),
  cost: z.number().int().min(0, "Modal tidak boleh minus"),
  stock: z.number().int().min(0, "Stok tidak boleh minus"),
  status: z.enum(["active", "coming_soon", "hidden"]),
  featured: z.boolean(),
  images: z.array(z.url()).max(10),
  sortOrder: z.number().int(),
});

export type ProductInput = z.input<typeof productSchema>;

export async function saveProduct(id: string | null, input: ProductInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const p = parsed.data;

  const row = {
    name: p.name,
    slug: slugify(p.slug || p.name) || `produk-${Date.now()}`,
    category_id: p.categoryId || null,
    description: p.description,
    details: p.details,
    price: p.price,
    cost: p.cost,
    stock: p.stock,
    status: p.status,
    featured: p.featured,
    images: p.images,
    sort_order: p.sortOrder,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = id
    ? await supabase.from("products").update(row).eq("id", id).select("id").single()
    : await supabase.from("products").insert(row).select("id").single();

  if (error) {
    return fail(error.code === "23505" ? "Alamat (slug) sudah dipakai produk lain" : error.message);
  }
  refreshAll();
  return { ok: true, id: data.id, message: "Produk disimpan" };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return fail(error.message);
  refreshAll();
  return { ok: true };
}

// ---------------------------------------------------------------- Kategori

export async function saveCategory(
  id: string | null,
  input: { name: string; sortOrder: number },
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const name = input.name.trim();
  if (!name) return fail("Nama kategori wajib diisi");
  const row = { name, slug: slugify(name) || `kategori-${Date.now()}`, sort_order: Math.trunc(input.sortOrder) || 0 };

  const { error } = id
    ? await supabase.from("categories").update(row).eq("id", id)
    : await supabase.from("categories").insert(row);
  if (error) return fail(error.code === "23505" ? "Kategori dengan nama ini sudah ada" : error.message);
  refreshAll();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return fail(error.message);
  refreshAll();
  return { ok: true };
}

// ---------------------------------------------------------------- Keuangan

const expenseSchema = z.object({
  spentOn: z.iso.date("Tanggal tidak valid"),
  category: z.string().trim().min(1).max(60),
  description: z.string().trim().max(300),
  amount: z.number().int().positive("Jumlah harus lebih dari 0"),
});

export async function addExpense(input: z.input<typeof expenseSchema>): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const { error } = await supabase.from("expenses").insert({
    spent_on: parsed.data.spentOn,
    category: parsed.data.category,
    description: parsed.data.description,
    amount: parsed.data.amount,
  });
  if (error) return fail(error.message);
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Pengeluaran dicatat" };
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin", "layout");
  return { ok: true };
}

// ---------------------------------------------------------------- Tampilan

export async function saveSettings(settings: StoreSettings): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = settingsSchema.safeParse(settings);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(`${issue.path.join(" › ")}: ${issue.message}`);
  }
  const { error } = await supabase
    .from("store_settings")
    .update({ data: parsed.data, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return fail(error.message);
  refreshAll();
  return { ok: true, message: "Tersimpan — perubahan sudah tampil di toko" };
}

// ---------------------------------------------------------------- Telegram

export async function connectTelegram(): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!isTelegramConfigured()) return fail("TELEGRAM_BOT_TOKEN belum diatur di Vercel");
  try {
    const chat = await detectChatId();
    if (!chat) return fail("Belum ada pesan. Buka bot Anda di Telegram, tekan Start / kirim pesan apa saja, lalu coba lagi.");
    await sendTestMessage(chat.id);
    const { error } = await supabase
      .from("private_settings")
      .update({ telegram_chat_id: chat.id, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) return fail(error.message);
    revalidatePath("/admin/pengaturan");
    return { ok: true, message: `Terhubung ke ${chat.name}. Cek Telegram Anda.` };
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Gagal menghubungi Telegram");
  }
}

export async function testTelegram(): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("private_settings").select("telegram_chat_id").eq("id", 1).single();
  if (!data?.telegram_chat_id) return fail("Telegram belum terhubung");
  try {
    await sendTestMessage(data.telegram_chat_id);
    return { ok: true, message: "Pesan uji terkirim" };
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Gagal mengirim");
  }
}

// ---------------------------------------------------------------- Admin

export async function addAdmin(input: { email: string; password: string }): Promise<ActionResult> {
  await requireAdmin();
  const parsed = z
    .object({ email: z.email("Email tidak valid"), password: z.string().min(8, "Password minimal 8 karakter") })
    .safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const service = createAdminClient();
  const email = parsed.data.email.toLowerCase();
  const { data, error } = await service.auth.admin.createUser({
    email,
    password: parsed.data.password,
    email_confirm: true,
  });
  if (error || !data.user) return fail(error?.message ?? "Gagal membuat akun");

  const { error: insertError } = await service.from("admins").insert({ user_id: data.user.id, email });
  if (insertError) return fail(insertError.message);
  revalidatePath("/admin/pengaturan");
  return { ok: true, message: "Admin ditambahkan" };
}

export async function removeAdmin(userId: string): Promise<ActionResult> {
  const { admin } = await requireAdmin();
  if (userId === admin.id) return fail("Anda tidak bisa menghapus akun sendiri");

  const service = createAdminClient();
  const { error } = await service.auth.admin.deleteUser(userId);
  if (error) return fail(error.message);
  revalidatePath("/admin/pengaturan");
  return { ok: true };
}

export async function changePassword(password: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (password.length < 8) return fail("Password minimal 8 karakter");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return fail(error.message);
  return { ok: true, message: "Password diganti" };
}
