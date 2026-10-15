import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import AddToCart from "@/components/product/AddToCart";
import WishlistButton from "@/components/product/WishlistButton";
import { buttonOutline, eyebrow } from "@/components/ui/styles";
import { getProduct, isAvailable, products } from "@/lib/products";
import { formatRupiah, site, whatsappLink } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata(
  props: PageProps<"/products/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProduct(slug);

  return product
    ? { title: product.name, description: product.description }
    : {};
}

export default async function ProductPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) notFound();

  const available = isAvailable(product);

  return (
    <section className="px-6 py-12 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-umber"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Kembali ke Shop
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:items-start">
          <div className="relative flex aspect-square items-center justify-center rounded-[2rem] bg-oat text-[9rem]">
            <span aria-hidden>{product.icon}</span>
            {!available && (
              <div className="absolute left-5 top-5 rounded-full bg-cream/90 px-3 py-1.5 text-[9px] font-medium tracking-[0.15em] backdrop-blur">
                COMING SOON
              </div>
            )}
          </div>

          <div>
            <p className={eyebrow}>{product.category}</p>
            <div className="mt-3 flex items-start justify-between gap-4">
              <h1 className="font-serif text-4xl italic sm:text-5xl">
                {product.name}
              </h1>
              <WishlistButton
                slug={product.slug}
                name={product.name}
                className="shrink-0 border border-taupe"
              />
            </div>

            <p className="mt-4 text-xl">
              {available ? formatRupiah(product.price) : "Coming Soon"}
            </p>

            <p className="mt-6 max-w-lg text-sm leading-7 text-muted sm:text-base sm:leading-8">
              {product.description}
            </p>

            <ul className="mt-6 space-y-2 text-sm text-muted">
              {product.details.map((detail) => (
                <li key={detail} className="flex gap-3">
                  <span aria-hidden className="text-umber">
                    ·
                  </span>
                  {detail}
                </li>
              ))}
            </ul>

            <div className="mt-9">
              {available ? (
                <AddToCart slug={product.slug} />
              ) : (
                <a
                  href={whatsappLink(
                    `Halo ${site.name}, kabari saya saat ${product.name} sudah tersedia ya!`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonOutline}
                >
                  <MessageCircle size={16} strokeWidth={1.5} />
                  Kabari saya saat tersedia
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
