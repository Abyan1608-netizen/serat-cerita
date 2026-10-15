import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { eyebrow } from "@/components/ui/styles";
import { products } from "@/lib/products";

export default function FeaturedCollection() {
  return (
    <section
      id="collection"
      className="border-y border-line bg-linen px-6 py-16 lg:px-10 lg:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className={eyebrow}>The Collection</p>
            <h2 className="mt-3 font-serif text-4xl italic sm:text-5xl">
              Featured pieces
            </h2>
          </div>

          <Link
            href="/shop"
            className="text-sm underline decoration-taupe underline-offset-4 transition-colors hover:text-umber"
          >
            View all pieces
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
