"use client";

import { useState } from "react";
import ProductImage from "@/components/store/ProductImage";

export default function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-surface-strong">
        <ProductImage src={images[active]} alt={name} priority sizes="(min-width: 1024px) 50vw, 100vw" />
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              aria-label={`Foto ${index + 1}`}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${
                index === active ? "border-accent" : "border-transparent"
              }`}
            >
              <ProductImage src={src} alt="" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
