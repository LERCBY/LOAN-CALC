import { useState, useEffect, useMemo } from "react";
import { Calculator, RotateCcw, ChevronDown, TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { PersonalData } from "@/lib/storage";
import type { LoanInputs } from "@/lib/loanCalculations";
import {
  calculateMaxEligibleAmount,
  calculateMonthlyPayment,
  DSR_LIMITS,
  MAX_CONSUMER_LOAN_MONTHS,
  formatSAR,
} from "@/lib/loanCalculations";

interface LoanFormProps {
  lang: Lang;
  savedData: PersonalData | null;
  onCalculate: (inputs: LoanInputs) => void;
  onReset: () => void;
}

export function LoanForm({ lang, savedData, onCalculate, onReset }: LoanFormProps) {
  const [salary, setSalary] = useState(savedData?.salary?.toString() ?? "");
  const [totalDebt, setTotalDebt] = useState(savedData?.totalDebt?.toString() ?? "");
  const [monthlyObligations, setMonthlyObligations] = useState(savedData?.monthlyObligations?.toString() ?? "");
  const [employeeType, setEmployeeType] = useState<"employee" | "retiree">(savedData?.employeeType ?? "employee");
  const [loanAmount, setLoanAmount] = useState("");
  const [annualRate, setAnnualRate] = useState("5.0");
  const [durationMonths, setDurationMonths] = useState("60");
  const [adminFeeRate, setAdminFeeRate] = useState("1.0");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (savedData) {
      setSalary(savedData.salary?.toString() ?? "");
      setTotalDebt(savedData.totalDebt?.toString() ?? "");
      setMonthlyObligations(savedData.monthlyObligations?.toString() ?? "");
      setEmployeeType(savedData.employeeType ?? "employee");
    }
  }, [savedData]);

  // Clamp duration to 60 months
  function handleDurationChange(val: string) {
    const n = parseInt(val);
    if (!isNaN(n) && n > MAX_CONSUMER_LOAN_MONTHS) {
      setDurationMonths(String(MAX_CONSUMER_LOAN_MONTHS));
    } else {
      setDurationMonths(val);
    }
  }

  // ── Real-time Max Eligibility ─────────────────────────────────────────────
  const eligibility = useMemo(() => {
    const s = parseFloat(salary);
    const obl = parseFloat(monthlyObligations) || 0;
    const rate = parseFloat(annualRate) || 5;
    const dur = Math.min(parseInt(durationMonths) || 60, MAX_CONSUMER_LOAN_MONTHS);
    if (!s || s <= 0) return null;

    const dsrLimit = DSR_LIMITS[employeeType];
    const maxMonthlyInstallment = s * (dsrLimit / 100) - obl;
    const maxPrincipal = calculateMaxEligibleAmount(s, obl, rate, dur, employeeType);

    // How much DSR is already consumed by existing obligations
    const dsrConsumedByObl = s > 0 ? (obl / s) * 100 : 0;
    const dsrUsedPct = Math.min(100, (dsrConsumedByObl / dsrLimit) * 100);
    const dsrRemainingPct = Math.max(0, 100 - dsrUsedPct);

    // If user entered a loan amount, compute its DSR impact
    const requestedAmount = parseFloat(loanAmount) || 0;
    let requestedInstallment = 0;
    if (requestedAmount > 0) {
      requestedInstallment = calculateMonthlyPayment(requestedAmount, rate, dur);
    }
    const totalObl = obl + requestedInstallment;
    const currentDSR = s > 0 ? (totalObl / s) * 100 : 0;
    const exceedsDSR = requestedAmount > 0 && requestedAmount > maxPrincipal;

    return {
      maxPrincipal,
      maxMonthlyInstallment: Math.max(0, maxMonthlyInstallment),
      dsrLimit,
      dsrConsumedByObl,
      dsrUsedPct,
      dsrRemainingPct,
      currentDSR,
      exceedsDSR,
      requestedAmount,
    };
  }, [salary, monthlyObligations, annualRate, durationMonths, employeeType, loanAmount]);

  // ── Validation ────────────────────────────────────────────────────────────
  function validate(): boolean {
    const errs: Record<string, string> = {};
    const fields = [
      { key: "salary", val: salary },
      { key: "loanAmount", val: loanAmount },
      { key: "annualRate", val: annualRate },
      { key: "durationMonths", val: durationMonths },
    ];
    for (const { key, val } of fields) {
      const n = parseFloat(val);
      if (!val || isNaN(n) || n <= 0) {
        errs[key] = t(lang, "mustBeGreaterThanZero");
      }
    }
    const oblN = parseFloat(monthlyObligations);
    if (monthlyObligations && (isNaN(oblN) || oblN < 0)) {
      errs.monthlyObligations = t(lang, "mustBePositive");
    }
    const debtN = parseFloat(totalDebt);
    if (totalDebt && (isNaN(debtN) || debtN < 0)) {
      errs.totalDebt = t(lang, "mustBePositive");
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleCalculate() {
    if (!validate()) return;
    const dur = Math.min(parseInt(durationMonths), MAX_CONSUMER_LOAN_MONTHS);
    onCalculate({
      salary: parseFloat(salary),
      totalDebt: parseFloat(totalDebt) || 0,
      monthlyObligations: parseFloat(monthlyObligations) || 0,
      loanAmount: parseFloat(loanAmount),
      annualRate: parseFloat(annualRate),
      durationMonths: dur,
      employeeType,
      adminFeeRate: parseFloat(adminFeeRate) / 100,
    });
  }

  function handleReset() {
    setSalary(savedData?.salary?.toString() ?? "");
    setTotalDebt(savedData?.totalDebt?.toString() ?? "");
    setMonthlyObligations(savedData?.monthlyObligations?.toString() ?? "");
    setLoanAmount("");
    setAnnualRate("5.0");
    setDurationMonths("60");
    setAdminFeeRate("1.0");
    setErrors({});
    onReset();
  }

  const inputClass = (err?: string) =>
    `w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition-colors
    focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground
    ${err ? "border-destructive" : "border-input"}`;

  const labelClass = "block text-xs font-medium text-foreground/75 mb-1";

  return (
    <div className="space-y-4">
      {/* Employee Type */}
      <div>
        <label className={labelClass}>{t(lang, "employeeType")}</label>
        <div className="grid grid-cols-2 gap-2">
          {(["employee", "retiree"] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setEmployeeType(type)}
              className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                employeeType === type
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-foreground border-input hover:border-primary/50"
              }`}
            >
              {type === "employee" ? t(lang, "activeEmployee") : t(lang, "retiree")}
            </button>
          ))}
        </div>
      </div>

      {/* Section: Personal */}
      <div className="bg-muted/40 rounded-2xl p-3.5 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {lang === "ar" ? "البيانات الشخصية" : "Personal Info"}
        </p>

        <div>
          <label className={labelClass}>{t(lang, "salary")} ({t(lang, "sar")})</label>
          <input
            type="number"
            value={salary}
            onChange={e => setSalary(e.target.value)}
            placeholder={t(lang, "salaryPlaceholder")}
            min="0" step="100"
            className={inputClass(errors.salary)}
            dir="ltr"
          />
          {errors.salary && <p className="text-xs text-destructive mt-1">{errors.salary}</p>}
        </div>

        <div>
          <label className={labelClass}>{t(lang, "monthlyObligations")} ({t(lang, "sar")})</label>
          <input
            type="number"
            value={monthlyObligations}
            onChange={e => setMonthlyObligations(e.target.value)}
            placeholder={t(lang, "monthlyObligationsPlaceholder")}
            min="0" step="100"
            className={inputClass(errors.monthlyObligations)}
            dir="ltr"
          />
          {errors.monthlyObligations && <p className="text-xs text-destructive mt-1">{errors.monthlyObligations}</p>}
        </div>

        <div>
          <label className={labelClass}>{t(lang, "totalDebt")} ({t(lang, "sar")})</label>
          <input
            type="number"
            value={totalDebt}
            onChange={e => setTotalDebt(e.target.value)}
            placeholder={t(lang, "totalDebtPlaceholder")}
            min="0" step="1000"
            className={inputClass(errors.totalDebt)}
            dir="ltr"
          />
          {errors.totalDebt && <p className="text-xs text-destructive mt-1">{errors.totalDebt}</p>}
        </div>
      </div>

      {/* ── Real-time Max Eligibility Card ─────────────────────────────────── */}
      {eligibility && (
        <MaxEligibilityCard lang={lang} eligibility={eligibility} employeeType={employeeType} />
      )}

      {/* Section: Loan Details */}
      <div className="bg-muted/40 rounded-2xl p-3.5 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {lang === "ar" ? "تفاصيل التمويل" : "Loan Details"}
        </p>

        <div>
          <label className={labelClass}>{t(lang, "loanAmount")} ({t(lang, "sar")})</label>
          <input
            type="number"
            value={loanAmount}
            onChange={e => setLoanAmount(e.target.value)}
            placeholder={
              eligibility
                ? `${lang === "ar" ? "الحد الأقصى:" : "Max:"} ${formatSAR(eligibility.maxPrincipal, 0)}`
                : t(lang, "loanAmountPlaceholder")
            }
            min="0" step="1000"
            className={`${inputClass(errors.loanAmount)} ${
              eligibility?.exceedsDSR
                ? "border-destructive bg-destructive/5 focus:ring-destructive/30"
                : ""
            }`}
            dir="ltr"
          />
          {errors.loanAmount && !eligibility?.exceedsDSR && (
            <p className="text-xs text-destructive mt-1">{errors.loanAmount}</p>
          )}
          {/* Exceeds DSR warning */}
          {eligibility?.exceedsDSR && (
            <div className="mt-2 flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-destructive">
                  {t(lang, "exceedsDsrWarning")}
                </p>
                <p className="text-xs text-destructive/80 mt-0.5">
                  {lang === "ar"
                    ? `الحد الأقصى المسموح: ${formatSAR(eligibility.maxPrincipal, 0)}`
                    : `Allowed max: ${formatSAR(eligibility.maxPrincipal, 0)}`}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{t(lang, "interestRate")}</label>
            <input
              type="number"
              value={annualRate}
              onChange={e => setAnnualRate(e.target.value)}
              placeholder={t(lang, "interestRatePlaceholder")}
              min="0" max="100" step="0.1"
              className={inputClass(errors.annualRate)}
              dir="ltr"
            />
            {errors.annualRate && <p className="text-xs text-destructive mt-1">{errors.annualRate}</p>}
          </div>
          <div>
            <label className={labelClass}>
              {t(lang, "duration")}
              <span className="ms-1 text-primary font-normal">
                (max {MAX_CONSUMER_LOAN_MONTHS})
              </span>
            </label>
            <input
              type="number"
              value={durationMonths}
              onChange={e => handleDurationChange(e.target.value)}
              placeholder={t(lang, "durationPlaceholder")}
              min="1" max={MAX_CONSUMER_LOAN_MONTHS} step="1"
              className={inputClass(errors.durationMonths)}
              dir="ltr"
            />
            {parseInt(durationMonths) >= MAX_CONSUMER_LOAN_MONTHS && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3" />
                {t(lang, "maxTermNote")}
              </p>
            )}
            {errors.durationMonths && <p className="text-xs text-destructive mt-1">{errors.durationMonths}</p>}
          </div>
        </div>

        {/* Advanced */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
          {lang === "ar" ? "إعدادات متقدمة" : "Advanced Settings"}
        </button>

        {showAdvanced && (
          <div>
            <label className={labelClass}>{t(lang, "adminFeeRate")}</label>
            <input
              type="number"
              value={adminFeeRate}
              onChange={e => setAdminFeeRate(e.target.value)}
              placeholder="1.0"
              min="0" max="100" step="0.1"
              className={inputClass()}
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground mt-1">{t(lang, "adminFeeInfo")}</p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleCalculate}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
        >
          <Calculator className="w-4 h-4" />
          {t(lang, "calculate")}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-input text-foreground font-semibold text-sm hover:bg-muted transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Max Eligibility Card ───────────────────────────────────────────────────
interface EligibilityData {
  maxPrincipal: number;
  maxMonthlyInstallment: number;
  dsrLimit: number;
  dsrConsumedByObl: number;
  dsrUsedPct: number;
  dsrRemainingPct: number;
  currentDSR: number;
  exceedsDSR: boolean;
  requestedAmount: number;
}

function MaxEligibilityCard({
  lang,
  eligibility,
  employeeType,
}: {
  lang: Lang;
  eligibility: EligibilityData;
  employeeType: "employee" | "retiree";
}) {
  const { maxPrincipal, maxMonthlyInstallment, dsrLimit, currentDSR, exceedsDSR, requestedAmount } = eligibility;

  // How much of the DSR bar is filled by current scenario
  const barFill = Math.min(100, (currentDSR / dsrLimit) * 100);
  const barColor =
    barFill >= 100 ? "bg-destructive" : barFill >= 85 ? "bg-amber-500" : "bg-primary";

  const isInsufficient = maxPrincipal <= 0;

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        exceedsDSR
          ? "bg-destructive/8 border-destructive/30"
          : isInsufficient
          ? "bg-muted/60 border-border"
          : "bg-gradient-to-br from-primary/8 to-primary/4 border-primary/25"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center ${
              exceedsDSR ? "bg-destructive/15" : "bg-primary/15"
            }`}
          >
            <TrendingUp className={`w-3.5 h-3.5 ${exceedsDSR ? "text-destructive" : "text-primary"}`} />
          </div>
          <span className={`text-sm font-bold ${exceedsDSR ? "text-destructive" : "text-primary"}`}>
            {lang === "ar" ? "الحد الأقصى للأهلية" : "Max Eligibility"}
          </span>
        </div>
        {!exceedsDSR && !isInsufficient && (
          <div className="flex items-center gap-1 bg-primary/10 rounded-full px-2 py-0.5">
            <CheckCircle className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-primary">
              {lang === "ar" ? "SAMA" : "SAMA"}
            </span>
          </div>
        )}
      </div>

      {/* Max Amount */}
      {isInsufficient ? (
        <div className="text-center py-2">
          <p className="text-sm font-semibold text-muted-foreground">
            {lang === "ar"
              ? "الالتزامات الحالية تستنفد حد DSR بالكامل"
              : "Existing obligations exhaust DSR capacity"}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-0.5">
              {lang === "ar" ? "أقصى مبلغ يمكنك الاقتراضه" : "Maximum borrowable amount"}
            </p>
            <p className={`text-2xl font-bold tracking-tight ${exceedsDSR ? "text-destructive" : "text-foreground"}`}>
              {formatSAR(maxPrincipal, 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lang === "ar" ? "أقصى قسط شهري:" : "Max monthly installment:"}{" "}
              <span className="font-semibold text-foreground">{formatSAR(maxMonthlyInstallment, 0)}</span>
            </p>
          </div>

          {/* DSR Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {lang === "ar" ? "استخدام DSR" : "DSR Usage"}
              </span>
              <span className={`text-xs font-semibold ${barFill >= 100 ? "text-destructive" : barFill >= 85 ? "text-amber-600" : "text-primary"}`}>
                {currentDSR.toFixed(1)}% / {dsrLimit}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                style={{ width: `${barFill}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {lang === "ar" ? "النوع:" : "Type:"}{" "}
                <span className="text-foreground font-medium">
                  {employeeType === "employee"
                    ? (lang === "ar" ? "موظف (33.33%)" : "Employee (33.33%)")
                    : (lang === "ar" ? "متقاعد (25%)" : "Retiree (25%)")}
                </span>
              </span>
              {requestedAmount > 0 && (
                <span className={exceedsDSR ? "text-destructive font-medium" : "text-primary font-medium"}>
                  {exceedsDSR
                    ? (lang === "ar" ? "يتجاوز الحد" : "Exceeds limit")
                    : (lang === "ar" ? "ضمن الحد" : "Within limit")}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
