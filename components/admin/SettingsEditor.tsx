"use client";

import { useState, useTransition } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { saveSettings } from "@/app/admin/actions";
import { ImageField } from "@/components/admin/ImageField";
import MoneyInput from "@/components/admin/MoneyInput";
import { adminButton, adminButtonOutline, adminCard, adminHint, adminInput, adminLabel } from "@/components/admin/ui";
import {
  colorPresets,
  defaultSettings,
  headingFonts,
  type HeadingFont,
  type StoreSettings,
  type ThemeColors,
} from "@/lib/settings";
import { themeStyle } from "@/lib/theme";

type Section = Exclude<keyof StoreSettings, "colors" | "fonts" | "checkout">;

type FieldDef = {
  section: Section;
  key: string;
  label: string;
  hint?: string;
  type?: "text" | "textarea" | "image" | "toggle" | "tel";
};

const tabs = [
  { id: "store", label: "Identitas toko" },
  { id: "home", label: "Beranda" },
  { id: "custom", label: "Pesanan custom" },
  { id: "story", label: "Cerita" },
  { id: "design", label: "Warna & Font" },
  { id: "checkout", label: "Ongkir & Checkout" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const fields: Record<Exclude<TabId, "design" | "checkout">, FieldDef[]> = {
  store: [
    { section: "store", key: "name", label: "Nama toko" },
    { section: "store", key: "tagline", label: "Slogan singkat" },
    { section: "store", key: "description", label: "Deskripsi toko", hint: "Tampil di Google dan saat link dibagikan.", type: "textarea" },
    { section: "store", key: "announcement", label: "Pengumuman di bagian paling atas", hint: "Kosongkan untuk menyembunyikan." },
    { section: "store", key: "logo", label: "Logo", hint: "Opsional. Sebaiknya foto persegi.", type: "image" },
    { section: "store", key: "whatsapp", label: "Nomor WhatsApp toko", hint: "Boleh diketik 08xx — otomatis diubah ke format 628xx. Dipakai untuk tombol chat.", type: "tel" },
    { section: "store", key: "instagram", label: "Instagram", hint: "Contoh: @seratcerita" },
    { section: "store", key: "email", label: "Email toko" },
    { section: "footer", key: "tagline", label: "Tulisan di bagian bawah (footer)" },
  ],
  home: [
    { section: "hero", key: "eyebrow", label: "Tulisan kecil di atas judul" },
    { section: "hero", key: "title", label: "Judul utama" },
    { section: "hero", key: "titleAccent", label: "Kata penutup judul (berwarna & miring)" },
    { section: "hero", key: "body", label: "Paragraf pembuka", type: "textarea" },
    { section: "hero", key: "primaryCta", label: "Tulisan tombol utama", hint: "Mengarah ke halaman Produk." },
    { section: "hero", key: "secondaryCta", label: "Tulisan tombol kedua", hint: "Mengarah ke bagian Cerita. Kosongkan untuk menyembunyikan." },
    { section: "hero", key: "image", label: "Foto besar beranda", hint: "Sebaiknya foto tegak (potret).", type: "image" },
    { section: "hero", key: "badgeLabel", label: "Label kartu kecil" },
    { section: "hero", key: "badgeText", label: "Isi kartu kecil", hint: "Kosongkan untuk menyembunyikan kartu." },
    { section: "collection", key: "eyebrow", label: "Tulisan kecil di atas daftar produk" },
    { section: "collection", key: "title", label: "Judul daftar produk" },
  ],
  custom: [
    { section: "custom", key: "enabled", label: "Tampilkan bagian pesanan custom", type: "toggle" },
    { section: "custom", key: "eyebrow", label: "Tulisan kecil" },
    { section: "custom", key: "title", label: "Judul" },
    { section: "custom", key: "body", label: "Penjelasan", type: "textarea" },
    { section: "custom", key: "button", label: "Tulisan tombol", hint: "Tombol membuka chat WhatsApp toko." },
    { section: "custom", key: "note", label: "Catatan kecil di bawah tombol" },
  ],
  story: [
    { section: "story", key: "eyebrow", label: "Tulisan kecil" },
    { section: "story", key: "title", label: "Judul" },
    { section: "story", key: "body", label: "Isi cerita", hint: "Pisahkan paragraf dengan satu baris kosong.", type: "textarea" },
    { section: "story", key: "image", label: "Foto (opsional)", type: "image" },
  ],
};

const colorFields: { key: keyof ThemeColors; label: string; hint: string }[] = [
  { key: "background", label: "Latar utama", hint: "Warna dasar seluruh halaman" },
  { key: "surface", label: "Latar bagian", hint: "Bagian koleksi, kotak ringkasan" },
  { key: "surfaceStrong", label: "Latar foto & kartu", hint: "Kotak foto produk, bagian custom" },
  { key: "border", label: "Garis", hint: "Garis pemisah dan bingkai" },
  { key: "text", label: "Teks utama", hint: "Judul dan tulisan biasa" },
  { key: "textMuted", label: "Teks lembut", hint: "Paragraf dan keterangan" },
  { key: "accent", label: "Aksen", hint: "Tulisan kecil berwarna, kata miring di judul" },
  { key: "primary", label: "Tombol", hint: "Tombol utama dan pengumuman atas" },
  { key: "primaryText", label: "Teks tombol", hint: "Tulisan di atas tombol" },
  { key: "footer", label: "Latar footer", hint: "Bagian paling bawah" },
  { key: "footerText", label: "Teks footer", hint: "Tulisan di footer" },
];

function Preview({ settings }: { settings: StoreSettings }) {
  const italic = settings.fonts.headingItalic ? "italic" : "";
  return (
    <div style={themeStyle(settings)} className="overflow-hidden rounded-2xl border border-stone-200 bg-bg text-ink">
      {settings.store.announcement && (
        <div className="bg-primary px-3 py-1.5 text-center text-[8px] tracking-[0.2em] text-on-primary">{settings.store.announcement}</div>
      )}
      <div className="border-b border-line px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">{settings.store.name}</div>
      <div className="px-4 py-5">
        <p className="text-[8px] uppercase tracking-[0.25em] text-accent">{settings.hero.eyebrow}</p>
        <p className="mt-2 text-xl font-light leading-tight">
          {settings.hero.title} <em className={`font-heading text-accent ${italic ? "" : "not-italic"}`}>{settings.hero.titleAccent}</em>
        </p>
        <p className="mt-2 line-clamp-2 text-[10px] text-ink-muted">{settings.hero.body}</p>
        <span className="mt-3 inline-block rounded-full bg-primary px-3 py-1.5 text-[10px] text-on-primary">{settings.hero.primaryCta || "Tombol"}</span>
      </div>
      <div className="border-t border-line bg-surface px-4 py-4">
        <p className={`font-heading text-base ${italic}`}>{settings.collection.title}</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => <div key={i} className="aspect-square rounded-lg bg-surface-strong" />)}
        </div>
      </div>
      <div className="bg-footer px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-on-footer">{settings.store.name}</div>
    </div>
  );
}

