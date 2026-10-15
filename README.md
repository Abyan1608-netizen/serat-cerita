# Serat Cerita

Toko online rajutan handmade: katalog produk, keranjang & checkout, pembayaran
Midtrans, notifikasi pesanan ke Telegram, serta panel admin untuk pesanan, produk,
laporan keuangan, dan pengaturan tampilan (teks, foto, warna, font, ongkir).

**Pemilik toko:** ikuti [PANDUAN.md](PANDUAN.md) untuk memasang website.

## Teknologi

- Next.js 16 (App Router) + React 19 + Tailwind CSS v4
- Supabase: Postgres (dengan Row Level Security), Auth (login admin), Storage (foto)
- Midtrans Snap (pembayaran), Telegram Bot API (notifikasi)

## Struktur

```
app/
  (store)/            Toko: beranda, produk, keranjang, checkout, status & lacak pesanan
  admin/              Login, setup admin pertama, panel admin ((panel)/…)
  api/midtrans/       Webhook notifikasi pembayaran
components/
  store/              Komponen toko
  admin/              Komponen admin (editor tampilan, form produk, grafik, dll.)
lib/
  settings.ts         Skema & nilai bawaan pengaturan toko (teks, warna, font, ongkir)
  theme.ts            Pengaturan → variabel CSS (--c-*) untuk tema
  data.ts             Query publik (produk, kategori, pengaturan)
  orders.ts           Kode pesanan, sinkronisasi status Midtrans, notifikasi
  reports.ts          Ringkasan penjualan & laporan laba rugi
  midtrans.ts, telegram.ts, auth.ts, cart.ts, format.ts
  supabase/           Klien Supabase (browser, server/cookie, publik, service role)
supabase/schema.sql   Tabel, fungsi (place_order, set_order_status, apply_payment_status), RLS, storage
proxy.ts              Penyegaran sesi & pengalihan login untuk /admin
```

## Prinsip keamanan

- Harga, stok, dan total dihitung ulang di database (`place_order`), bukan di browser.
- Stok dikunci saat pesanan dibuat dan dikembalikan bila dibatalkan/kedaluwarsa.
- Webhook Midtrans diverifikasi dengan signature, lalu status dicek ulang ke API Midtrans
  dan nominal dicocokkan dengan total pesanan.
- Pengunjung hanya bisa membaca produk, kategori, dan pengaturan publik; kolom modal (HPP),
  pesanan, pengeluaran, dan pengaturan rahasia hanya untuk admin (RLS).
- Setiap halaman & aksi admin memanggil `requireAdmin()`.

## Pengembangan lokal

```bash
cp .env.example .env.local   # isi nilai Supabase dst.
npm install
npm run dev
```

Pemeriksaan: `npx tsc --noEmit`, `npm run lint`, `npm run build`.
