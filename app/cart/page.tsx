import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";
import { eyebrow } from "@/components/ui/styles";

export const metadata: Metadata = { title: "Keranjang" };

export default function CartPage() {
  return (
    <section className="px-6 py-16 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <p className={eyebrow}>Shopping Bag</p>
        <h1 className="mt-3 font-serif text-4xl italic sm:text-5xl">Your bag</h1>
        <CartView />
      </div>
    </section>
  );
}
