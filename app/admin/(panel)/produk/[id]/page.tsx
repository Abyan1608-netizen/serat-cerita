import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/auth";
import type { Product } from "@/lib/types";

export const metadata = { title: "Ubah produk" };

export default async function EditProductPage(props: PageProps<"/admin/produk/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await props.params;
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id, name").order("sort_order"),
  ]);
  if (!product) notFound();

  return (
    <>
      <PageHeader title={`Ubah: ${product.name}`} />
      <ProductForm product={product as Product} categories={categories ?? []} />
    </>
  );
}
