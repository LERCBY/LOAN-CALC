import {
  ShieldCheck, ShieldX, Shield, AlertTriangle, Info,
  DollarSign, Percent, Calendar, TrendingUp, CheckCircle2,
  Building2, Landmark, Swords, UserCheck,
} from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { LoanResults, JobSector } from "@/lib/loanCalculations";
import { formatSAR } from "@/lib/loanCalculations";

interface Props {
  lang: Lang;
  results: LoanResults;
}

function SectorIcon({ sector, className }: { sector: JobSector; className?: string }) {
  const cls = `w-4 h-4 ${className ?? ""}`;
  if (sector === "public") return <Landmark className={cls} />;
  if (sector === "private") return <Building2 className={cls} />;
  if (sector === "military") return <Swords className={cls} />;
  return <UserCheck className={cls} />;
}

function sectorLabel(sector: JobSector, lang: Lang): string {
  const map: Record<JobSector, { ar: string; en: string }> = {
    public:   { ar: "قطاع عام", en: "Public Sector" },
    private:  { ar: "قطاع خاص", en: "Private Sector" },
    military: { ar: "عسكري", en: "Military" },
    retired:  { ar: "متقاعد", en: "Retired" },
  };
  return lang === "ar" ? map[sector].ar : map[sector].en;
}

