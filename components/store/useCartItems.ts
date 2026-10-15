"use client";

import { useEffect, useState } from "react";
import { loadCartProducts } from "@/app/(store)/actions";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

export type CartItem = { product: Product; quantity: number };

/** Gabungkan isi keranjang (localStorage) dengan data produk terbaru dari server. */
export function useCartItems() {
  const cart = useCart();
  const ids = cart.map((line) => line.productId).sort().join(",");
  const [products, setProducts] = useState<Map<string, Product> | null>(null);
  const [loadedIds, setLoadedIds] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadCartProducts(ids ? ids.split(",") : []).then((list) => {
      if (!active) return;
      setProducts(new Map(list.map((product) => [product.id, product])));
      setLoadedIds(ids);
    });
    return () => {
      active = false;
    };
  }, [ids]);

  const items: CartItem[] = products
    ? cart.flatMap((line) => {
        const product = products.get(line.productId);
        return product ? [{ product, quantity: line.quantity }] : [];
      })
    : [];

  const unavailable = items.filter(
    (item) => item.product.status !== "active" || item.product.stock < item.quantity,
  );

  return {
    loading: loadedIds !== ids,
    items,
    unavailable,
    subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  };
}
