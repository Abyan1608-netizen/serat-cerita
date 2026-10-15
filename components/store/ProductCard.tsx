import Link from "next/link";
import ProductImage from "@/components/store/ProductImage";
import { formatRupiah } from "@/lib/format";
import type { Product } from "@/lib/types";

export function productBadge(product: Product): string | null {
  if (product.status === "coming_soon") return "SEGERA HADIR";
  if (product.stock === 0) return "HABIS";
  return null;
}

export default function ProductCard({ product }: { product: Product }) {
  const badge = productBadge(product);

  return (
    <article className="group">
      <Link href={`/produk/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-strong">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="transition-transform duration-500 group-hover:scale-105"
          />
          {badge && (
            <span className="absolute left-4 top-4 rounded-full bg-bg/90 px-3 py-1.5 text-[9px] font-medium tracking-[0.15em] backdrop-blur">
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-4 pt-4">
          <div>
            {product.category && (
              <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-accent">
                {product.category.name}
              </p>
            )}
            <h3 className="mt-1 text-base group-hover:text-accent">{product.name}</h3>
          </div>
          <p className="shrink-0 text-sm font-medium">
            {product.status === "coming_soon" ? "Segera" : formatRupiah(product.price)}
          </p>
        </div>
      </Link>
    </article>
  );
}
