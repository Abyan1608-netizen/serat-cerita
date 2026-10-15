"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { buttonOutline, buttonPrimary } from "@/components/ui/styles";
import { addToCart } from "@/lib/store";

export default function AddToCart({ slug }: { slug: string }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-full border border-taupe">
          <button
            type="button"
            aria-label="Kurangi jumlah"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-12 w-12 items-center justify-center disabled:opacity-40"
          >
            <Minus size={16} strokeWidth={1.5} />
          </button>
          <span className="w-8 text-center text-sm" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Tambah jumlah"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-12 w-12 items-center justify-center"
          >
            <Plus size={16} strokeWidth={1.5} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            addToCart(slug, quantity);
            setAdded(true);
          }}
          className={buttonPrimary}
        >
          {added ? (
            <Check size={16} strokeWidth={1.5} />
          ) : (
            <ShoppingBag size={16} strokeWidth={1.5} />
          )}
          {added ? "Ditambahkan" : "Tambah ke Keranjang"}
        </button>
      </div>

      {added && (
        <Link href="/cart" className={buttonOutline}>
          Lihat Keranjang
        </Link>
      )}
    </div>
  );
}
