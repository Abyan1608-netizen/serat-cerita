"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cart";

const navLinks = [
  { href: "/produk", label: "Produk" },
  { href: "/#custom", label: "Custom" },
  { href: "/#cerita", label: "Cerita" },
  { href: "/lacak", label: "Lacak Pesanan" },
];

const iconButton =
  "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface";

export default function Header({
  storeName,
  logo,
  announcement,
  showCustom,
}: {
  storeName: string;
  logo: string;
  announcement: string;
  showCustom: boolean;
}) {
  const [open, setOpen] = useState(false);
  const cart = useCart();
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  const links = navLinks.filter((link) => showCustom || link.href !== "/#custom");
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/95 backdrop-blur-md">
      {announcement && (
        <div className="bg-primary px-4 py-2 text-center text-[9px] font-medium tracking-[0.25em] text-on-primary sm:text-[10px]">
          {announcement}
        </div>
      )}

      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-6 lg:px-10">
        <button
          type="button"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={`${iconButton} md:hidden`}
        >
          {open ? <X size={21} strokeWidth={1.5} /> : <Menu size={21} strokeWidth={1.5} />}
        </button>

        <Link href="/" onClick={close} className="flex shrink-0 items-center gap-3">
          {logo && (
            <Image src={logo} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
          )}
          <span className="text-base font-semibold uppercase tracking-[0.2em] sm:text-lg">
            {storeName}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-[13px] md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-accent">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link href="/produk" aria-label="Cari produk" className={`${iconButton} hidden sm:flex`}>
            <Search size={19} strokeWidth={1.5} />
          </Link>
          <Link href="/keranjang" aria-label={`Keranjang (${count})`} onClick={close} className={iconButton}>
            <ShoppingBag size={19} strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-medium text-on-primary">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-bg px-6 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="block border-b border-line py-4 text-sm last:border-b-0"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
