import Image from "next/image";

export default function ProductImage({
  src,
  alt,
  sizes,
  priority,
  className = "",
}: {
  src?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-surface-strong font-heading text-6xl text-ink-muted/50 ${className}`}
        aria-hidden
      >
        🧶
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}
