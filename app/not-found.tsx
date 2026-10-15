import Link from "next/link";
import { buttonPrimary, eyebrow } from "@/components/ui/styles";

export default function NotFound() {
  return (
    <section className="px-6 py-24 text-center lg:py-32">
      <p className={eyebrow}>404</p>
      <h1 className="mt-4 font-serif text-4xl italic sm:text-5xl">
        Benang ceritanya terputus.
      </h1>
      <p className="mt-5 text-sm text-muted">Halaman yang Anda cari tidak ditemukan.</p>
      <Link href="/" className={`${buttonPrimary} mt-8`}>
        Kembali ke beranda
      </Link>
    </section>
  );
}
