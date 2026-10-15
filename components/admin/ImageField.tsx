"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react";
import { uploadImage } from "@/components/admin/uploadImage";

function Picker({
  onFiles,
  multiple,
  busy,
  label,
}: {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  busy: boolean;
  label: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="flex aspect-square w-28 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-stone-300 text-xs text-stone-500 transition hover:border-stone-500 hover:text-stone-800 disabled:opacity-50"
      >
        <ImagePlus size={20} />
        {busy ? "Mengunggah…" : label}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
    </>
  );
}

/** Beberapa foto (produk). Foto pertama jadi foto utama. */
export function ImagesField({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(files: File[]) {
    setBusy(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of files.slice(0, 10 - value.length)) urls.push(await uploadImage(file, "products"));
      onChange([...value, ...urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah");
    } finally {
      setBusy(false);
    }
  }

  const move = (index: number, delta: number) => {
    const next = [...value];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    onChange(next);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((url, index) => (
          <div key={url} className="group relative aspect-square w-28 overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
            <Image src={url} alt="" fill sizes="112px" className="object-cover" />
            {index === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded-md bg-stone-900/80 px-1.5 py-0.5 text-[10px] text-white">Utama</span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-white/90 p-1">
              <button type="button" aria-label="Geser kiri" disabled={index === 0} onClick={() => move(index, -1)} className="rounded p-1 disabled:opacity-30 hover:bg-stone-100"><ArrowLeft size={14} /></button>
              <button type="button" aria-label="Hapus foto" onClick={() => onChange(value.filter((_, i) => i !== index))} className="rounded p-1 text-red-700 hover:bg-red-50"><Trash2 size={14} /></button>
              <button type="button" aria-label="Geser kanan" disabled={index === value.length - 1} onClick={() => move(index, 1)} className="rounded p-1 disabled:opacity-30 hover:bg-stone-100"><ArrowRight size={14} /></button>
            </div>
          </div>
        ))}
        {value.length < 10 && <Picker onFiles={add} multiple busy={busy} label="Tambah foto" />}
      </div>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}

/** Satu foto (logo, foto beranda, dll). */
export function ImageField({
  value,
  onChange,
  folder = "site",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(files: File[]) {
    if (!files[0]) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await uploadImage(files[0], folder));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex items-end gap-3">
        {value ? (
          <div className="relative aspect-square w-28 overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
            <Image src={value} alt="" fill sizes="112px" className="object-cover" />
          </div>
        ) : null}
        <Picker onFiles={add} busy={busy} label={value ? "Ganti foto" : "Pilih foto"} />
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-xs text-red-700 underline">
            Hapus
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
