"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { adminButton, adminButtonOutline, adminCard, adminInput } from "@/components/admin/ui";

type Row = { id: string; name: string; sort_order: number; count: number };

function CategoryRow({ category, onError }: { category: Row; onError: (m: string) => void }) {
  const router = useRouter();
  const [name, setName] = useState(category.name);
  const [order, setOrder] = useState(category.sort_order);
  const [pending, startTransition] = useTransition();
  const dirty = name !== category.name || order !== category.sort_order;

  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Nama kategori" className={`${adminInput} min-w-40 flex-1`} />
      <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value) || 0)} aria-label="Urutan" className={`${adminInput} w-20`} />
      <span className="w-20 text-xs text-stone-500">{category.count} produk</span>
      <button
        type="button"
        disabled={!dirty || pending}
        onClick={() =>
          startTransition(async () => {
            const result = await saveCategory(category.id, { name, sortOrder: order });
            if (!result.ok) onError(result.error);
            router.refresh();
          })
        }
        className={adminButtonOutline}
      >
        Simpan
      </button>
      <button
        type="button"
        aria-label={`Hapus ${category.name}`}
        disabled={pending}
        onClick={() => {
          if (!confirm(`Hapus kategori "${category.name}"? Produknya tidak ikut terhapus.`)) return;
          startTransition(async () => {
            const result = await deleteCategory(category.id);
            if (!result.ok) onError(result.error);
            router.refresh();
          });
        }}
        className="rounded-lg p-2 text-red-700 hover:bg-red-50"
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
}

export default function CategoryManager({ categories }: { categories: Row[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className={`${adminCard} max-w-3xl`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startTransition(async () => {
            const result = await saveCategory(null, { name, sortOrder: categories.length + 1 });
            if (!result.ok) setError(result.error);
            else setName("");
            router.refresh();
          });
        }}
        className="flex gap-3"
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kategori baru" required className={adminInput} />
        <button type="submit" disabled={pending} className={adminButton}>Tambah</button>
      </form>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      <ul className="mt-4 divide-y divide-stone-100">
        {categories.map((category) => (
          <CategoryRow key={`${category.id}-${category.name}-${category.sort_order}`} category={category} onError={setError} />
        ))}
      </ul>
      {categories.length === 0 && <p className="mt-4 text-sm text-stone-500">Belum ada kategori.</p>}
    </div>
  );
}
