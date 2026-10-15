"use client";

import { useSyncExternalStore } from "react";

export type CartLine = { productId: string; quantity: number };

const STORAGE_KEY = "serat-cerita:cart";
const EMPTY: CartLine[] = [];

let cart: CartLine[] | null = null;
const listeners = new Set<() => void>();

function parse(raw: string | null): CartLine[] {
  if (!raw) return EMPTY;
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data)
      ? data.filter(
          (line): line is CartLine =>
            typeof line?.productId === "string" &&
            Number.isInteger(line?.quantity) &&
            line.quantity > 0,
        )
      : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): CartLine[] {
  if (cart === null) {
    try {
      cart = parse(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      cart = EMPTY;
    }
  }
  return cart;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cart = parse(event.newValue);
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function update(next: CartLine[]) {
  cart = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Penyimpanan tidak tersedia — keranjang tetap berlaku selama halaman terbuka.
  }
  listeners.forEach((listener) => listener());
}

export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function addToCart(productId: string, quantity: number) {
  const current = getSnapshot();
  const existing = current.find((line) => line.productId === productId);
  update(
    existing
      ? current.map((line) =>
          line.productId === productId
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        )
      : [...current, { productId, quantity }],
  );
}

export function setCartQuantity(productId: string, quantity: number) {
  const current = getSnapshot();
  update(
    quantity > 0
      ? current.map((line) =>
          line.productId === productId ? { ...line, quantity } : line,
        )
      : current.filter((line) => line.productId !== productId),
  );
}

export function clearCart() {
  update([]);
}
