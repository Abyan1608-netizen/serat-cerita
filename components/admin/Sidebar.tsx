"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Palette,
  Settings,
  ShoppingCart,
  Tags,
  Wallet,
  X,
} from "lucide-react";
import { signOut } from "@/app/admin/actions";

const items = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin/pesanan", label: "Pesanan", icon: ShoppingCart },
  { href: "/admin/produk", label: "Produk", icon: Package },
  { href: "/admin/kategori", label: "Kategori", icon: Tags },
  { href: "/admin/keuangan", label: "Keuangan", icon: Wallet },
  { href: "/admin/tampilan", label: "Tampilan & Isi", icon: Palette },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 lg:hidden">
        <span className="font-semibold">Admin</span>
        <button type="button" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-stone-100">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <aside
        className={`${open ? "block" : "hidden"} border-b border-stone-200 bg-white lg:sticky lg:top-0 lg:block lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r`}
      >
        <div className="flex h-full flex-col p-4">
          <p className="hidden px-3 py-2 text-sm font-semibold tracking-wide lg:block">SERAT CERITA · Admin</p>
          <nav className="mt-2 grid gap-1">
            {items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={isActive(href) ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  isActive(href) ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-100"
                }`}
              >
                <Icon size={18} strokeWidth={1.75} />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 grid gap-1 border-t border-stone-200 pt-4 lg:mt-auto">
            <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-100">
              <ExternalLink size={18} strokeWidth={1.75} />
              Lihat toko
            </a>
            <form action={signOut}>
              <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-100">
                <LogOut size={18} strokeWidth={1.75} />
                Keluar
              </button>
            </form>
            <p className="truncate px-3 pt-2 text-xs text-stone-400">{email}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
