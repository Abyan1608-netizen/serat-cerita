import { eyebrow } from "@/components/ui/styles";

export default function Story() {
  return (
    <section id="story" className="border-t border-line px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className={eyebrow}>Our Philosophy</p>
          <h2 className="mt-4 font-serif text-4xl italic leading-tight sm:text-5xl">
            Small stitches.
            <br />
            Meaningful stories.
          </h2>
        </div>

        <div className="max-w-2xl space-y-5 text-sm leading-8 text-muted sm:text-base">
          <p>
            Serat Cerita lahir dari kecintaan pada sesuatu yang dibuat perlahan,
            dengan tangan, dan penuh perhatian. Setiap rajutan memiliki karakter
            dan cerita yang berbeda.
          </p>
          <p>
            Dari sebuah keychain kecil hingga koleksi yang lebih besar,
            perjalanan Serat Cerita akan terus berkembang satu benang demi satu
            benang.
          </p>
        </div>
      </div>
    </section>
  );
}
