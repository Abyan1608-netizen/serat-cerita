"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteProduct, saveProduct, type ProductInput } from "@/app/admin/actions";
import { ImagesField } from "@/components/admin/ImageField";
import MoneyInput from "@/components/admin/MoneyInput";
import { adminButton, adminButtonDanger, adminCard, adminHint, adminInput, adminLabel } from "@/components/admin/ui";
import { formatRupiah } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function ProductForm({
  product,
  categories,
}: {
  product: Product | null;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductInput>({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    categoryId: product?.category_id ?? "",
    description: product?.description ?? "",
    details: product?.details ?? [],
    price: product?.price ?? 0,
    cost: product?.cost ?? 0,
    stock: product?.stock ?? 1,
    status: product?.status ?? "active",
    featured: product?.featured ?? false,
    images: product?.images ?? [],
    sortOrder: product?.sort_order ?? 0,
  });
  const [detailsText, setDetailsText] = useState(form.details.join("\n"));
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  function save() {
    startTransition(async () => {
      const details = detailsText.split("\n").map((line) => line.trim()).filter(Boolean);
      const result = await saveProduct(product?.id ?? null, { ...form, details });
      if (!result.ok) {
        setMessage({ ok: false, text: result.error });
        return;
      }
      setMessage({ ok: true, text: result.message ?? "Tersimpan" });
      if (!product) router.replace(`/admin/produk/${result.id}`);
      else router.refresh();
    });
  }

  function remove() {
    if (!product || !confirm(`Hapus produk "${product.name}"? Riwayat pesanan tetap tersimpan.`)) return;
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if (result.ok) router.replace("/admin/produk");
      else setMessage({ ok: false, text: result.error });
    });
  }

  const margin = form.price - form.cost;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="grid gap-6 lg:grid-cols-[1.5fr_1fr]"
    >
      <div className="grid content-start gap-6">
        <section className={`${adminCard} grid gap-5`}>
          <label className={adminLabel}>
            Nama produk
            <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={adminInput} />
          </label>
          <label className={adminLabel}>
            Deskripsi
            <textarea rows={5} value={form.description} onChange={(e) => set("description", e.target.value)} className={adminInput} />
          </label>
          <label className={adminLabel}>
            Detail singkat
            <span className={adminHint}>Satu detail per baris, mis. “Ukuran ± 7 cm”.</span>
            <textarea rows={4} value={detailsText} onChange={(e) => setDetailsText(e.target.value)} className={adminInput} />
          </label>
        </section>

        <section className={adminCard}>
          <h2 className="mb-1 font-semibold">Foto</h2>
          <p className={`${adminHint} mb-4`}>Foto pertama menjadi foto utama. Foto otomatis diperkecil agar website tetap cepat.</p>
          <ImagesField value={form.images} onChange={(images) => set("images", images)} />
        </section>
      </div>

      <div className="grid content-start gap-6">
        <section className={`${adminCard} grid gap-5`}>
          <label className={adminLabel}>
            Status
            <select value={form.status} onChange={(e) => set("status", e.target.value as ProductInput["status"])} className={adminInput}>
              <option value="active">Dijual</option>
              <option value="coming_soon">Segera hadir (belum bisa dibeli)</option>
              <option value="hidden">Disembunyikan dari toko</option>
            </select>
          </label>
          <label className={adminLabel}>
            Kategori
            <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={adminInput}>
              <option value="">Tanpa kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <div className={adminLabel}>
            <label htmlFor="price">Harga jual</label>
            <MoneyInput id="price" value={form.price} onChange={(value) => set("price", value)} />
          </div>
          <div className={adminLabel}>
            <label htmlFor="cost">Modal per barang (HPP)</label>
            <span className={adminHint}>Tidak terlihat pembeli. Dipakai untuk menghitung keuntungan.</span>
            <MoneyInput id="cost" value={form.cost} onChange={(value) => set("cost", value)} />
            {form.price > 0 && (
              <span className={`text-xs font-normal ${margin >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                Untung per barang: {formatRupiah(margin)}
              </span>
            )}
          </div>
          <label className={adminLabel}>
            Stok
            <input type="number" min={0} value={form.stock} onChange={(e) => set("stock", Math.max(0, Number(e.target.value) || 0))} className={adminInput} />
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-stone-900" />
            Tampilkan di beranda
          </label>
        </section>

        <details className={adminCard}>
          <summary className="cursor-pointer text-sm font-medium">Pengaturan lanjutan</summary>
          <div className="mt-4 grid gap-4">
            <label className={adminLabel}>
              Urutan tampil
              <span className={adminHint}>Angka kecil tampil lebih dulu.</span>
              <input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value) || 0)} className={adminInput} />
            </label>
            <label className={adminLabel}>
              Alamat halaman (slug)
              <span className={adminHint}>Kosongkan agar dibuat otomatis dari nama.</span>
              <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="amigurumi-keychain" className={adminInput} />
            </label>
          </div>
        </details>

        <div className="grid gap-3">
          <button type="submit" disabled={pending} className={adminButton}>
            {pending ? "Menyimpan…" : "Simpan produk"}
          </button>
          {message && (
            <p role="status" className={`text-sm ${message.ok ? "text-emerald-700" : "text-red-700"}`}>{message.text}</p>
          )}
          {product && (
            <button type="button" onClick={remove} disabled={pending} className={adminButtonDanger}>
              Hapus produk
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
