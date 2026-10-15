"use client";

import { adminInput } from "@/components/admin/ui";

/** Input angka rupiah dengan pemisah ribuan (mis. 85.000). */
export default function MoneyInput({
  value,
  onChange,
  id,
}: {
  value: number;
  onChange: (value: number) => void;
  id?: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-stone-500">Rp</span>
      <input
        id={id}
        inputMode="numeric"
        value={value ? value.toLocaleString("id-ID") : ""}
        placeholder="0"
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "").slice(0, 12)) || 0)}
        className={`${adminInput} pl-10 tabular-nums`}
      />
    </div>
  );
}
