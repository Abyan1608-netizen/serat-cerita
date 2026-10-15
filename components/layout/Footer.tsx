import Link from "next/link";
import { navLinks, site, whatsappLink } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-cocoa px-6 py-12 text-cream lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-lg tracking-[0.2em]">SERAT CERITA</p>
          <p className="mt-3 text-sm text-[#d8c7b7]">Handmade with intention.</p>

          <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#d8c7b7]">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-cream">
                {link.label}
              </Link>
            ))}
            <a
              href={whatsappLink(`Halo ${site.name}!`)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cream"
            >
              WhatsApp
            </a>
          </nav>
        </div>

        <p className="text-xs text-[#bfae9e]">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
