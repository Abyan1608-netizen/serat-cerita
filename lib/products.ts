export type ProductCategory = "Keychain" | "Amigurumi" | "Accessories";

export type Product = {
  slug: string;
  name: string;
  category: ProductCategory;
  /** Harga dalam Rupiah. `null` berarti produk belum dijual (coming soon). */
  price: number | null;
  icon: string;
  description: string;
  details: string[];
};

export const categories: ProductCategory[] = [
  "Keychain",
  "Amigurumi",
  "Accessories",
];

export const products: Product[] = [
  {
    slug: "amigurumi-keychain",
    name: "Amigurumi Keychain",
    category: "Keychain",
    price: 85000,
    icon: "🧸",
    description:
      "Gantungan kunci amigurumi mungil yang dirajut tangan satu per satu. Teman kecil untuk tas, kunci, atau hadiah bagi orang tersayang.",
    details: [
      "Dirajut tangan dari benang katun susu",
      "Ukuran ± 7 cm",
      "Dilengkapi ring gantungan kunci logam",
      "Setiap piece memiliki sedikit perbedaan karakter",
    ],
  },
  {
    slug: "little-bear",
    name: "Little Bear",
    category: "Amigurumi",
    price: null,
    icon: "🐻",
    description:
      "Boneka beruang kecil yang lembut untuk dipeluk maupun dipajang. Sedang kami siapkan untuk koleksi berikutnya.",
    details: ["Dirajut tangan", "Isian dakron lembut", "Segera hadir"],
  },
  {
    slug: "crochet-flower",
    name: "Crochet Flower",
    category: "Accessories",
    price: null,
    icon: "🌸",
    description:
      "Bunga rajut yang tidak pernah layu. Cocok sebagai hiasan meja, buket kecil, atau aksesori.",
    details: ["Dirajut tangan", "Tersedia beberapa pilihan warna", "Segera hadir"],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function isAvailable(product: Product): product is Product & {
  price: number;
} {
  return product.price !== null;
}
