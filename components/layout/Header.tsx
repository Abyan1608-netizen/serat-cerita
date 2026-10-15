"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { iconButton } from "@/components/ui/styles";
import { navLinks } from "@/lib/site";
import { useStore } from "@/lib/store";

function CountBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cocoa px-1 text-[8px] font-medium text-cream">
      {count}
    </span>
  );
}

function SearchForm({ className = "" }: { className?: string }) {
  return (
    <form
      action="/shop"
      role="search"
      className={`flex items-center border-b border-taupe pb-1.5 ${className}`}
    >
      <Search size={17} strokeWidth={1.5} className="mr-2 shrink-0 text-muted" />
      <input
        type="search"
        name="q"
        placeholder="Search"
        aria-label="Cari produk"
        className="w-full bg-transparent text-xs outline-none placeholder:text-[#9a8778]"
      />
    </form>
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cart, wishlist } = useStore();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/95 backdrop-blur-md">
      <div className="bg-cocoa px-4 py-2 text-center text-[9px] font-medium tracking-[0.25em] text-cream sm:text-[10px]">
        HANDMADE WITH LOVE · SERAT CERITA
      </div>

      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-6 px-6 lg:px-10">
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
          className={`${iconButton} md:hidden`}
        >
          {mobileMenuOpen ? (
            <X size={21} strokeWidth={1.5} />
          ) : (
            <Menu size={21} strokeWidth={1.5} />
          )}
        </button>

        <Link
          href="/"
          onClick={closeMenu}
          className="shrink-0 text-[16px] font-semibold tracking-[0.2em] sm:text-xl"
        >
          SERAT CERITA
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] md:flex lg:gap-9">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-umber"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden min-w-0 flex-1 justify-end lg:flex">
          <SearchForm className="w-full max-w-[220px]" />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/wishlist"
            aria-label={`Wishlist (${wishlist.length})`}
            onClick={closeMenu}
            className={`relative ${iconButton}`}
          >
            <Heart size={19} strokeWidth={1.5} />
            <CountBadge count={wishlist.length} />
          </Link>

          <Link
            href="/cart"
            aria-label={`Keranjang (${cartCount})`}
            onClick={closeMenu}
            className={`relative ${iconButton}`}
          >
            <ShoppingBag size={19} strokeWidth={1.5} />
            <CountBadge count={cartCount} />
          </Link>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-line bg-cream md:hidden">
          <nav className="mx-auto max-w-7xl px-6 py-5">
            <SearchForm className="mb-2" />
            <div className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="border-b border-line py-4 text-sm last:border-b-0"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
