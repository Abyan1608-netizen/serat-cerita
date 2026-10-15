import Link from "next/link";
import { buttonPrimary } from "@/components/store/ui";

export default function NotFound() {
  return (
    <section className="px-6 py-24 text-center lg:py-32">
      <p className="text-xs uppercase tracking-[0.25em] text-accent">404</p>
      <h1 className="mt-4 font-heading text-4xl sm:text-5xl">Benang ceritanya terputus.</h1>
      <p className="mt-5 text-sm text-ink-muted">Halaman yang Anda cari tidak ditemukan.</p>
      <Link href="/" className={`${buttonPrimary} mt-8`}>Kembali ke beranda</Link>
    </section>
  );
}
