import { TrendingUp, AlertCircle, CheckCircle, Info, DollarSign, Percent, Building2, Landmark } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { LoanResults } from "@/lib/loanCalculations";
import { formatSAR } from "@/lib/loanCalculations";

interface ResultsPanelProps {
  lang: Lang;
  results: LoanResults | null;
}

function ResultCard({
  label,
  value,
  sub,
  icon,
  highlight,
  danger,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-3.5 border transition-all ${
      highlight
        ? "bg-primary text-primary-foreground border-primary/30 shadow-sm"
        : danger
        ? "bg-destructive/8 border-destructive/20"
        : "bg-card border-card-border"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium mb-1 ${highlight ? "text-white/80" : "text-muted-foreground"}`}>
            {label}
          </p>
          <p className={`font-bold leading-tight break-words ${
            highlight ? "text-white text-xl"
            : danger ? "text-destructive text-lg"
            : "text-foreground text-lg"
          }`}>
            {value}
          </p>
          {sub && (
            <p className={`text-xs mt-0.5 ${highlight ? "text-white/70" : "text-muted-foreground"}`}>{sub}</p>
          )}
        </div>
        {icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            highlight ? "bg-white/15" : "bg-muted"
          }`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function ResultsPanel({ lang, results }: ResultsPanelProps) {
  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
          <TrendingUp className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">{t(lang, "noResults")}</p>
      </div>
    );
  }

  const {
    monthlyInstallment,
    totalRepayment,
    totalInterest,
    adminFee,
    effectiveAPR,
    maxEligibleAmount,
    dsrRatio,
    dsrLimit,
    isDsrCompliant,
    sectorType,
    mortgageMode,
  } = results;

  const isMortgageBoosted = mortgageMode && sectorType === "public";

  const sectorLabel = (() => {
    if (sectorType === "public" && mortgageMode) return lang === "ar" ? "قطاع عام · عقاري (45%)" : "Gov. · Mortgage (45%)";
    if (sectorType === "public") return lang === "ar" ? "قطاع عام (33.33%)" : "Public Gov. (33.33%)";
    return lang === "ar" ? "قطاع خاص (33.33%)" : "Private Sector (33.33%)";
  })();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-base">{t(lang, "results")}</h2>
      </div>

      {/* Primary result */}
      <ResultCard
        label={t(lang, "monthlyInstallment")}
        value={formatSAR(monthlyInstallment)}
        icon={<DollarSign className="w-4 h-4 text-white" />}
        highlight
      />

      {/* DSR Status */}
      <div className={`rounded-2xl p-3.5 border ${
        isDsrCompliant
          ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800/40"
          : "bg-destructive/8 border-destructive/20"
      }`}>
        <div className="flex items-start gap-3">
          {isDsrCompliant
            ? <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            : <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${isDsrCompliant ? "text-green-700 dark:text-green-400" : "text-destructive"}`}>
              {isDsrCompliant ? t(lang, "dsrCompliant") : t(lang, "dsrNotCompliant")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t(lang, "dsrRatio")}: {dsrRatio.toFixed(2)}% / {t(lang, "dsrLimitNote")}: {dsrLimit}%
            </p>
          </div>

          {/* Sector badge */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-xl flex-shrink-0 ${
            isMortgageBoosted
              ? "bg-amber-100 dark:bg-amber-900/40"
              : sectorType === "public"
              ? "bg-blue-100 dark:bg-blue-900/30"
              : "bg-muted"
          }`}>
            {sectorType === "public"
              ? <Landmark className={`w-3 h-3 ${isMortgageBoosted ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"}`} />
              : <Building2 className="w-3 h-3 text-muted-foreground" />}
            <span className={`text-[10px] font-semibold ${
              isMortgageBoosted ? "text-amber-700 dark:text-amber-300"
              : sectorType === "public" ? "text-blue-700 dark:text-blue-300"
              : "text-muted-foreground"
            }`}>
              {sectorType === "public" ? (lang === "ar" ? "حكومي" : "Gov.") : (lang === "ar" ? "خاص" : "Private")}
            </span>
          </div>
        </div>

        {/* DSR progress bar */}
        <div className="mt-2.5 space-y-1">
          <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isDsrCompliant
                  ? isMortgageBoosted ? "bg-amber-500" : "bg-green-500"
                  : "bg-destructive"
              }`}
              style={{ width: `${Math.min(100, (dsrRatio / dsrLimit) * 100)}%` }}
            />
          </div>
          <p className={`text-[10px] font-medium ${
            isMortgageBoosted ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
          }`}>
            {sectorLabel}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <ResultCard
          label={t(lang, "totalRepayment")}
          value={formatSAR(totalRepayment)}
          danger={!isDsrCompliant}
        />
        <ResultCard label={t(lang, "totalInterest")} value={formatSAR(totalInterest)} />
        <ResultCard label={t(lang, "adminFee")} value={formatSAR(adminFee)} />
        <ResultCard
          label={t(lang, "effectiveAPR")}
          value={`${effectiveAPR.toFixed(2)}%`}
          icon={<Percent className="w-4 h-4 text-muted-foreground" />}
        />
      </div>

      {/* Max eligible */}
      <div className={`border rounded-2xl p-3.5 ${
        isMortgageBoosted
          ? "bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40"
          : "bg-accent/15 border-accent/30"
      }`}>
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">{t(lang, "maxEligibleAmount")}</p>
            <p className="text-lg font-bold text-foreground">{formatSAR(maxEligibleAmount, 0)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lang === "ar"
                ? `بناءً على راتبك والتزاماتك (حد DSR: ${dsrLimit}%)`
                : `Based on salary & obligations (DSR: ${dsrLimit}%)`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
