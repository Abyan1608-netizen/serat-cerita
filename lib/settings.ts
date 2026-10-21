import { z } from "zod";

const hex = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Warna harus berformat #RRGGBB");

const text = (max = 2000) => z.string().trim().max(max);

export const headingFonts = {
  cormorant: "Cormorant Garamond (klasik)",
  playfair: "Playfair Display (elegan)",
  fraunces: "Fraunces (hangat)",
  geist: "Geist (modern, polos)",
} as const;

export type HeadingFont = keyof typeof headingFonts;

export const settingsSchema = z.object({
  store: z.object({
    name: text(80).min(1, "Nama toko wajib diisi"),
    tagline: text(120),
    description: text(400),
    announcement: text(160),
    logo: text(500),
    whatsapp: text(20).regex(/^\d*$/, "Nomor WhatsApp hanya angka"),
    instagram: text(60),
    email: text(120),
    address: text(300),
    hours: text(120),
  }),
  hero: z.object({
    eyebrow: text(80),
    title: text(120),
    titleAccent: text(60),
    body: text(400),
    primaryCta: text(40),
    secondaryCta: text(40),
    image: text(500),
    badgeLabel: text(40),
    badgeText: text(60),
  }),
  collection: z.object({
    eyebrow: text(60),
    title: text(80),
  }),
  custom: z.object({
    enabled: z.boolean(),
    eyebrow: text(60),
    title: text(120),
    body: text(600),
    button: text(40),
    note: text(200),
  }),
  story: z.object({
    eyebrow: text(60),
    title: text(120),
    body: text(3000),
    image: text(500),
  }),
  footer: z.object({
    tagline: text(120),
  }),
  policies: z.object({
    terms: text(10000),
    refund: text(10000),
    privacy: text(10000),
  }),
  checkout: z.object({
    note: text(400),
    shippingOptions: z
      .array(
        z.object({
          name: text(60).min(1, "Nama ongkir wajib diisi"),
          price: z.number().int().min(0),
        }),
      )
      .min(1, "Minimal satu pilihan pengiriman"),
  }),
  colors: z.object({
    background: hex,
    surface: hex,
    surfaceStrong: hex,
    border: hex,
    text: hex,
    textMuted: hex,
    accent: hex,
    primary: hex,
    primaryText: hex,
    footer: hex,
    footerText: hex,
  }),
  fonts: z.object({
    heading: z.enum(Object.keys(headingFonts) as [HeadingFont, ...HeadingFont[]]),
    headingItalic: z.boolean(),
  }),
});

export type StoreSettings = z.infer<typeof settingsSchema>;
export type ThemeColors = StoreSettings["colors"];

export const colorPresets: Record<string, ThemeColors> = {
  "Krem Klasik": {
    background: "#f7f2ea",
    surface: "#f1e9df",
    surfaceStrong: "#e1d3c3",
    border: "#ded2c5",
    text: "#3f2a20",
    textMuted: "#735c4d",
    accent: "#8a6048",
    primary: "#3f2a20",
    primaryText: "#f7f2ea",
    footer: "#3f2a20",
    footerText: "#f7f2ea",
  },
  "Hijau Sage": {
    background: "#f4f5ef",
    surface: "#e8ebdf",
    surfaceStrong: "#d3dac4",
    border: "#d6dccb",
    text: "#2e3a2b",
    textMuted: "#5d6b57",
    accent: "#6b7f4f",
    primary: "#3d4f35",
    primaryText: "#f4f5ef",
    footer: "#2e3a2b",
    footerText: "#f4f5ef",
  },
  "Mawar Lembut": {
    background: "#fbf3f1",
    surface: "#f5e4e0",
    surfaceStrong: "#ebcdc7",
    border: "#ecd8d3",
    text: "#4a2a2e",
    textMuted: "#7d5a5e",
    accent: "#b0646f",
    primary: "#7a3b45",
    primaryText: "#fbf3f1",
    footer: "#4a2a2e",
    footerText: "#fbf3f1",
  },
  "Biru Laut": {
    background: "#f3f6f8",
    surface: "#e3ebf0",
    surfaceStrong: "#c9d8e2",
    border: "#d3dfe7",
    text: "#1f3140",
    textMuted: "#53687a",
    accent: "#3e7192",
    primary: "#24465e",
    primaryText: "#f3f6f8",
    footer: "#1f3140",
    footerText: "#f3f6f8",
  },
};

