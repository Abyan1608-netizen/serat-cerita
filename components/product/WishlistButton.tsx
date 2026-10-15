"use client";

import { Heart } from "lucide-react";
import { toggleWishlist, useStore } from "@/lib/store";

export default function WishlistButton({
  slug,
  name,
  className = "",
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const { wishlist } = useStore();
  const saved = wishlist.includes(slug);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={
        saved ? `Hapus ${name} dari wishlist` : `Tambah ${name} ke wishlist`
      }
      onClick={() => toggleWishlist(slug)}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-cream/90 backdrop-blur transition-transform hover:scale-110 ${className}`}
    >
      <Heart
        size={18}
        strokeWidth={1.5}
        className={saved ? "fill-umber text-umber" : ""}
      />
    </button>
  );
}
