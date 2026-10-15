import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import Heading from "@/components/store/Heading";
import ProductCard from "@/components/store/ProductCard";
import { buttonOutline, buttonPrimary, eyebrow } from "@/components/store/ui";
import { getProducts, getSettings } from "@/lib/data";
import { whatsappLink } from "@/lib/format";

export default async function HomePage() {
  const settings = await getSettings();
  const { hero, collection, custom, story, store, fonts } = settings;
  const featured = (await getProducts({ featured: true })).slice(0, 6);
  const italic = fonts.headingItalic;

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:px-10 lg:py-24">
        <div>
          {hero.eyebrow && (
            <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.3em] text-accent sm:text-xs">
              {hero.eyebrow}
            </p>
          )}
          <h1 className="max-w-2xl text-5xl font-light leading-[1.05] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
            {hero.title}{" "}
            {hero.titleAccent && (
              <em className={`font-heading font-normal text-accent ${italic ? "" : "not-italic"}`}>
                {hero.titleAccent}
              </em>
            )}
          </h1>
          {hero.body && (
            <p className="mt-7 max-w-lg text-sm leading-7 text-ink-muted sm:text-base sm:leading-8">
              {hero.body}
            </p>
          )}
          <div className="mt-9 flex flex-wrap gap-4">
            {hero.primaryCta && (
              <Link href="/produk" className={buttonPrimary}>
                {hero.primaryCta}
              </Link>
            )}
            {hero.secondaryCta && (
              <Link href="/#cerita" className={buttonOutline}>
                {hero.secondaryCta}
              </Link>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="relative flex aspect-[4/5] flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-surface-strong">
            {hero.image ? (
              <Image src={hero.image} alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            ) : (
              <>
                <div className="text-8xl" aria-hidden>🧶</div>
                <p className="mt-7 text-[10px] font-medium uppercase tracking-[0.35em] text-ink-muted">{store.name}</p>
                <p className={`mt-2 font-heading text-2xl ${italic ? "italic" : ""}`}>{store.tagline}</p>
              </>
            )}
          </div>
          {hero.badgeText && (
            <div className="absolute -bottom-5 -left-3 rounded-2xl border border-line bg-bg px-5 py-4 shadow-lg sm:-left-5">
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-accent">{hero.badgeLabel}</p>
              <p className="mt-1 text-sm font-medium">{hero.badgeText}</p>
            </div>
          )}
        </div>
      </section>

      {/* Koleksi */}
      {featured.length > 0 && (
        <section className="border-y border-line bg-surface px-6 py-16 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className={eyebrow}>{collection.eyebrow}</p>
                <Heading italic={italic} className="mt-3 text-4xl sm:text-5xl">
                  {collection.title}
                </Heading>
              </div>
              <Link href="/produk" className="text-sm underline decoration-line underline-offset-4 hover:text-accent">
                Lihat semua produk
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Custom order */}
      {custom.enabled && (
        <section id="custom" className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <div className="rounded-[2rem] bg-surface-strong px-7 py-14 text-center sm:px-12 lg:px-20">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-accent">{custom.eyebrow}</p>
            <Heading italic={italic} className="mx-auto mt-4 max-w-2xl text-4xl leading-tight sm:text-5xl">
              {custom.title}
            </Heading>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-ink-muted sm:text-base sm:leading-8">
              {custom.body}
            </p>
            {store.whatsapp && (
              <a
                href={whatsappLink(store.whatsapp, `Halo ${store.name}, saya ingin memesan custom order.`)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonPrimary} mt-8`}
              >
                <MessageCircle size={16} strokeWidth={1.5} />
                {custom.button}
              </a>
            )}
            {custom.note && <p className="mt-4 text-[11px] text-ink-muted">{custom.note}</p>}
          </div>
        </section>
      )}

      {/* Cerita */}
      <section id="cerita" className="border-t border-line px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className={eyebrow}>{story.eyebrow}</p>
            <Heading italic={italic} className="mt-4 text-4xl leading-tight sm:text-5xl">
              {story.title}
            </Heading>
            {story.image && (
              <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                <Image src={story.image} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              </div>
            )}
          </div>
          <div className="max-w-2xl space-y-5 text-sm leading-8 text-ink-muted sm:text-base">
            {story.body
              .split(/\n\s*\n/)
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index} className="whitespace-pre-line">{paragraph}</p>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
