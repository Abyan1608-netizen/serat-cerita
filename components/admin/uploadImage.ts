"use client";

import { createClient } from "@/lib/supabase/client";

const MAX_SIZE = 1600;

/** Perkecil foto di browser (maks. 1600px, WebP) agar hemat kuota penyimpanan. */
async function shrink(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  if (file.size > 15 * 1024 * 1024) throw new Error("Ukuran foto maksimal 15 MB");
  const blob = await shrink(file);
  const ext = blob.type === "image/webp" ? "webp" : (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const supabase = createClient();
  const { error } = await supabase.storage.from("images").upload(path, blob, {
    contentType: blob.type || file.type,
    cacheControl: "31536000",
  });
  if (error) throw new Error(`Gagal mengunggah: ${error.message}`);
  return supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
}
