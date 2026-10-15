"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/format";

const BAR = "#b0602a";

function niceMax(value: number): number {
  if (value <= 0) return 100000;
  const exp = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * exp >= value)!;
  return step * exp;
}

function compact(value: number): string {
  if (value >= 1_000_000) return `${+(value / 1_000_000).toFixed(1)} jt`;
  if (value >= 1000) return `${Math.round(value / 1000)} rb`;
  return String(value);
}

function dayLabel(date: string, long = false): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    ...(long ? { weekday: "long" } : {}),
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export default function SalesChart({ data }: { data: { date: string; value: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const ticks = [max, max / 2, 0];
  const active = hover !== null ? data[hover] : null;

  return (
    <figure>
      <div className="relative h-56">
        {/* Garis bantu */}
        {ticks.map((tick) => (
          <div
            key={tick}
            className="absolute inset-x-0 flex items-center gap-2"
            style={{ bottom: `${(tick / max) * 100}%`, transform: "translateY(50%)" }}
          >
            <span className="w-12 shrink-0 text-right text-[11px] tabular-nums text-stone-500">{compact(tick)}</span>
            <span className="h-px flex-1 bg-stone-200" />
          </div>
        ))}

        <div className="absolute inset-y-0 left-14 right-0 flex items-end" onMouseLeave={() => setHover(null)}>
          {data.map((day, index) => (
            <button
              key={day.date}
              type="button"
              aria-label={`${dayLabel(day.date)}: ${formatRupiah(day.value)}`}
              onMouseEnter={() => setHover(index)}
              onFocus={() => setHover(index)}
              onBlur={() => setHover(null)}
              className="flex h-full flex-1 items-end justify-center px-px outline-none"
            >
              <span
                className="block w-full max-w-6 rounded-t transition-opacity"
                style={{
                  height: day.value > 0 ? `max(${(day.value / max) * 100}%, 3px)` : 0,
                  background: BAR,
                  opacity: hover === null || hover === index ? 1 : 0.45,
                }}
              />
            </button>
          ))}
        </div>

        {active && hover !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs shadow-md"
            style={{ left: `calc(3.5rem + (100% - 3.5rem) * ${(hover + 0.5) / data.length})` }}
          >
            <p className="text-stone-500">{dayLabel(active.date, true)}</p>
            <p className="mt-0.5 font-semibold tabular-nums text-stone-900">{formatRupiah(active.value)}</p>
          </div>
        )}
      </div>
      <div className="ml-14 mt-2 flex justify-between text-[11px] text-stone-500">
        <span>{dayLabel(data[0].date)}</span>
        <span>{dayLabel(data[data.length - 1].date)}</span>
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-stone-500">Lihat sebagai tabel</summary>
        <table className="mt-2 w-full text-left text-xs">
          <tbody>
            {data.filter((d) => d.value > 0).map((d) => (
              <tr key={d.date} className="border-t border-stone-100">
                <td className="py-1.5">{dayLabel(d.date, true)}</td>
                <td className="py-1.5 text-right tabular-nums">{formatRupiah(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
