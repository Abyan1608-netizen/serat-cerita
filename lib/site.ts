export const site = {
  name: "Serat Cerita",
  tagline: "Handmade Stories",
  description:
    "Rajutan handmade yang dibuat dengan perhatian pada setiap detail. Temukan benda kecil yang membawa cerita besar.",
  /**
   * Nomor WhatsApp untuk pesanan, format internasional tanpa "+" (contoh: 6281234567890).
   * Atur lewat NEXT_PUBLIC_WHATSAPP_NUMBER di .env.local.
   */
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6281234567890",
};

export const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/#custom", label: "Custom" },
  { href: "/#story", label: "Our Story" },
];

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function whatsappLink(message: string): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
