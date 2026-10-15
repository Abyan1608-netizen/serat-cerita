"use client";

import { MessageCircle } from "lucide-react";
import { buttonPrimary } from "@/components/ui/styles";
import { categories } from "@/lib/products";
import { site, whatsappLink } from "@/lib/site";

const fieldClass =
  "w-full rounded-2xl border border-taupe bg-cream/70 px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#9a8778] focus:border-umber";

export default function CustomOrderForm() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();

    const message = [
      `Halo ${site.name}, saya ingin memesan custom order.`,
      "",
      `Nama: ${get("name")}`,
      `Jenis produk: ${get("type")}`,
      get("deadline") && `Dibutuhkan sebelum: ${get("deadline")}`,
      "",
      "Cerita / detail pesanan:",
      get("story"),
    ]
      .filter((line) => line !== "")
      .join("\n");

    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-10 grid max-w-xl gap-4 text-left sm:grid-cols-2"
    >
      <label className="grid gap-2 text-xs tracking-wide text-muted">
        Nama
        <input name="name" required autoComplete="name" className={fieldClass} />
      </label>

      <label className="grid gap-2 text-xs tracking-wide text-muted">
        Jenis produk
        <select name="type" className={fieldClass} defaultValue={categories[0]}>
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
          <option>Lainnya</option>
        </select>
      </label>

      <label className="grid gap-2 text-xs tracking-wide text-muted sm:col-span-2">
        Ceritakan ide Anda
        <textarea
          name="story"
          required
          rows={4}
          placeholder="Warna, ukuran, karakter, untuk siapa…"
          className={`${fieldClass} resize-y`}
        />
      </label>

      <label className="grid gap-2 text-xs tracking-wide text-muted sm:col-span-2">
        Dibutuhkan sebelum (opsional)
        <input name="deadline" type="date" className={fieldClass} />
      </label>

      <div className="text-center sm:col-span-2">
        <button type="submit" className={`${buttonPrimary} mt-2`}>
          <MessageCircle size={16} strokeWidth={1.5} />
          Kirim via WhatsApp
        </button>
      </div>
    </form>
  );
}