function MetricCard({
  label, value, sub, icon, highlight, muted,
}: {
  label: string; value: string; sub?: string;
  icon?: React.ReactNode; highlight?: boolean; muted?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-3.5 border ${
      highlight
        ? "lavender-gradient border-transparent text-white shadow-sm"
        : muted
        ? "bg-muted/50 border-border"
        : "bg-card border-card-border"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium mb-1 ${highlight ? "text-white/75" : "text-muted-foreground"}`}>
            {label}
          </p>
          <p className={`font-bold leading-tight break-words ${
            highlight ? "text-white text-xl" : "text-foreground text-lg"
          }`}>
            {value}
          </p>
          {sub && (
            <p className={`text-xs mt-0.5 ${highlight ? "text-white/65" : "text-muted-foreground"}`}>
              {sub}
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            highlight ? "bg-white/18" : "bg-muted"
          }`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function SAMAComplianceReport({ lang, results }: Props) {
  const {
    monthlyInstallment, totalRepayment, totalInterest,
    adminFee, effectiveAPR, maxEligibleAmount,
    dsrRatio, dsrLimit, maxTermMonths,
    isDsrCompliant, isTermCompliant, isFullyCompliant,
    violations, principalPercentage, interestPercentage,
    jobSector, loanCategory, isFirstHome,
  } = results;

  const isRTL = lang === "ar";
  const errorViolations = violations.filter(v => v.severity === "error");
  const warnViolations = violations.filter(v => v.severity === "warning");

  const barFill = Math.min(100, (dsrRatio / dsrLimit) * 100);
  const barColor =
    barFill >= 100 ? "bg-destructive" :
    barFill >= 85  ? "bg-amber-500"   :
    "bg-primary";

  return (
    <div className="space-y-4">

      {/* ── Compliance Badge Header ────────────────────────────────── */}
      <div className={`rounded-2xl p-4 border ${
        isFullyCompliant
          ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/25"
          : "bg-destructive/8 border-destructive/30"
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            isFullyCompliant ? "lavender-gradient badge-pulse" : "bg-destructive/15"
          }`}>
            {isFullyCompliant
              ? <ShieldCheck className="w-6 h-6 text-white" />
              : <ShieldX className="w-6 h-6 text-destructive" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-base font-bold ${
                isFullyCompliant ? "text-primary" : "text-destructive"
              }`}>
                {t(lang, isFullyCompliant ? "compliancePassed" : "complianceFailed")}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t(lang, "samaReportSubtitle")}
            </p>
            {/* Sector + category chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/12 text-primary">
                <SectorIcon sector={jobSector} className="w-3 h-3 text-primary" />
                {sectorLabel(jobSector, lang)}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {loanCategory === "consumer"
                  ? (lang === "ar" ? "استهلاكي" : "Consumer")
                  : (lang === "ar" ? "عقاري" : "Mortgage")}
              </span>
              {isFirstHome && loanCategory === "mortgage" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  {lang === "ar" ? "🏠 السكن الأول" : "🏠 First Home"}
                </span>
              )}
              {isFullyCompliant && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/12 text-primary">
                  <CheckCircle2 className="w-3 h-3" />
                  {t(lang, "complianceBadge")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Violations ────────────────────────────────────────────── */}
      {errorViolations.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-destructive uppercase tracking-wide flex items-center gap-1.5">
            <ShieldX className="w-3.5 h-3.5" />
            {t(lang, "violations")} ({errorViolations.length})
          </p>
          {errorViolations.map(v => (
            <div key={v.code} className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/25 rounded-xl px-3.5 py-3">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-xs text-destructive leading-relaxed font-medium">
                {lang === "ar" ? v.messageAr : v.messageEn}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Regulatory warnings ───────────────────────────────────── */}
      {warnViolations.map(v => (
        <div key={v.code} className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-700/40 rounded-xl px-3.5 py-3">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-0.5">
              {t(lang, "regulationNote")} — SAMA
            </p>
            <p className="text-xs text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
              {lang === "ar" ? v.messageAr : v.messageEn}
            </p>
          </div>
        </div>
      ))}

      {/* ── Primary metric ────────────────────────────────────────── */}
      <MetricCard
        label={t(lang, "monthlyInstallment")}
        value={formatSAR(monthlyInstallment)}
        sub={lang === "ar" ? "القسط الشهري المقدّر" : "Estimated monthly payment"}
        icon={<DollarSign className="w-4 h-4 text-white" />}
        highlight
      />

      {/* ── APR ──────────────────────────────────────────────────── */}
      <MetricCard
        label={t(lang, "effectiveAPR")}
        value={`${effectiveAPR.toFixed(2)}%`}
        sub={lang === "ar" ? "معدل النسبة السنوي الفعلي شاملاً الرسوم" : "Includes all fees and charges"}
        icon={<Percent className="w-4 h-4 text-muted-foreground" />}
      />

      {/* ── DSR Section ──────────────────────────────────────────── */}
      <div className={`rounded-2xl border p-4 ${
        isDsrCompliant
          ? "bg-gradient-to-br from-primary/8 to-primary/4 border-primary/22"
          : "bg-destructive/8 border-destructive/25"
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-foreground">
              {t(lang, "dsrRatio")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lang === "ar" ? "نسبة الاستقطاع الشهرية" : "Monthly debt service ratio"}
            </p>
          </div>
          <div className="text-end">
            <p className={`text-2xl font-bold tabular-nums ${
              isDsrCompliant ? "text-primary" : "text-destructive"
            }`}>
              {dsrRatio.toFixed(1)}%
            </p>
            <p className={`text-[10px] font-semibold ${
              isDsrCompliant ? "text-primary/70" : "text-destructive/70"
            }`}>
              {lang === "ar" ? `من ${dsrLimit}% مسموح` : `of ${dsrLimit}% allowed`}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 bg-black/8 dark:bg-white/8 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${barFill}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <SectorIcon sector={jobSector} className="w-3 h-3" />
            {sectorLabel(jobSector, lang)}
            {" · "}
            {loanCategory === "consumer"
              ? (lang === "ar" ? "استهلاكي" : "Consumer")
              : (lang === "ar" ? "عقاري" : "Mortgage")}
          </span>
          <span className={`font-semibold ${isDsrCompliant ? "text-primary" : "text-destructive"}`}>
            {isDsrCompliant
              ? (lang === "ar" ? "✓ ضمن الحد" : "✓ Within limit")
              : (lang === "ar" ? "✗ يتجاوز الحد" : "✗ Exceeds limit")}
          </span>
        </div>
      </div>

      {/* ── Max Eligible ─────────────────────────────────────────── */}
      <div className="bg-muted/40 border border-border rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">{t(lang, "maxEligibleAmount")}</p>
            <p className="text-xl font-bold text-foreground">{formatSAR(maxEligibleAmount, 0)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lang === "ar"
                ? `بناءً على راتبك والتزاماتك (حد الاستقطاع: ${dsrLimit}%)`
                : `Based on salary & obligations (DSR limit: ${dsrLimit}%)`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Summary grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5">
        <MetricCard
          label={t(lang, "totalRepayment")}
          value={formatSAR(totalRepayment, 0)}
          sub={lang === "ar" ? "إجمالي المبلغ المُسدَّد" : "All payments combined"}
        />
        <MetricCard
          label={t(lang, "totalInterest")}
          value={formatSAR(totalInterest, 0)}
          sub={`${interestPercentage.toFixed(1)}% ${lang === "ar" ? "من الإجمالي" : "of total"}`}
        />
        <MetricCard
          label={t(lang, "adminFee")}
          value={formatSAR(adminFee, 0)}
          sub={lang === "ar" ? "بحد أقصى 5,000 ر.س وفق ساما" : "Capped at SAR 5,000 per SAMA"}
          muted
        />
        <MetricCard
          label={lang === "ar" ? "الحد الأقصى للمدة" : "Max Term"}
          value={`${maxTermMonths} ${lang === "ar" ? "شهر" : "mo"}`}
          sub={isTermCompliant
            ? (lang === "ar" ? "✓ ضمن الحد" : "✓ Within limit")
            : (lang === "ar" ? "✗ يتجاوز الحد" : "✗ Exceeds limit")}
          muted
        />
      </div>

      {/* ── Principal vs Profit breakdown ─────────────────────────── */}
      <div className="bg-card border border-card-border rounded-2xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {lang === "ar" ? "توزيع مبلغ التمويل" : "Financing Breakdown"}
        </p>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-3 rounded-full overflow-hidden bg-muted flex">
            <div
              className="h-full lavender-gradient rounded-full transition-all duration-500"
              style={{ width: `${principalPercentage}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full lavender-gradient inline-block" />
            <span className="text-muted-foreground">{t(lang, "principal")}</span>
            <span className="font-bold text-foreground">{principalPercentage.toFixed(1)}%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-bold text-foreground">{interestPercentage.toFixed(1)}%</span>
            <span className="text-muted-foreground">{t(lang, "interest")}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
          </span>
        </div>
      </div>

      {/* ── SAMA footer note ─────────────────────────────────────── */}
      <div className="flex items-start gap-2.5 bg-primary/6 border border-primary/18 rounded-xl px-3.5 py-3">
        <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-primary mb-0.5">
            {lang === "ar" ? "البنك المركزي السعودي (ساما)" : "Saudi Central Bank (SAMA)"}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t(lang, "samaInfo")}. {t(lang, "adminFeeInfo")}.
          </p>
        </div>
      </div>
    </div>
  );
}
