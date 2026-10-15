import type { Metadata } from "next";
import WishlistView from "@/components/cart/WishlistView";
import { eyebrow } from "@/components/ui/styles";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <section className="px-6 py-16 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <p className={eyebrow}>Saved for later</p>
        <h1 className="mt-3 font-serif text-4xl italic sm:text-5xl">Wishlist</h1>
        <WishlistView />
      </div>
    </section>
  );
}
