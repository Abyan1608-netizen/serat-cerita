# Serat Cerita

Toko online rajutan handmade — dibangun dengan Next.js (App Router), React 19, dan Tailwind CSS v4.

## Fitur

- **Beranda** — hero, koleksi unggulan, form custom order, dan cerita brand.
- **Shop** (`/shop`) — semua produk dengan filter kategori dan pencarian (`?q=`, `?category=`).
- **Detail produk** (`/products/[slug]`) — dibuat statis saat build dari `lib/products.ts`.
- **Wishlist** (`/wishlist`) dan **Keranjang** (`/cart`) — tersimpan di `localStorage` browser.
- **Checkout & custom order via WhatsApp** — pesan otomatis terisi daftar pesanan/detail custom.

## Struktur

```
app/                 Routing (halaman, layout, not-found)
components/
  layout/            Header & Footer
  home/              Section beranda (Hero, FeaturedCollection, CustomOrder, Story)
  product/           ProductCard, WishlistButton, AddToCart
  cart/              CartView & WishlistView
  ui/styles.ts       Kelas tombol/teks yang dipakai ulang
lib/
  products.ts        Data katalog produk
  site.ts            Konfigurasi toko, navigasi, format Rupiah, link WhatsApp
  store.ts           State keranjang & wishlist (useSyncExternalStore + localStorage)
```

Warna brand didefinisikan sebagai token Tailwind di `app/globals.css`
(`bg-cream`, `bg-linen`, `text-cocoa`, `text-umber`, `border-line`, dst.).

## Menjalankan

```bash
cp .env.example .env.local   # isi NEXT_PUBLIC_WHATSAPP_NUMBER
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Menambah produk

Tambahkan entri baru di `lib/products.ts`. Set `price: null` untuk produk yang belum dijual
(akan tampil sebagai *Coming Soon* dan tidak bisa dimasukkan ke keranjang).
