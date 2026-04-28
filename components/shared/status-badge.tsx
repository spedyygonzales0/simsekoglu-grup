import { requestStatusLabel } from "@/lib/i18n";
import { Locale, QuoteRequestStatus } from "@/lib/types";

export function StatusBadge({ status, locale }: { status: QuoteRequestStatus; locale: Locale }) {
  const classes: Record<QuoteRequestStatus, string> = {
    pending: "bg-amber-100 text-amber-700",
    contacted: "bg-blue-100 text-blue-700",
    closed: "bg-slate-200 text-slate-700"
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes[status]}`}>
      {requestStatusLabel(status, locale)}
    </span>
  );
}