export default function SettingsEditor({ initial }: { initial: StoreSettings }) {
  const [settings, setSettings] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [tab, setTab] = useState<TabId>("store");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(settings) !== JSON.stringify(saved);

  function update<S extends keyof StoreSettings>(section: S, patch: Partial<StoreSettings[S]>) {
    setSettings((current) => ({ ...current, [section]: { ...current[section], ...patch } }));
    setMessage(null);
  }

  function save() {
    startTransition(async () => {
      const result = await saveSettings(settings);
      if (result.ok) setSaved(settings);
      setMessage(result.ok ? { ok: true, text: result.message ?? "Tersimpan" } : { ok: false, text: result.error });
    });
  }

  function renderField(field: FieldDef) {
    const value = (settings[field.section] as Record<string, unknown>)[field.key];
    const set = (v: unknown) => update(field.section, { [field.key]: v } as never);
    const id = `${field.section}-${field.key}`;

    if (field.type === "toggle") {
      return (
        <label key={id} className="flex items-center gap-3 text-sm font-medium">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => set(e.target.checked)} className="h-4 w-4 accent-stone-900" />
          {field.label}
        </label>
      );
    }
    if (field.type === "image") {
      return (
        <div key={id} className={adminLabel}>
          <span>{field.label}</span>
          {field.hint && <span className={adminHint}>{field.hint}</span>}
          <ImageField value={String(value ?? "")} onChange={set} />
        </div>
      );
    }
    return (
      <label key={id} className={adminLabel}>
        {field.label}
        {field.hint && <span className={adminHint}>{field.hint}</span>}
        {field.type === "textarea" ? (
          <textarea rows={field.key === "body" && field.section === "story" ? 8 : 3} value={String(value ?? "")} onChange={(e) => set(e.target.value)} className={adminInput} />
        ) : (
          <input
            type={field.type === "tel" ? "tel" : "text"}
            value={String(value ?? "")}
            onChange={(e) => set(field.type === "tel" ? e.target.value.replace(/\D/g, "").replace(/^0/, "62") : e.target.value)}
            className={adminInput}
          />
        )}
      </label>
    );
  }

  return (
    <div className="pb-24">
      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 ring-1 ring-stone-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
              tab === t.id ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className={`${adminCard} grid content-start gap-5`}>
          {tab in fields && fields[tab as keyof typeof fields].map(renderField)}

          {tab === "design" && (
            <>
              <div>
                <p className="text-sm font-medium text-stone-700">Pilihan warna siap pakai</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(colorPresets).map(([name, colors]) => (
                    <button key={name} type="button" onClick={() => update("colors", colors)} className={adminButtonOutline}>
                      <span className="flex -space-x-1">
                        {[colors.background, colors.accent, colors.primary].map((c) => (
                          <span key={c} className="h-4 w-4 rounded-full ring-2 ring-white" style={{ background: c }} />
                        ))}
                      </span>
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {colorFields.map((color) => (
                  <label key={color.key} className="flex items-center gap-3 rounded-xl border border-stone-200 p-3">
                    <input
                      type="color"
                      value={settings.colors[color.key]}
                      onChange={(e) => update("colors", { [color.key]: e.target.value })}
                      className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-stone-200 bg-white"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{color.label}</span>
                      <span className="block text-xs text-stone-500">{color.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
              <label className={adminLabel}>
                Font judul
                <select
                  value={settings.fonts.heading}
                  onChange={(e) => update("fonts", { heading: e.target.value as HeadingFont })}
                  className={adminInput}
                >
                  {Object.entries(headingFonts).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-3 text-sm font-medium">
                <input type="checkbox" checked={settings.fonts.headingItalic} onChange={(e) => update("fonts", { headingItalic: e.target.checked })} className="h-4 w-4 accent-stone-900" />
                Judul bergaya miring (italic)
              </label>
              <button
                type="button"
                onClick={() => {
                  update("colors", defaultSettings.colors);
                  update("fonts", defaultSettings.fonts);
                }}
                className={`${adminButtonOutline} w-fit`}
              >
                <RotateCcw size={16} /> Kembalikan ke awal
              </button>
            </>
          )}

          {tab === "checkout" && (
            <>
              <div>
                <p className="text-sm font-medium text-stone-700">Pilihan pengiriman</p>
                <p className={adminHint}>Pembeli memilih salah satu saat checkout. Isi 0 untuk gratis.</p>
                <div className="mt-3 grid gap-3">
                  {settings.checkout.shippingOptions.map((option, index) => (
                    <div key={index} className="flex flex-wrap items-center gap-2">
                      <input
                        value={option.name}
                        aria-label="Nama pengiriman"
                        onChange={(e) =>
                          update("checkout", {
                            shippingOptions: settings.checkout.shippingOptions.map((o, i) => (i === index ? { ...o, name: e.target.value } : o)),
                          })
                        }
                        className={`${adminInput} min-w-40 flex-1`}
                      />
                      <div className="w-40">
                        <MoneyInput
                          value={option.price}
                          onChange={(price) =>
                            update("checkout", {
                              shippingOptions: settings.checkout.shippingOptions.map((o, i) => (i === index ? { ...o, price } : o)),
                            })
                          }
                        />
                      </div>
                      <button
                        type="button"
                        aria-label="Hapus pilihan"
                        disabled={settings.checkout.shippingOptions.length <= 1}
                        onClick={() => update("checkout", { shippingOptions: settings.checkout.shippingOptions.filter((_, i) => i !== index) })}
                        className="rounded-lg p-2 text-red-700 hover:bg-red-50 disabled:opacity-30"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => update("checkout", { shippingOptions: [...settings.checkout.shippingOptions, { name: "Pengiriman baru", price: 0 }] })}
                  className={`${adminButtonOutline} mt-3`}
                >
                  <Plus size={16} /> Tambah pilihan
                </button>
              </div>
              <label className={adminLabel}>
                Catatan di halaman checkout
                <textarea rows={3} value={settings.checkout.note} onChange={(e) => update("checkout", { note: e.target.value })} className={adminInput} />
              </label>
            </>
          )}
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-2 text-sm font-medium text-stone-600">Pratinjau</p>
          <Preview settings={settings} />
          <a href="/" target="_blank" className="mt-3 inline-block text-sm text-stone-500 underline">Buka toko di tab baru</a>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-3">
          {message ? (
            <p role="status" className={`mr-auto text-sm ${message.ok ? "text-emerald-700" : "text-red-700"}`}>{message.text}</p>
          ) : (
            dirty && <p className="mr-auto text-sm text-amber-700">Ada perubahan yang belum disimpan</p>
          )}
          {dirty && (
            <button type="button" onClick={() => setSettings(saved)} className={adminButtonOutline}>Batalkan</button>
          )}
          <button type="button" onClick={save} disabled={pending || !dirty} className={adminButton}>
            {pending ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
