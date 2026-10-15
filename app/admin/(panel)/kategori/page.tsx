import CategoryManager from "@/components/admin/CategoryManager";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Kategori" };

export default async function CategoriesPage() {
  const { supabase } = await requireAdmin();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("id, name, slug, sort_order").order("sort_order").order("name"),
    supabase.from("products").select("category_id"),
  ]);
  const counts = new Map<string, number>();
  for (const p of products ?? []) if (p.category_id) counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);

  return (
    <>
      <PageHeader title="Kategori" description="Kelompok produk yang tampil sebagai filter di halaman Produk." />
      <CategoryManager
        categories={(categories ?? []).map((c) => ({ ...c, count: counts.get(c.id) ?? 0 }))}
      />
    </>
  );
}
