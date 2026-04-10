import { useState, useCallback } from "react";
import { Clock, Trash2, AlertCircle, CheckCircle, ChevronRight, ChevronLeft, Inbox } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { loadHistory, clearHistory, deleteHistoryEntry, formatHistoryDate } from "@/lib/history";
import type { HistoryEntry } from "@/lib/history";
import { formatSAR } from "@/lib/loanCalculations";

interface HistoryPageProps {
  lang: Lang;
}

export function HistoryPage({ lang }: HistoryPageProps) {
  const isRTL = lang === "ar";
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [expanded, setExpanded] = useState<string | null>(null);

  const refresh = useCallback(() => setHistory(loadHistory()), []);

  function handleDelete(id: string) {
    deleteHistoryEntry(id);
    refresh();
  }

  function handleClearAll() {
    clearHistory();
    refresh();
  }

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center tab-content">
        <div className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center mb-5">
          <Inbox className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">
          {lang === "ar" ? "لا توجد حسابات محفوظة" : "No saved calculations"}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {lang === "ar"
            ? "ستظهر نتائج حساباتك هنا بعد إجراء أول حساب"
            : "Your calculation results will appear here after your first calculation"}
        </p>
      </div>
    );
  }

  return (
    <div className="tab-content px-4 py-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            {lang === "ar" ? `${history.length} نتيجة محفوظة` : `${history.length} saved results`}
          </span>
        </div>
        <button
          onClick={handleClearAll}
          className="text-xs text-destructive font-medium px-2 py-1 rounded-lg hover:bg-destructive/10 transition-colors press-scale"
        >
          {lang === "ar" ? "مسح الكل" : "Clear All"}
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {history.map(entry => {
          const isOpen = expanded === entry.id;
          return (
            <div
              key={entry.id}
              className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Summary row */}
              <button
                className="w-full px-4 py-3.5 flex items-center gap-3 text-start press-scale"
                onClick={() => setExpanded(isOpen ? null : entry.id)}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  entry.isDsrCompliant ? "bg-primary/12" : "bg-destructive/12"
                }`}>
                  {entry.isDsrCompliant
                    ? <CheckCircle className="w-4.5 h-4.5 text-primary" />
                    : <AlertCircle className="w-4.5 h-4.5 text-destructive" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {formatSAR(entry.loanAmount, 0)}
                    <span className="text-muted-foreground font-normal"> · {entry.durationMonths}{lang === "ar" ? " شهر" : " mo"}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lang === "ar" ? "القسط:" : "Installment:"}{" "}
                    <span className="text-foreground font-medium">{formatSAR(entry.monthlyInstallment, 0)}</span>
                    {" · "}
                    {formatHistoryDate(entry.timestamp, lang)}
                  </p>
                </div>
                <ChevronIcon
                  className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`}
                />
              </button>

              {/* Expanded */}
              {isOpen && (
                <div className="border-t border-border/60 px-4 py-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: lang === "ar" ? "إجمالي التكلفة" : "Total Cost", value: formatSAR(entry.totalRepayment, 0) },
                      { label: lang === "ar" ? "الفوائد" : "Interest", value: formatSAR(entry.totalInterest, 0) },
                      { label: "APR", value: `${entry.effectiveAPR.toFixed(2)}%` },
                      { label: lang === "ar" ? "نسبة DSR" : "DSR Ratio", value: `${entry.dsrRatio.toFixed(1)}%` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-muted/50 rounded-xl px-3 py-2">
                        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                        <p className="text-sm font-semibold text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="flex items-center gap-1.5 text-xs text-destructive/80 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {lang === "ar" ? "حذف هذا السجل" : "Delete this entry"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
