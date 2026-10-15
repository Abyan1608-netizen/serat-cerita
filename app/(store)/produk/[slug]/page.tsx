import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import AddToCart from "@/components/store/AddToCart";
import Gallery from "@/components/store/Gallery";
import Heading from "@/components/store/Heading";
import { buttonOutline, eyebrow } from "@/components/store/ui";
import { getProduct, getSettings } from "@/lib/data";
import { formatRupiah, whatsappLink } from "@/lib/format";

export async function generateMetadata(props: PageProps<"/produk/[slug]">): Promise<Metadata> {
  const product = await getProduct((await props.params).slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    openGraph: product.images[0] ? { images: [product.images[0]] } : undefined,
  };
}

export default async function ProductPage(props: PageProps<"/produk/[slug]">) {
  const { slug } = await props.params;
  const [product, settings] = await Promise.all([getProduct(slug), getSettings()]);
  if (!product) notFound();

  const comingSoon = product.status === "coming_soon";
  const soldOut = !comingSoon && product.stock === 0;
  const wa = settings.store.whatsapp;

  return (
    <section className="px-6 py-12 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <Link href="/produk" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-accent">
          <ArrowLeft size={16} strokeWidth={1.5} />
          Kembali ke produk
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:items-start">
          <Gallery images={product.images} name={product.name} />

          <div>
            {product.category && <p className={eyebrow}>{product.category.name}</p>}
            <Heading as="h1" italic={settings.fonts.headingItalic} className="mt-3 text-4xl sm:text-5xl">
              {product.name}
            </Heading>
            <p className="mt-4 text-xl">{comingSoon ? "Segera hadir" : formatRupiah(product.price)}</p>
            {!comingSoon && (
              <p className="mt-1 text-xs text-ink-muted">
                {soldOut ? "Stok habis" : `Stok tersedia: ${product.stock}`}
              </p>
            )}

            {product.description && (
              <p className="mt-6 max-w-lg whitespace-pre-line text-sm leading-7 text-ink-muted sm:text-base sm:leading-8">
                {product.description}
              </p>
            )}

            {product.details.length > 0 && (
              <ul className="mt-6 space-y-2 text-sm text-ink-muted">
                {product.details.map((detail) => (
                  <li key={detail} className="flex gap-3">
                    <span aria-hidden className="text-accent">·</span>
                    {detail}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-9">
              {comingSoon || soldOut ? (
                wa && (
                  <a
                    href={whatsappLink(wa, `Halo ${settings.store.name}, kabari saya saat ${product.name} tersedia ya!`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonOutline}
                  >
                    <MessageCircle size={16} strokeWidth={1.5} />
                    Kabari saya saat tersedia
                  </a>
                )
              ) : (
                <AddToCart productId={product.id} stock={product.stock} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
