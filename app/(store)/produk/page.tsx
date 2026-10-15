import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import Heading from "@/components/store/Heading";
import ProductCard from "@/components/store/ProductCard";
import { eyebrow } from "@/components/store/ui";
import { getCategories, getProducts, getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Produk" };

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function ProductsPage(props: PageProps<"/produk">) {
  const searchParams = await props.searchParams;
  const query = first(searchParams.q);
  const category = first(searchParams.kategori);

  const [settings, categories, products] = await Promise.all([
    getSettings(),
    getCategories(),
    getProducts({ query, categorySlug: category || undefined }),
  ]);

  const filters = [{ name: "Semua", slug: "" }, ...categories];
  const hrefFor = (slug: string) => {
    const params = new URLSearchParams();
    if (slug) params.set("kategori", slug);
    if (query) params.set("q", query);
    return params.size ? `/produk?${params}` : "/produk";
  };

  return (
    <section className="px-6 py-16 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <p className={eyebrow}>{settings.collection.eyebrow}</p>
        <Heading as="h1" italic={settings.fonts.headingItalic} className="mt-3 text-4xl sm:text-5xl">
          {query ? `Hasil untuk “${query}”` : "Semua produk"}
        </Heading>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Kategori" className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const active = filter.slug === category;
              return (
                <Link
                  key={filter.slug || "all"}
                  href={hrefFor(filter.slug)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full border px-4 py-2 text-xs tracking-wide transition-colors ${
                    active ? "border-primary bg-primary text-on-primary" : "border-line hover:bg-surface"
                  }`}
                >
                  {filter.name}
                </Link>
              );
            })}
          </nav>

          <form action="/produk" role="search" className="flex items-center border-b border-ink/30 pb-1.5 sm:w-64">
            {category && <input type="hidden" name="kategori" value={category} />}
            <Search size={16} strokeWidth={1.5} className="mr-2 text-ink-muted" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Cari produk"
              aria-label="Cari produk"
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink-muted/60"
            />
          </form>
        </div>

        {products.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-sm text-ink-muted">
            Belum ada produk yang cocok.{" "}
            <Link href="/produk" className="underline underline-offset-4">Lihat semua produk</Link>.
          </p>
        )}
      </div>
    </section>
  );
}
