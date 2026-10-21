import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Camera, Clock, Mail, MapPin, MessageCircle } from "lucide-react";
import Heading from "@/components/store/Heading";
import { getSettings } from "@/lib/data";
import { normalizePhone, whatsappLink } from "@/lib/format";

export const metadata: Metadata = { title: "Kontak" };

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="flex gap-4 border-b border-line py-5">
      <span className="mt-0.5 text-accent">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">{label}</p>
        <div className="mt-1">{children}</div>
      </div>
    </li>
  );
}

export default async function ContactPage() {
  const settings = await getSettings();
  const { store } = settings;
  const phone = normalizePhone(store.whatsapp);

  return (
    <section className="px-6 py-16 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <Heading as="h1" italic={settings.fonts.headingItalic} className="text-4xl sm:text-5xl">
          Kontak
        </Heading>
        <p className="mt-4 text-sm text-ink-muted sm:text-base">
          Ada pertanyaan tentang produk atau pesanan? Hubungi {store.name} melalui:
        </p>

        <ul className="mt-8 border-t border-line">
          {store.whatsapp && (
            <Row icon={<MessageCircle size={20} strokeWidth={1.5} />} label="WhatsApp / Telepon">
              <a href={whatsappLink(store.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                +{phone}
              </a>
            </Row>
          )}
          {store.email && (
            <Row icon={<Mail size={20} strokeWidth={1.5} />} label="Email">
              <a href={`mailto:${store.email}`} className="hover:text-accent">{store.email}</a>
            </Row>
          )}
          {store.instagram && (
            <Row icon={<Camera size={20} strokeWidth={1.5} />} label="Instagram">
              <a
                href={`https://instagram.com/${store.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
              >
                @{store.instagram.replace(/^@/, "")}
              </a>
            </Row>
          )}
          {store.address && (
            <Row icon={<MapPin size={20} strokeWidth={1.5} />} label="Alamat">
              <p className="whitespace-pre-line">{store.address}</p>
            </Row>
          )}
          {store.hours && (
            <Row icon={<Clock size={20} strokeWidth={1.5} />} label="Jam layanan">
              <p>{store.hours}</p>
            </Row>
          )}
        </ul>
      </div>
    </section>
  );
}
