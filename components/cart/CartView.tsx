"use client";

import Link from "next/link";
import { MessageCircle, Minus, Plus, X } from "lucide-react";
import { buttonOutline, buttonPrimary } from "@/components/ui/styles";
import { getProduct, isAvailable } from "@/lib/products";
import { formatRupiah, site, whatsappLink } from "@/lib/site";
import { clearCart, removeFromCart, setQuantity, useStore } from "@/lib/store";

export default function CartView() {
  const { cart } = useStore();

  // Abaikan item yang produknya sudah tidak ada / tidak dijual.
  const lines = cart.flatMap((item) => {
    const product = getProduct(item.slug);
    return product && isAvailable(product)
      ? [{ ...item, product, subtotal: product.price * item.quantity }]
      : [];
  });
  const total = lines.reduce((sum, line) => sum + line.subtotal, 0);

  if (lines.length === 0) {
    return (
      <div className="mt-10 rounded-[2rem] bg-linen px-7 py-14 text-center">
        <p className="text-sm text-muted">Keranjang Anda masih kosong.</p>
        <Link href="/shop" className={`${buttonPrimary} mt-6`}>
          Explore Collection
        </Link>
      </div>
    );
  }

  const checkoutMessage = [
    `Halo ${site.name}, saya ingin memesan:`,
    "",
    ...lines.map(
      (line) =>
        `• ${line.product.name} × ${line.quantity} — ${formatRupiah(line.subtotal)}`,
    ),
    "",
    `Total: ${formatRupiah(total)}`,
  ].join("\n");

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px] lg:items-start">
      <ul className="divide-y divide-line border-y border-line">
        {lines.map((line) => (
          <li key={line.slug} className="flex items-center gap-4 py-5 sm:gap-6">
            <Link
              href={`/products/${line.slug}`}
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-oat text-4xl"
              aria-label={line.product.name}
            >
              <span aria-hidden>{line.product.icon}</span>
            </Link>

            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${line.slug}`}
                className="block truncate hover:text-umber"
              >
                {line.product.name}
              </Link>
              <p className="mt-1 text-xs text-muted">
                {formatRupiah(line.product.price)}
              </p>

              <div className="mt-3 flex w-fit items-center rounded-full border border-taupe">
                <button
                  type="button"
                  aria-label={`Kurangi ${line.product.name}`}
                  onClick={() => setQuantity(line.slug, line.quantity - 1)}
                  className="flex h-8 w-8 items-center justify-center"
                >
                  <Minus size={14} strokeWidth={1.5} />
                </button>
                <span className="w-6 text-center text-xs">{line.quantity}</span>
                <button
                  type="button"
                  aria-label={`Tambah ${line.product.name}`}
                  onClick={() => setQuantity(line.slug, line.quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center"
                >
                  <Plus size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <button
                type="button"
                aria-label={`Hapus ${line.product.name}`}
                onClick={() => removeFromCart(line.slug)}
                className="text-muted hover:text-cocoa"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
              <p className="text-sm font-medium">{formatRupiah(line.subtotal)}</p>
            </div>
          </li>
        ))}
      </ul>

      <aside className="rounded-[2rem] bg-linen p-7">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Total</span>
          <span className="text-lg font-medium">{formatRupiah(total)}</span>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted">
          Ongkos kirim dikonfirmasi lewat WhatsApp.
        </p>

        <a
          href={whatsappLink(checkoutMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonPrimary} mt-6 w-full`}
        >
          <MessageCircle size={16} strokeWidth={1.5} />
          Checkout via WhatsApp
        </a>

        <button
          type="button"
          onClick={clearCart}
          className={`${buttonOutline} mt-3 w-full`}
        >
          Kosongkan keranjang
        </button>
      </aside>
    </div>
  );
}
