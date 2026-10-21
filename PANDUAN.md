# Panduan Memasang Website Serat Cerita

Panduan ini untuk pemilik toko yang **tidak perlu bisa coding**. Ikuti urut dari
langkah 1 sampai 7. Total waktu sekitar 45–60 menit, cukup sekali saja.

Yang Anda butuhkan:

- Akun **GitHub** (sudah ada — tempat kode ini disimpan)
- Email aktif dan HP dengan **Telegram**
- KTP (hanya untuk Midtrans mode uang sungguhan, langkah 6)

Semua layanan di bawah ini **gratis**. Biaya yang mungkin muncul hanya potongan
Midtrans per transaksi yang berhasil (lihat langkah 6).

---

## 1. Buat database di Supabase (gratis)

Supabase menyimpan produk, pesanan, foto, dan akun admin.

1. Buka <https://supabase.com> → **Start your project** → daftar dengan akun GitHub.
2. Klik **New project**.
   - **Name:** `serat-cerita`
   - **Database password:** klik *Generate*, lalu simpan di tempat aman.
   - **Region:** pilih **Southeast Asia (Singapore)** agar cepat dari Indonesia.
   - Klik **Create new project**, tunggu ± 2 menit.
3. Di menu kiri buka **SQL Editor** → **New query**.
4. Buka file [`supabase/schema.sql`](supabase/schema.sql) di GitHub, klik tombol
   *Copy raw file*, tempel ke SQL Editor, lalu klik **Run**.
   Harus muncul *Success. No rows returned*.
5. Menu kiri **Authentication** → **Sign In / Providers**
   (atau *Settings*) → matikan **Allow new users to sign up** → **Save**.
   Ini penting agar orang lain tidak bisa membuat akun sendiri.
6. Menu kiri **Project Settings** → **API Keys**. Catat 3 nilai ini:
   - **Project URL** (di *Project Settings → Data API*), contoh `https://abcd1234.supabase.co`
   - **Publishable key** (diawali `sb_publishable_…`; pada tampilan lama: *anon public*)
   - **Secret key** (diawali `sb_secret_…`; pada tampilan lama: *service_role*).
     ⚠️ Kunci ini **rahasia**, jangan pernah dibagikan atau dikirim ke siapa pun.

> Catatan: proyek Supabase gratis akan "tertidur" bila tidak ada aktivitas selama
> 7 hari. Selama toko dikunjungi orang, ini tidak terjadi. Bila tertidur, buka
> dashboard Supabase dan klik **Restore project** — data tetap aman.

## 2. Buat bot Telegram untuk notifikasi pesanan

1. Buka Telegram di HP, cari **@BotFather** (centang biru).
2. Kirim `/newbot`.
3. Isi nama bot, misalnya `Notifikasi Serat Cerita`.
4. Isi username bot yang diakhiri `bot`, misalnya `seratcerita_notif_bot`.
5. BotFather membalas dengan **token** seperti `7123456789:AAH...`. Catat token ini (rahasia).
6. Klik link bot Anda (`t.me/seratcerita_notif_bot`) lalu tekan **Start**.

## 3. Daftar Midtrans (pembayaran)

1. Buka <https://dashboard.midtrans.com/register>, daftar sebagai **Perorangan**
   (individual) bila belum punya badan usaha.
2. Setelah masuk, pastikan di pojok kiri atas tertulis **Sandbox** (mode uji coba).
3. Buka **Settings → Access Keys**. Catat **Server Key** (diawali `SB-Mid-server-`).

Mode Sandbox memakai uang bohongan, cocok untuk mencoba dulu. Cara beralih ke
uang sungguhan ada di langkah 6.

## 4. Pasang website di Vercel (gratis)

1. Buka <https://vercel.com/signup> → daftar dengan **GitHub**.
2. Klik **Add New… → Project** → pilih repository **serat-cerita** → **Import**.
3. Buka bagian **Environment Variables** dan tambahkan satu per satu:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL dari langkah 1 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key dari langkah 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | Secret key dari langkah 1 |
   | `ADMIN_EMAIL` | email Anda (untuk login admin) |
   | `MIDTRANS_SERVER_KEY` | Server Key dari langkah 3 |
   | `MIDTRANS_IS_PRODUCTION` | `false` |
   | `TELEGRAM_BOT_TOKEN` | token dari langkah 2 |

4. Klik **Deploy**, tunggu ± 2 menit. Website Anda sudah online di alamat seperti
   `https://serat-cerita.vercel.app` (lihat di halaman proyek Vercel).

