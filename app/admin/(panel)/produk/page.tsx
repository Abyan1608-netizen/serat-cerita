import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { adminButton, adminCard } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { formatRupiah } from "@/lib/format";
import type { Product } from "@/lib/types";

export const metadata = { title: "Produk" };

const statusLabel = { active: "Dijual", coming_soon: "Segera hadir", hidden: "Disembunyikan" };

export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const products = data as Product[];

  return (
    <>
      <PageHeader
        title="Produk"
        description="Tambah, ubah harga, stok, foto, dan deskripsi produk."
        actions={
          <Link href="/admin/produk/baru" className={adminButton}>
            <Plus size={16} /> Tambah produk
          </Link>
        }
      />

      <div className={`${adminCard} overflow-x-auto p-0 sm:p-0`}>
        {products.length === 0 ? (
          <p className="p-6 text-sm text-stone-500">Belum ada produk.</p>
        ) : (
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Produk</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Harga</th>
                <th className="px-5 py-3 text-right font-medium">Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-stone-50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/produk/${product.id}`} className="flex items-center gap-3">
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                        {product.images[0] ? (
                          <Image src={product.images[0]} alt="" fill sizes="48px" className="object-cover" />
                        ) : (
                          <span className="flex h-full items-center justify-center" aria-hidden>🧶</span>
                        )}
                      </span>
                      <span>
                        <span className="font-medium hover:underline">{product.name}</span>
                        <span className="block text-xs text-stone-500">
                          {product.category?.name ?? "Tanpa kategori"}
                          {product.featured && " · Ditampilkan di beranda"}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-stone-600">{statusLabel[product.status]}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatRupiah(product.price)}</td>
                  <td className={`px-5 py-3 text-right tabular-nums ${product.status === "active" && product.stock === 0 ? "font-medium text-red-700" : ""}`}>
                    {product.stock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
