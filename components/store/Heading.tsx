import type { ComponentProps } from "react";

/** Judul dengan font judul pilihan admin (dan gaya miring bila diaktifkan). */
export default function Heading({
  as: Tag = "h2",
  italic,
  className = "",
  ...props
}: ComponentProps<"h2"> & { as?: "h1" | "h2" | "h3"; italic: boolean }) {
  return (
    <Tag
      className={`font-heading ${italic ? "italic" : ""} ${className}`}
      {...props}
    />
  );
}