> ⚠️ **Tentang paket gratis Vercel:** aturan Vercel menyebut paket Hobby (gratis)
> untuk penggunaan non-komersial. Untuk mencoba dan toko yang baru mulai, ini
> umumnya cukup. Bila toko sudah ramai dan ingin sepenuhnya patuh aturan, pilihan
> gratis yang mengizinkan penggunaan komersial adalah **Netlify**
> (<https://netlify.com>): caranya sama — *Add new site → Import from GitHub* —
> dengan Environment Variables yang sama persis.

## 5. Buat akun admin dan hubungkan notifikasi

1. Buka `https://<alamat-website-anda>/admin/setup`.
2. Isi **email yang sama dengan `ADMIN_EMAIL`** dan password (minimal 8 karakter).
   Halaman ini hanya bisa dipakai sekali.
3. Masuk di `https://<alamat-website-anda>/admin`.
4. Buka menu **Pengaturan** → bagian *Notifikasi pesanan ke HP* → klik **Hubungkan**.
   Pesan "✅ Notifikasi Serat Cerita aktif" akan masuk ke Telegram Anda.
5. Di dashboard Midtrans (Sandbox): **Settings → Payment → Notification URL**, isi:
   `https://<alamat-website-anda>/api/midtrans` → **Save**.
   Tanpa ini, status "sudah dibayar" tetap ter-update saat pembeli membuka halaman
   pesanannya, tapi notifikasi bisa terlambat.

**Coba sekarang:** buka toko, beli produk, bayar memakai simulator Midtrans
(<https://simulator.sandbox.midtrans.com>, pilih QRIS atau Virtual Account).
Notifikasi "Pesanan baru" dan "Pembayaran diterima" akan masuk ke Telegram.

## 6. Beralih ke pembayaran sungguhan

> **Sebelum mengajukan ke Midtrans**, pastikan website sudah memenuhi syarat yang biasanya
> diperiksa: produk tampil dengan foto & harga, halaman **Kontak** berisi nomor WA, email,
> dan alamat (isi di Admin → Tampilan & Isi → Identitas toko), serta halaman
> **Syarat & Ketentuan**, **Kebijakan Pengembalian**, dan **Kebijakan Privasi**
> (Admin → Tampilan & Isi → Kebijakan). Link ke semuanya ada di bagian bawah website.

1. Di dashboard Midtrans, lengkapi data dan dokumen (KTP, rekening) sampai akun
   **Production** disetujui.
2. Pindah ke mode **Production** (pojok kiri atas), buka **Settings → Access Keys**,
   salin **Server Key** production (diawali `Mid-server-`).
3. Ulangi pengisian **Notification URL** (langkah 5 poin 5) di mode Production.
4. Di Vercel → Project → **Settings → Environment Variables**, ubah:
   - `MIDTRANS_SERVER_KEY` → Server Key production
   - `MIDTRANS_IS_PRODUCTION` → `true`
5. Vercel → **Deployments** → titik tiga pada deployment teratas → **Redeploy**.

Biaya Midtrans hanya dipotong dari transaksi yang berhasil (contoh: QRIS ± 0,7%,
Virtual Account ± Rp 4.000 per transaksi — cek tarif terbaru di situs Midtrans).

## 7. Sehari-hari di halaman admin

| Menu | Kegunaan |
|---|---|
| **Ringkasan** | Penjualan hari ini & bulan ini, grafik 30 hari, produk terlaris, pesanan terbaru |
| **Pesanan** | Lihat pesanan, ubah status (dikerjakan → dikirim → selesai), isi nomor resi, chat pembeli. Membatalkan pesanan otomatis mengembalikan stok |
| **Produk** | Tambah/ubah produk, foto (bisa langsung dari kamera HP), harga, **modal (HPP)**, stok |
| **Kategori** | Kelompok produk untuk filter di toko |
| **Keuangan** | Laba rugi per bulan (penjualan − modal − pengeluaran), catat pengeluaran, unduh laporan Excel |
| **Tampilan & Isi** | Ubah **semua tulisan, foto, warna, font, dan ongkir** — ada pratinjau langsung |
| **Pengaturan** | Status pembayaran, notifikasi Telegram, tambah admin lain, ganti password |

### Mengembalikan dana (refund)

1. Kirim dulu uangnya ke pembeli: transfer bank/e-wallet, atau untuk pembayaran GoPay/QRIS
   bisa lewat dashboard Midtrans (menu Transactions → pilih transaksi → Refund).
2. Buka **Admin → Pesanan → (pesanan itu) → Catat refund**. Isi jumlah (penuh atau
   sebagian) dan cara pengembaliannya.
3. Untuk refund penuh, centang **Kembalikan stok** bila barangnya kembali/belum dikirim.
4. Tekan **Kabari pembeli via WhatsApp** untuk memberi tahu pembeli.

Refund otomatis mengurangi laporan keuangan pada bulan dana dikembalikan, muncul di unduhan
Excel, dan pembeli melihat status **Dana dikembalikan** di halaman pesanannya.

> **Pembaruan database:** fitur refund butuh tabel baru. Jalankan ulang seluruh isi
> `supabase/schema.sql` di Supabase → SQL Editor (aman diulang, data tidak hilang).

Tips:

- Isi **Modal per barang** di setiap produk agar laporan keuntungan akurat.
- Pesanan yang tidak dibayar 24 jam otomatis kedaluwarsa dan stoknya kembali.
- Halaman admin bisa dibuka dari HP. Agar terasa seperti aplikasi, buka di Chrome →
  menu ⋮ → **Tambahkan ke layar utama**.

## Bila ada masalah

| Gejala | Penyebab & solusi |
|---|---|
| Website tampil, tapi produk kosong / error | Environment Variables Supabase salah, atau `schema.sql` belum dijalankan (langkah 1.4) |
| `/admin/setup` menolak email | Email harus sama persis dengan `ADMIN_EMAIL` di Vercel. Setelah mengubah variabel, lakukan **Redeploy** |
| Tombol "Hubungkan" Telegram gagal | Pastikan sudah menekan **Start** di bot Anda, lalu coba lagi |
| Pembeli diarahkan ke WhatsApp, bukan halaman bayar | `MIDTRANS_SERVER_KEY` belum diisi atau salah |
| Status pesanan tidak berubah setelah dibayar | Periksa Notification URL di Midtrans (langkah 5.5) |
| Lupa password admin | Admin lain bisa menghapus & membuat ulang akun Anda di **Pengaturan**, atau reset lewat Supabase → Authentication → Users |
