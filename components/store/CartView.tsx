"use client";

import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import ProductImage from "@/components/store/ProductImage";
import { buttonPrimary } from "@/components/store/ui";
import { useCartItems } from "@/components/store/useCartItems";
import { setCartQuantity } from "@/lib/cart";
import { formatRupiah } from "@/lib/format";

export function EmptyCart() {
  return (
    <div className="mt-10 rounded-[2rem] bg-surface px-7 py-14 text-center">
      <p className="text-sm text-ink-muted">Keranjang Anda masih kosong.</p>
      <Link href="/produk" className={`${buttonPrimary} mt-6`}>
        Lihat produk
      </Link>
    </div>
  );
}

export default function CartView() {
  const { loading, items, unavailable, subtotal } = useCartItems();

  if (loading) return <p className="mt-10 text-sm text-ink-muted">Memuat keranjang…</p>;
  if (items.length === 0) return <EmptyCart />;

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px] lg:items-start">
      <ul className="divide-y divide-line border-y border-line">
        {items.map(({ product, quantity }) => {
          const problem =
            product.status !== "active"
              ? "Produk tidak tersedia"
              : product.stock < quantity
                ? `Stok tersisa ${product.stock}`
                : null;

          return (
            <li key={product.id} className="flex items-center gap-4 py-5 sm:gap-6">
              <Link href={`/produk/${product.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                <ProductImage src={product.images[0]} alt={product.name} sizes="80px" />
              </Link>

              <div className="min-w-0 flex-1">
                <Link href={`/produk/${product.slug}`} className="block truncate hover:text-accent">
                  {product.name}
                </Link>
                <p className="mt-1 text-xs text-ink-muted">{formatRupiah(product.price)}</p>
                {problem && <p className="mt-1 text-xs font-medium text-red-700">{problem}</p>}

                <div className="mt-3 flex w-fit items-center rounded-full border border-line">
                  <button
                    type="button"
                    aria-label={`Kurangi ${product.name}`}
                    onClick={() => setCartQuantity(product.id, quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center"
                  >
                    <Minus size={14} strokeWidth={1.5} />
                  </button>
                  <span className="w-6 text-center text-xs">{quantity}</span>
                  <button
                    type="button"
                    aria-label={`Tambah ${product.name}`}
                    disabled={quantity >= product.stock}
                    onClick={() => setCartQuantity(product.id, quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center disabled:opacity-30"
                  >
                    <Plus size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <button
                  type="button"
                  aria-label={`Hapus ${product.name}`}
                  onClick={() => setCartQuantity(product.id, 0)}
                  className="text-ink-muted hover:text-ink"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
                <p className="text-sm font-medium">{formatRupiah(product.price * quantity)}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="rounded-[2rem] bg-surface p-7">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-muted">Subtotal</span>
          <span className="text-lg font-medium">{formatRupiah(subtotal)}</span>
        </div>
        <p className="mt-2 text-xs leading-5 text-ink-muted">Ongkir dipilih di langkah berikutnya.</p>
        {unavailable.length > 0 ? (
          <p className="mt-6 text-xs text-red-700">Perbaiki item yang ditandai sebelum melanjutkan.</p>
        ) : (
          <Link href="/checkout" className={`${buttonPrimary} mt-6 w-full`}>
            Lanjut ke pembayaran
          </Link>
        )}
      </aside>
    </div>
  );
}
