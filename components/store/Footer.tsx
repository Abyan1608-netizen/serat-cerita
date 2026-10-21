import Link from "next/link";
import { whatsappLink } from "@/lib/format";
import type { StoreSettings } from "@/lib/settings";

export default function Footer({ settings }: { settings: StoreSettings }) {
  const { store, footer } = settings;

  return (
    <footer className="bg-footer px-6 py-12 text-on-footer lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-lg uppercase tracking-[0.2em]">{store.name}</p>
          {footer.tagline && <p className="mt-3 text-sm opacity-75">{footer.tagline}</p>}

          <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm opacity-75">
            <Link href="/produk" className="hover:opacity-100">Produk</Link>
            <Link href="/lacak" className="hover:opacity-100">Lacak Pesanan</Link>
            <Link href="/kontak" className="hover:opacity-100">Kontak</Link>
            {store.whatsapp && (
              <a href={whatsappLink(store.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:opacity-100">
                WhatsApp
              </a>
            )}
            {store.instagram && (
              <a
                href={`https://instagram.com/${store.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-100"
              >
                Instagram
              </a>
            )}
            {store.email && (
              <a href={`mailto:${store.email}`} className="hover:opacity-100">
                Email
              </a>
            )}
          </nav>
        </div>

        <div className="flex flex-col gap-2 text-xs opacity-60 sm:items-end">
          <nav className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/info/syarat-ketentuan" className="hover:opacity-100">Syarat & Ketentuan</Link>
            <Link href="/info/kebijakan-pengembalian" className="hover:opacity-100">Kebijakan Pengembalian</Link>
            <Link href="/info/kebijakan-privasi" className="hover:opacity-100">Kebijakan Privasi</Link>
          </nav>
          <p>
            © {new Date().getFullYear()} {store.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
