import ProductForm from "@/components/admin/ProductForm";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Produk baru" };

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const { data: categories } = await supabase.from("categories").select("id, name").order("sort_order");

  return (
    <>
      <PageHeader title="Produk baru" />
      <ProductForm product={null} categories={categories ?? []} />
    </>
  );
}
