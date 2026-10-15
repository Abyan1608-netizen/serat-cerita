import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { eyebrow } from "@/components/ui/styles";
import { categories, products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop",
  description: "Semua koleksi rajutan handmade Serat Cerita.",
};

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function ShopPage(props: PageProps<"/shop">) {
  const searchParams = await props.searchParams;
  const query = first(searchParams.q);
  const category = first(searchParams.category);

  const results = products.filter((product) => {
    const matchesCategory = !category || product.category === category;
    const matchesQuery =
      !query ||
      `${product.name} ${product.category}`
        .toLowerCase()
        .includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const filters = [{ label: "All", value: "" }].concat(
    categories.map((c) => ({ label: c, value: c })),
  );

  return (
    <section className="px-6 py-16 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <p className={eyebrow}>The Collection</p>
        <h1 className="mt-3 font-serif text-4xl italic sm:text-5xl">
          {query ? `Hasil untuk “${query}”` : "All pieces"}
        </h1>

        <nav aria-label="Kategori" className="mt-8 flex flex-wrap gap-2">
          {filters.map((filter) => {
            const active = filter.value === category;
            const params = new URLSearchParams();
            if (filter.value) params.set("category", filter.value);
            if (query) params.set("q", query);
            const href = params.size ? `/shop?${params}` : "/shop";

            return (
              <Link
                key={filter.label}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full border px-4 py-2 text-xs tracking-wide transition-colors ${
                  active
                    ? "border-cocoa bg-cocoa text-cream"
                    : "border-taupe hover:bg-mist"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </nav>

        {results.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-sm text-muted">
            Belum ada produk yang cocok.{" "}
            <Link href="/shop" className="underline underline-offset-4">
              Lihat semua produk
            </Link>
            .
          </p>
        )}
      </div>
    </section>
  );
}
