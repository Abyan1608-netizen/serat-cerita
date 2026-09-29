import Header from "@/components/Header";

const products = [
  {
    name: "Amigurumi Keychain",
    category: "Keychain",
    price: "Rp 85.000",
    icon: "🧸",
    available: true,
  },
  {
    name: "Little Bear",
    category: "Amigurumi",
    price: "Coming Soon",
    icon: "🐻",
    available: false,
  },
  {
    name: "Crochet Flower",
    category: "Accessories",
    price: "Coming Soon",
    icon: "🌸",
    available: false,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F2EA] text-[#3F2A20]">

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:px-10 lg:py-24">
        {/* Hero Text */}
        <div>
          <p className="mb-5 text-[10px] font-medium tracking-[0.3em] text-[#8A6048] sm:text-xs">
            HANDMADE · SLOW MADE · MEANINGFUL
          </p>

          <h1 className="max-w-2xl text-5xl font-light leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Every stitch
            <br />
            tells a{" "}
            <em className="font-serif font-normal text-[#8A6048]">
              story.
            </em>
          </h1>

          <p className="mt-7 max-w-lg text-sm leading-7 text-[#735C4D] sm:text-base sm:leading-8">
            Rajutan handmade yang dibuat dengan perhatian pada setiap detail.
            Temukan benda kecil yang membawa cerita besar.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#collection"
              className="rounded-full bg-[#3F2A20] px-7 py-3.5 text-sm tracking-wide text-[#F7F2EA] transition-all hover:bg-[#634638] hover:shadow-lg"
            >
              Explore Collection
            </a>

            <a
              href="#story"
              className="rounded-full border border-[#B7A392] px-7 py-3.5 text-sm tracking-wide transition-colors hover:bg-[#EDE3D8]"
            >
              Our Story
            </a>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="relative">
          <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#E1D3C3]">
            <div className="flex h-full flex-col items-center justify-center">
              <div className="text-8xl">🧶</div>

              <p className="mt-7 text-[10px] font-medium tracking-[0.35em] text-[#735C4D]">
                SERAT CERITA
              </p>

              <p className="mt-2 font-serif text-2xl italic text-[#4E382D]">
                Handmade Stories
              </p>
            </div>
          </div>

          {/* Floating Card */}
          <div className="absolute -bottom-5 -left-3 rounded-2xl border border-[#DED2C5] bg-[#F7F2EA] px-5 py-4 shadow-lg sm:-left-5">
            <p className="text-[9px] font-medium tracking-[0.2em] text-[#8A6048]">
              CURRENTLY CRAFTING
            </p>

            <p className="mt-1 text-sm font-medium">
              Amigurumi Collection
            </p>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section
        id="collection"
        className="border-y border-[#DED2C5] bg-[#F1E9DF] px-6 py-16 lg:px-10 lg:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-medium tracking-[0.25em] text-[#8A6048] sm:text-xs">
                THE COLLECTION
              </p>

              <h2 className="mt-3 font-serif text-4xl italic sm:text-5xl">
                Featured pieces
              </h2>
            </div>

            <a
              href="#"
              className="text-sm underline decoration-[#B7A392] underline-offset-4 transition-colors hover:text-[#8A6048]"
            >
              View all pieces
            </a>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.name} className="group">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#E1D3C3]">
                  <div className="flex h-full items-center justify-center text-7xl transition-transform duration-500 group-hover:scale-110">
                    {product.icon}
                  </div>

                  {!product.available && (
                    <div className="absolute left-4 top-4 rounded-full bg-[#F7F2EA]/90 px-3 py-1.5 text-[9px] font-medium tracking-[0.15em] backdrop-blur">
                      COMING SOON
                    </div>
                  )}

                  {product.available && (
                    <button
                      type="button"
                      aria-label={`Add ${product.name} to wishlist`}
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F2EA]/90 text-xl backdrop-blur transition-transform hover:scale-110"
                    >
                      ♡
                    </button>
                  )}
                </div>

                <div className="flex items-start justify-between gap-4 pt-4">
                  <div>
                    <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#987865]">
                      {product.category}
                    </p>

                    <h3 className="mt-1 text-base">{product.name}</h3>
                  </div>

                  <p className="text-sm font-medium">{product.price}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Order */}
      <section
        id="custom"
        className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28"
      >
        <div className="rounded-[2rem] bg-[#DED0BF] px-7 py-14 text-center sm:px-12 lg:px-20">
          <p className="text-[10px] font-medium tracking-[0.3em] text-[#8A6048]">
            MADE JUST FOR YOU
          </p>

          <h2 className="mx-auto mt-4 max-w-2xl font-serif text-4xl italic leading-tight sm:text-5xl">
            Have a story in mind?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#735C4D] sm:text-base sm:leading-8">
            Kami menerima pesanan custom untuk beberapa produk. Ceritakan ide
            Anda dan biarkan kami membantu mewujudkannya menjadi rajutan yang
            personal.
          </p>

          <button
            type="button"
            className="mt-8 rounded-full bg-[#3F2A20] px-7 py-3.5 text-sm tracking-wide text-[#F7F2EA] transition-colors hover:bg-[#634638]"
          >
            Request a Custom Order
          </button>

          <p className="mt-4 text-[10px] text-[#806957]">
            Custom orders require confirmation and may have additional
            production time.
          </p>
        </div>
      </section>

      {/* Story */}
      <section
        id="story"
        className="border-t border-[#DED2C5] bg-[#F7F2EA] px-6 py-20 lg:px-10 lg:py-28"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-[10px] font-medium tracking-[0.25em] text-[#8A6048] sm:text-xs">
              OUR PHILOSOPHY
            </p>

            <h2 className="mt-4 font-serif text-4xl italic leading-tight sm:text-5xl">
              Small stitches.
              <br />
              Meaningful stories.
            </h2>
          </div>

          <div className="max-w-2xl text-sm text-[#735C4D] sm:text-base">
            <p className="leading-8">
              Serat Cerita lahir dari kecintaan pada sesuatu yang dibuat
              perlahan, dengan tangan, dan penuh perhatian. Setiap rajutan
              memiliki karakter dan cerita yang berbeda.
            </p>

            <p className="mt-5 leading-8">
              Dari sebuah keychain kecil hingga koleksi yang lebih besar,
              perjalanan Serat Cerita akan terus berkembang satu benang demi
              satu benang.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3F2A20] px-6 py-12 text-[#F7F2EA] lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-lg tracking-[0.2em]">SERAT CERITA</p>

            <p className="mt-3 text-sm text-[#D8C7B7]">
              Handmade with intention.
            </p>
          </div>

          <p className="text-xs text-[#BFAE9E]">
            © 2026 Serat Cerita. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}