import Link from "next/link";
import WishlistButton from "@/components/product/WishlistButton";
import { isAvailable, type Product } from "@/lib/products";
import { formatRupiah } from "@/lib/site";

export default function ProductCard({ product }: { product: Product }) {
  const available = isAvailable(product);

  return (
    <article className="group relative">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-oat">
        <Link
          href={`/products/${product.slug}`}
          aria-label={product.name}
          className="flex h-full items-center justify-center text-7xl transition-transform duration-500 group-hover:scale-110"
        >
          <span aria-hidden>{product.icon}</span>
        </Link>

        {!available && (
          <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1.5 text-[9px] font-medium tracking-[0.15em] backdrop-blur">
            COMING SOON
          </div>
        )}

        <WishlistButton
          slug={product.slug}
          name={product.name}
          className="absolute right-4 top-4"
        />
      </div>

      <div className="flex items-start justify-between gap-4 pt-4">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#987865]">
            {product.category}
          </p>
          <h3 className="mt-1 text-base">
            <Link href={`/products/${product.slug}`} className="hover:text-umber">
              {product.name}
            </Link>
          </h3>
        </div>

        <p className="shrink-0 text-sm font-medium">
          {available ? formatRupiah(product.price) : "Coming Soon"}
        </p>
      </div>
    </article>
  );
}
