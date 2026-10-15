"use client";

import { useSyncExternalStore } from "react";

export type CartItem = { slug: string; quantity: number };

type StoreState = { cart: CartItem[]; wishlist: string[] };

const STORAGE_KEY = "serat-cerita:store";
const EMPTY: StoreState = { cart: [], wishlist: [] };

let state: StoreState | null = null;
const listeners = new Set<() => void>();

function parse(raw: string | null): StoreState {
  if (!raw) return EMPTY;

  try {
    const data = JSON.parse(raw);
    const cart = Array.isArray(data?.cart)
      ? data.cart.filter(
          (item: unknown): item is CartItem =>
            typeof (item as CartItem)?.slug === "string" &&
            Number.isInteger((item as CartItem)?.quantity) &&
            (item as CartItem).quantity > 0,
        )
      : [];
    const wishlist = Array.isArray(data?.wishlist)
      ? data.wishlist.filter((slug: unknown) => typeof slug === "string")
      : [];

    return { cart, wishlist };
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): StoreState {
  if (state === null) {
    try {
      state = parse(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      state = EMPTY;
    }
  }

  return state;
}

function getServerSnapshot(): StoreState {
  return EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  // Sinkronkan antar-tab.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      state = parse(event.newValue);
      listener();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function update(recipe: (current: StoreState) => StoreState) {
  state = recipe(getSnapshot());

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Penyimpanan tidak tersedia (mode privat, dsb.) — state tetap berlaku di memori.
  }

  listeners.forEach((listener) => listener());
}

export function useStore(): StoreState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function addToCart(slug: string, quantity = 1) {
  update((current) => {
    const existing = current.cart.find((item) => item.slug === slug);
    const cart = existing
      ? current.cart.map((item) =>
          item.slug === slug
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      : [...current.cart, { slug, quantity }];

    return { ...current, cart };
  });
}

export function setQuantity(slug: string, quantity: number) {
  update((current) => ({
    ...current,
    cart:
      quantity > 0
        ? current.cart.map((item) =>
            item.slug === slug ? { ...item, quantity } : item,
          )
        : current.cart.filter((item) => item.slug !== slug),
  }));
}

export function removeFromCart(slug: string) {
  setQuantity(slug, 0);
}

export function clearCart() {
  update((current) => ({ ...current, cart: [] }));
}

export function toggleWishlist(slug: string) {
  update((current) => ({
    ...current,
    wishlist: current.wishlist.includes(slug)
      ? current.wishlist.filter((item) => item !== slug)
      : [...current.wishlist, slug],
  }));
}
