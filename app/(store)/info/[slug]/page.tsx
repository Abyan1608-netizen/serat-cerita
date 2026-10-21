import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Heading from "@/components/store/Heading";
import { getSettings } from "@/lib/data";
import type { StoreSettings } from "@/lib/settings";

const policyPages = {
  "syarat-ketentuan": { title: "Syarat & Ketentuan", key: "terms" },
  "kebijakan-pengembalian": { title: "Kebijakan Pengembalian Dana", key: "refund" },
  "kebijakan-privasi": { title: "Kebijakan Privasi", key: "privacy" },
} satisfies Record<string, { title: string; key: keyof StoreSettings["policies"] }>;

function pageFor(slug: string) {
  return policyPages[slug as keyof typeof policyPages];
}

export async function generateMetadata(props: PageProps<"/info/[slug]">): Promise<Metadata> {
  const page = pageFor((await props.params).slug);
  return page ? { title: page.title } : {};
}

export default async function PolicyPage(props: PageProps<"/info/[slug]">) {
  const page = pageFor((await props.params).slug);
  if (!page) notFound();
  const settings = await getSettings();

  return (
    <section className="px-6 py-16 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <Heading as="h1" italic={settings.fonts.headingItalic} className="text-4xl sm:text-5xl">
          {page.title}
        </Heading>
        <p className="mt-3 text-sm text-ink-muted">{settings.store.name}</p>
        <div className="mt-10 space-y-5 text-sm leading-7 text-ink-muted sm:text-base sm:leading-8">
          {settings.policies[page.key]
            .split(/\n\s*\n/)
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={index} className="whitespace-pre-line">{paragraph}</p>
            ))}
        </div>
      </div>
    </section>
  );
}
