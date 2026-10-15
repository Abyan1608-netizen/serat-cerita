import type { Metadata } from "next";
import CartView from "@/components/store/CartView";
import Heading from "@/components/store/Heading";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Keranjang" };

export default async function CartPage() {
  const settings = await getSettings();
  return (
    <section className="px-6 py-16 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <Heading as="h1" italic={settings.fonts.headingItalic} className="text-4xl sm:text-5xl">
          Keranjang
        </Heading>
        <CartView />
      </div>
    </section>
  );
}
