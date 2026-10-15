"use client";

import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { buttonPrimary } from "@/components/ui/styles";
import { getProduct, type Product } from "@/lib/products";
import { useStore } from "@/lib/store";

export default function WishlistView() {
  const { wishlist } = useStore();
  const items = wishlist
    .map(getProduct)
    .filter((product): product is Product => product !== undefined);

  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-[2rem] bg-linen px-7 py-14 text-center">
        <p className="text-sm text-muted">
          Belum ada yang disimpan. Tekan ikon ♡ pada produk untuk menyimpannya.
        </p>
        <Link href="/shop" className={`${buttonPrimary} mt-6`}>
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
