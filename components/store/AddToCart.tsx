"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { buttonOutline, buttonPrimary } from "@/components/store/ui";
import { addToCart, useCart } from "@/lib/cart";

export default function AddToCart({ productId, stock }: { productId: string; stock: number }) {
  const cart = useCart();
  const inCart = cart.find((line) => line.productId === productId)?.quantity ?? 0;
  const available = Math.max(stock - inCart, 0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const qty = Math.min(quantity, Math.max(available, 1));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-full border border-line">
          <button
            type="button"
            aria-label="Kurangi jumlah"
            disabled={qty <= 1}
            onClick={() => setQuantity(qty - 1)}
            className="flex h-12 w-12 items-center justify-center disabled:opacity-30"
          >
            <Minus size={16} strokeWidth={1.5} />
          </button>
          <span className="w-8 text-center text-sm" aria-live="polite">{qty}</span>
          <button
            type="button"
            aria-label="Tambah jumlah"
            disabled={qty >= available}
            onClick={() => setQuantity(qty + 1)}
            className="flex h-12 w-12 items-center justify-center disabled:opacity-30"
          >
            <Plus size={16} strokeWidth={1.5} />
          </button>
        </div>

        <button
          type="button"
          disabled={available === 0}
          onClick={() => {
            addToCart(productId, qty);
            setQuantity(1);
            setAdded(true);
          }}
          className={buttonPrimary}
        >
          {added ? <Check size={16} strokeWidth={1.5} /> : <ShoppingBag size={16} strokeWidth={1.5} />}
          {available === 0 ? "Semua stok ada di keranjang" : added ? "Ditambahkan" : "Tambah ke keranjang"}
        </button>
      </div>

      {(added || inCart > 0) && (
        <Link href="/keranjang" className={buttonOutline}>
          Lihat keranjang ({inCart})
        </Link>
      )}
    </div>
  );
}
