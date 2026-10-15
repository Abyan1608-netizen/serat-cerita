import { orderStatusLabels } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

const tones: Record<OrderStatus, string> = {
  pending_payment: "bg-amber-50 text-amber-800 ring-amber-200",
  paid: "bg-sky-50 text-sky-800 ring-sky-200",
  processing: "bg-violet-50 text-violet-800 ring-violet-200",
  shipped: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-stone-100 text-stone-600 ring-stone-200",
  expired: "bg-stone-100 text-stone-600 ring-stone-200",
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${tones[status]}`}>
      {orderStatusLabels[status]}
    </span>
  );
}