export const defaultSettings: StoreSettings = {
  store: {
    name: "Serat Cerita",
    tagline: "Handmade Stories",
    description:
      "Rajutan handmade yang dibuat dengan perhatian pada setiap detail. Temukan benda kecil yang membawa cerita besar.",
    announcement: "HANDMADE WITH LOVE · SERAT CERITA",
    logo: "",
    whatsapp: "6289669406611",
    instagram: "",
    email: "",
    address: "",
    hours: "Senin – Sabtu, 09.00 – 17.00 WIB",
  },
  hero: {
    eyebrow: "HANDMADE · SLOW MADE · MEANINGFUL",
    title: "Every stitch tells a",
    titleAccent: "story.",
    body: "Rajutan handmade yang dibuat dengan perhatian pada setiap detail. Temukan benda kecil yang membawa cerita besar.",
    primaryCta: "Lihat Koleksi",
    secondaryCta: "Cerita Kami",
    image: "",
    badgeLabel: "SEDANG DIRAJUT",
    badgeText: "Koleksi Amigurumi",
  },
  collection: {
    eyebrow: "KOLEKSI",
    title: "Produk pilihan",
  },
  custom: {
    enabled: true,
    eyebrow: "DIBUAT KHUSUS UNTUKMU",
    title: "Punya cerita sendiri?",
    body: "Kami menerima pesanan custom untuk beberapa produk. Ceritakan ide Anda dan biarkan kami membantu mewujudkannya menjadi rajutan yang personal.",
    button: "Diskusi via WhatsApp",
    note: "Pesanan custom perlu konfirmasi dan bisa butuh waktu pengerjaan tambahan.",
  },
  story: {
    eyebrow: "CERITA KAMI",
    title: "Small stitches. Meaningful stories.",
    body: "Serat Cerita lahir dari kecintaan pada sesuatu yang dibuat perlahan, dengan tangan, dan penuh perhatian. Setiap rajutan memiliki karakter dan cerita yang berbeda.\n\nDari sebuah keychain kecil hingga koleksi yang lebih besar, perjalanan Serat Cerita akan terus berkembang satu benang demi satu benang.",
    image: "",
  },
  footer: {
    tagline: "Handmade with intention.",
  },
  policies: {
    terms: `1. Pemesanan
Pesanan dibuat melalui website ini dengan memilih produk, mengisi data pengiriman, dan menyelesaikan pembayaran. Setiap pesanan mendapat kode pesanan untuk dilacak di halaman Lacak Pesanan.

2. Harga
Semua harga dalam Rupiah (IDR) dan belum termasuk ongkos kirim. Ongkos kirim ditampilkan sebelum pembayaran.

3. Pembayaran
Pembayaran diproses secara aman oleh Midtrans (QRIS, transfer Virtual Account, dan e-wallet). Pesanan yang tidak dibayar dalam 24 jam dibatalkan otomatis.

4. Produk handmade
Setiap produk dirajut tangan, sehingga warna dan ukuran dapat sedikit berbeda dari foto. Perbedaan kecil ini bukan cacat produk.

5. Pesanan custom
Pesanan custom dikonfirmasi lebih dulu melalui WhatsApp, termasuk harga dan waktu pengerjaan.

6. Pengiriman
Pesanan diproses 1–3 hari kerja setelah pembayaran diterima, lalu dikirim melalui kurir. Nomor resi dapat dilihat di halaman status pesanan.

7. Kontak
Pertanyaan seputar pesanan dapat disampaikan melalui kontak yang tercantum di halaman Kontak.`,
    refund: `1. Barang rusak atau salah kirim
Jika barang yang diterima rusak atau tidak sesuai pesanan, hubungi kami melalui WhatsApp paling lambat 3 x 24 jam sejak barang diterima, dengan menyertakan kode pesanan serta foto/video saat membuka paket.

2. Penyelesaian
Setelah laporan diperiksa, kami akan mengirim barang pengganti atau mengembalikan dana. Pengembalian dana dilakukan ke rekening pembeli paling lambat 7 hari kerja setelah disetujui.

3. Pembatalan pesanan
Pesanan yang sudah dibayar tetapi belum diproses dapat dibatalkan dengan menghubungi kami, dan dana dikembalikan penuh.

4. Pengecualian
Pesanan custom tidak dapat dikembalikan kecuali terdapat cacat produksi. Perbedaan kecil warna atau ukuran karena sifat produk handmade tidak termasuk alasan pengembalian.`,
    privacy: `1. Data yang kami kumpulkan
Saat memesan, kami mengumpulkan nama, nomor WhatsApp, email (opsional), dan alamat pengiriman.

2. Penggunaan data
Data hanya digunakan untuk memproses, mengirim, dan mengonfirmasi pesanan, serta menghubungi Anda terkait pesanan tersebut.

3. Pembayaran
Pembayaran diproses oleh Midtrans. Kami tidak menerima maupun menyimpan data kartu atau rekening Anda.

4. Berbagi data
Kami tidak menjual atau membagikan data Anda kepada pihak lain, kecuali kepada kurir untuk keperluan pengiriman dan kepada Midtrans untuk keperluan pembayaran.

5. Hak Anda
Anda dapat meminta data Anda diubah atau dihapus dengan menghubungi kami.`,
  },
  checkout: {
    note: "Pesanan diproses 1–3 hari kerja setelah pembayaran diterima.",
    shippingOptions: [
      { name: "Ambil sendiri", price: 0 },
      { name: "Kirim dalam kota", price: 15000 },
      { name: "Kirim luar kota", price: 30000 },
    ],
  },
  colors: colorPresets["Krem Klasik"],
  fonts: { heading: "cormorant", headingItalic: true },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Gabungkan data tersimpan dengan nilai bawaan, lalu validasi. Bagian yang
 * rusak/tidak valid diganti nilai bawaan agar website tidak pernah error.
 */
export function resolveSettings(stored: unknown): StoreSettings {
  const data = isRecord(stored) ? stored : {};
  const result = {} as Record<string, unknown>;

  for (const [section, defaults] of Object.entries(defaultSettings)) {
    const value = data[section];
    const merged = isRecord(value) ? { ...defaults, ...value } : defaults;
    const parsed = settingsSchema.shape[
      section as keyof StoreSettings
    ].safeParse(merged);
    result[section] = parsed.success ? parsed.data : defaults;
  }

  return result as StoreSettings;
}
