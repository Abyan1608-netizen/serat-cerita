import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { resolveSettings, type StoreSettings } from "@/lib/settings";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Category, Product } from "@/lib/types";

// Tanpa kolom `cost` (harga modal) — kolom itu hanya bisa dibaca admin.
const PRODUCT_FIELDS =
  "id, name, slug, category_id, description, details, price, stock, status, featured, images, sort_order, created_at, updated_at, category:categories(id, name, slug)";

// Data publik selalu diambil saat diminta agar perubahan admin langsung tampil.

export const getSettings = cache(async (): Promise<StoreSettings> => {
  await connection();
  if (!isSupabaseConfigured()) return resolveSettings(null);

  const { data } = await createPublicClient()
    .from("store_settings")
    .select("data")
    .eq("id", 1)
    .maybeSingle();

  return resolveSettings(data?.data);
});

export const getCategories = cache(async (): Promise<Category[]> => {
  await connection();
  const { data, error } = await createPublicClient()
    .from("categories")
    .select("id, name, slug, sort_order")
    .order("sort_order")
    .order("name");
  if (error) throw error;
  return data;
});

export async function getProducts(options: {
  featured?: boolean;
  categorySlug?: string;
  query?: string;
} = {}): Promise<Product[]> {
  await connection();
  let request = createPublicClient()
    .from("products")
    .select(
      options.categorySlug
        ? PRODUCT_FIELDS.replace("categories(", "categories!inner(")
        : PRODUCT_FIELDS,
    )
    .neq("status", "hidden")
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (options.featured) request = request.eq("featured", true);
  if (options.categorySlug) request = request.eq("category.slug", options.categorySlug);
  if (options.query) {
    const q = options.query.replace(/[%,()]/g, " ").trim();
    if (q) request = request.ilike("name", `%${q}%`);
  }

  const { data, error } = await request;
  if (error) throw error;
  return data as unknown as Product[];
}

export const getProduct = cache(async (slug: string): Promise<Product | null> => {
  await connection();
  const { data, error } = await createPublicClient()
    .from("products")
    .select(PRODUCT_FIELDS)
    .eq("slug", slug)
    .neq("status", "hidden")
    .maybeSingle();
  if (error) throw error;
  return data as unknown as Product | null;
});

/** Produk untuk keranjang: harga & stok terbaru berdasarkan ID. */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const { data, error } = await createPublicClient()
    .from("products")
    .select(PRODUCT_FIELDS)
    .in("id", ids);
  if (error) throw error;
  return data as unknown as Product[];
}
