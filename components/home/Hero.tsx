import Link from "next/link";
import { buttonOutline, buttonPrimary } from "@/components/ui/styles";
import { site } from "@/lib/site";

export default function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:px-10 lg:py-24">
      <div>
        <p className="mb-5 text-[10px] font-medium tracking-[0.3em] text-umber sm:text-xs">
          HANDMADE · SLOW MADE · MEANINGFUL
        </p>

        <h1 className="max-w-2xl text-5xl font-light leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
          Every stitch
          <br />
          tells a{" "}
          <em className="font-serif font-normal text-umber">story.</em>
        </h1>

        <p className="mt-7 max-w-lg text-sm leading-7 text-muted sm:text-base sm:leading-8">
          {site.description}
        </p>

        <div className="mt-9 flex flex-wrap gap-4">
          <Link href="/shop" className={buttonPrimary}>
            Explore Collection
          </Link>
          <Link href="/#story" className={buttonOutline}>
            Our Story
          </Link>
        </div>
      </div>

      <div className="relative">
        <div className="flex aspect-[4/5] flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-oat">
          <div className="text-8xl" aria-hidden>
            🧶
          </div>
          <p className="mt-7 text-[10px] font-medium tracking-[0.35em] text-muted">
            SERAT CERITA
          </p>
          <p className="mt-2 font-serif text-2xl italic text-[#4e382d]">
            {site.tagline}
          </p>
        </div>

        <div className="absolute -bottom-5 -left-3 rounded-2xl border border-line bg-cream px-5 py-4 shadow-lg sm:-left-5">
          <p className="text-[9px] font-medium tracking-[0.2em] text-umber">
            CURRENTLY CRAFTING
          </p>
          <p className="mt-1 text-sm font-medium">Amigurumi Collection</p>
        </div>
      </div>
    </section>
  );
}
