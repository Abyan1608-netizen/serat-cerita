"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Lock } from "lucide-react";
import { placeOrder } from "@/app/(store)/actions";
import { EmptyCart } from "@/components/store/CartView";
import { buttonPrimary, field, label } from "@/components/store/ui";
import { useCartItems } from "@/components/store/useCartItems";
import { clearCart } from "@/lib/cart";
import { formatRupiah } from "@/lib/format";

export default function CheckoutForm({
  shippingOptions,
  note,
}: {
  shippingOptions: { name: string; price: number }[];
  note: string;
}) {
  const router = useRouter();
  const { loading, items, unavailable, subtotal } = useCartItems();
  const [shipping, setShipping] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (loading) return <p className="mt-10 text-sm text-ink-muted">Memuat…</p>;
  if (items.length === 0) return <EmptyCart />;

  const shippingCost = shippingOptions[shipping]?.price ?? 0;

  // onSubmit (bukan action) agar isian pembeli tidak hilang bila terjadi error.
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await placeOrder({
        name: String(formData.get("name") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        email: String(formData.get("email") ?? ""),
        address: String(formData.get("address") ?? ""),
        note: String(formData.get("note") ?? ""),
        shipping,
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      clearCart();
      if (result.paymentUrl) window.location.href = result.paymentUrl;
      else router.push(`/pesanan/${result.code}`);
    });
  }

  return (
    <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={label}>
          Nama lengkap
          <input name="name" required autoComplete="name" className={field} />
        </label>
        <label className={label}>
          Nomor WhatsApp
          <input name="phone" required inputMode="tel" autoComplete="tel" placeholder="08xxxxxxxxxx" className={field} />
        </label>
        <label className={`${label} sm:col-span-2`}>
          Email (opsional, untuk bukti pembayaran)
          <input name="email" type="email" autoComplete="email" className={field} />
        </label>
        <label className={`${label} sm:col-span-2`}>
          Alamat lengkap
          <textarea
            name="address"
            required
            rows={3}
            autoComplete="street-address"
            placeholder="Jalan, nomor rumah, kelurahan, kecamatan, kota, kode pos"
            className={field}
          />
        </label>

        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-xs tracking-wide text-ink-muted">Pengiriman</legend>
          <div className="grid gap-2">
            {shippingOptions.map((option, index) => (
              <label
                key={option.name}
                className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
                  index === shipping ? "border-accent bg-surface" : "border-line"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={index === shipping}
                    onChange={() => setShipping(index)}
                    className="accent-[var(--c-accent)]"
                  />
                  {option.name}
                </span>
                <span>{option.price === 0 ? "Gratis" : formatRupiah(option.price)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className={`${label} sm:col-span-2`}>
          Catatan (opsional)
          <textarea name="note" rows={2} placeholder="Warna pilihan, ucapan untuk hadiah, dll." className={field} />
        </label>
      </div>

      <aside className="rounded-[2rem] bg-surface p-7">
        <h2 className="text-sm font-medium">Ringkasan pesanan</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {items.map(({ product, quantity }) => (
            <li key={product.id} className="flex justify-between gap-4">
              <span className="text-ink-muted">{product.name} × {quantity}</span>
              <span>{formatRupiah(product.price * quantity)}</span>
            </li>
          ))}
          <li className="flex justify-between gap-4">
            <span className="text-ink-muted">Ongkir</span>
            <span>{formatRupiah(shippingCost)}</span>
          </li>
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm">Total</span>
          <span className="text-lg font-medium">{formatRupiah(subtotal + shippingCost)}</span>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-800">{error}</p>
        )}

        {unavailable.length > 0 ? (
          <p className="mt-6 text-xs text-red-700">
            Ada produk yang stoknya berubah. <Link href="/keranjang" className="underline">Periksa keranjang</Link>.
          </p>
        ) : (
          <button type="submit" disabled={pending} className={`${buttonPrimary} mt-6 w-full`}>
            <Lock size={15} strokeWidth={1.5} />
            {pending ? "Memproses…" : "Bayar sekarang"}
          </button>
        )}
        {note && <p className="mt-4 text-xs leading-5 text-ink-muted">{note}</p>}
      </aside>
    </form>
  );
}
