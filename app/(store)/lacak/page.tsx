import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Heading from "@/components/store/Heading";
import { buttonPrimary, field } from "@/components/store/ui";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Lacak pesanan" };

async function track(formData: FormData) {
  "use server";
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (/^[A-Z0-9-]{6,30}$/.test(code)) redirect(`/pesanan/${code}`);
  redirect("/lacak");
}

export default async function TrackPage() {
  const settings = await getSettings();
  return (
    <section className="px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-md text-center">
        <Heading as="h1" italic={settings.fonts.headingItalic} className="text-4xl sm:text-5xl">
          Lacak pesanan
        </Heading>
        <p className="mt-4 text-sm text-ink-muted">Masukkan kode pesanan, contoh: SC-251015-7KQ2MX</p>
        <form action={track} className="mt-8 grid gap-4">
          <input name="code" required placeholder="Kode pesanan" aria-label="Kode pesanan" className={`${field} text-center uppercase`} />
          <button type="submit" className={buttonPrimary}>Lacak</button>
        </form>
      </div>
    </section>
  );
}
