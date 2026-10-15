import type { Metadata } from "next";
import Footer from "@/components/store/Footer";
import Header from "@/components/store/Header";
import { getSettings } from "@/lib/data";
import { themeStyle } from "@/lib/theme";

export async function generateMetadata(): Promise<Metadata> {
  const { store } = await getSettings();
  return {
    title: { absolute: `${store.name} — ${store.tagline}`, template: `%s · ${store.name}` },
    description: store.description,
    icons: store.logo ? { icon: store.logo } : undefined,
  };
}

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();

  return (
    <div style={themeStyle(settings)} className="flex min-h-screen flex-col bg-bg text-ink">
      <Header
        storeName={settings.store.name}
        logo={settings.store.logo}
        announcement={settings.store.announcement}
        showCustom={settings.custom.enabled}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
