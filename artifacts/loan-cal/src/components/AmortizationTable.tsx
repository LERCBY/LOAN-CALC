import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { AmortizationEntry } from "@/lib/loanCalculations";
import { formatSAR } from "@/lib/loanCalculations";

interface AmortizationTableProps {
  lang: Lang;
  schedule: AmortizationEntry[];
}

const PAGE_SIZE = 12;

export function AmortizationTable({ lang, schedule }: AmortizationTableProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(schedule.length / PAGE_SIZE);
  const pageItems = schedule.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const thClass = "py-2.5 px-3 text-left text-xs font-semibold text-muted-foreground bg-muted/50 first:rounded-tl-xl last:rounded-tr-xl";
  const tdClass = "py-2.5 px-3 text-xs text-foreground";

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{t(lang, "amortizationTitle")}</h3>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className={thClass}>{t(lang, "month")}</th>
              <th className={thClass}>{t(lang, "payment")}</th>
              <th className={thClass}>{t(lang, "principalPaid")}</th>
              <th className={thClass}>{t(lang, "interestPaid")}</th>
              <th className={thClass}>{t(lang, "balance")}</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((entry, i) => (
              <tr
                key={entry.month}
                className={`border-t border-border/50 ${
                  i % 2 === 0 ? "bg-card" : "bg-muted/20"
                } hover:bg-muted/40 transition-colors`}
              >
                <td className={`${tdClass} font-medium text-primary`}>{entry.month}</td>
                <td className={tdClass}>{formatSAR(entry.payment, 0)}</td>
                <td className={`${tdClass} text-green-600 dark:text-green-400`}>{formatSAR(entry.principal, 0)}</td>
                <td className={`${tdClass} text-amber-600 dark:text-amber-400`}>{formatSAR(entry.interest, 0)}</td>
                <td className={tdClass}>{formatSAR(entry.balance, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {lang === "ar"
              ? `صفحة ${page + 1} من ${totalPages}`
              : `Page ${page + 1} of ${totalPages}`}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="w-7 h-7 rounded-lg border border-input flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="w-7 h-7 rounded-lg border border-input flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
