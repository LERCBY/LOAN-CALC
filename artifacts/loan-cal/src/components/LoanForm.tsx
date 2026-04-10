import { useState, useEffect, useMemo } from "react";
import { Calculator, RotateCcw, ChevronDown, TrendingUp, AlertTriangle, CheckCircle, Info, Building2, Landmark } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { PersonalData } from "@/lib/storage";
import type { LoanInputs, SectorType, EmployeeType } from "@/lib/loanCalculations";
import {
  calculateMaxEligibleAmount,
  calculateMonthlyPayment,
  getDSRLimit,
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

// ── iOS-style Segmented Control ───────────────────────────────────────────
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex bg-muted rounded-[11px] p-[3px] gap-[3px] ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      role="group"
    >
      {options.map(opt => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[9px] text-xs font-semibold
              transition-all duration-200 select-none press-scale
              ${isActive
                ? "bg-card text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
                : "text-muted-foreground hover:text-foreground/80"}
            `}
          >
            {opt.icon && <span className="opacity-80">{opt.icon}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Toggle Switch ──────────────────────────────────────────────────────────
function IOSToggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={`relative w-12 h-[28px] rounded-full transition-colors duration-200 flex-shrink-0 ${
        value ? "bg-primary" : "bg-muted-foreground/30"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-[3px] w-[22px] h-[22px] bg-white rounded-full shadow-md transition-transform duration-200 ${
          value ? "translate-x-[22px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

export function LoanForm({ lang, savedData, onCalculate, onReset }: LoanFormProps) {
  const isRTL = lang === "ar";

  const [salary, setSalary] = useState(savedData?.salary?.toString() ?? "");
  const [totalDebt, setTotalDebt] = useState(savedData?.totalDebt?.toString() ?? "");
  const [monthlyObligations, setMonthlyObligations] = useState(savedData?.monthlyObligations?.toString() ?? "");
  const [employeeType, setEmployeeType] = useState<EmployeeType>(savedData?.employeeType ?? "employee");
  const [sectorType, setSectorType] = useState<SectorType>("private");
  const [mortgageMode, setMortgageMode] = useState(false);
  const [loanAmount, setLoanAmount] = useState("");
  const [annualRate, setAnnualRate] = useState("5.0");
  const [durationMonths, setDurationMonths] = useState("60");
  const [adminFeeRate, setAdminFeeRate] = useState("1.0");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // When retiree is selected, reset mortgage mode (retirees always 25%)
  useEffect(() => {
    if (employeeType === "retiree") setMortgageMode(false);
  }, [employeeType]);

  // When sector changes to private, reset mortgage mode
  useEffect(() => {
    if (sectorType === "private") setMortgageMode(false);
  }, [sectorType]);

  useEffect(() => {
    if (savedData) {
      setSalary(savedData.salary?.toString() ?? "");
      setTotalDebt(savedData.totalDebt?.toString() ?? "");
      setMonthlyObligations(savedData.monthlyObligations?.toString() ?? "");
      setEmployeeType(savedData.employeeType ?? "employee");
    }
  }, [savedData]);

  function handleDurationChange(val: string) {
    const n = parseInt(val);
    if (!isNaN(n) && n > MAX_CONSUMER_LOAN_MONTHS) {
      setDurationMonths(String(MAX_CONSUMER_LOAN_MONTHS));
    } else {
      setDurationMonths(val);
    }
  }

  // ── Real-time Max Eligibility ──────────────────────────────────────────
  const eligibility = useMemo(() => {
    const s = parseFloat(salary);
    const obl = parseFloat(monthlyObligations) || 0;
    const rate = parseFloat(annualRate) || 5;
    const dur = Math.min(parseInt(durationMonths) || 60, MAX_CONSUMER_LOAN_MONTHS);
    if (!s || s <= 0) return null;

    const dsrLimit = getDSRLimit(employeeType, sectorType, mortgageMode);
    const maxMonthlyInstallment = s * (dsrLimit / 100) - obl;
    const maxPrincipal = calculateMaxEligibleAmount(s, obl, rate, dur, employeeType, sectorType, mortgageMode);

    const dsrConsumedByObl = s > 0 ? (obl / s) * 100 : 0;
    const dsrUsedPct = Math.min(100, (dsrConsumedByObl / dsrLimit) * 100);
    const dsrRemainingPct = Math.max(0, 100 - dsrUsedPct);

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
  }, [salary, monthlyObligations, annualRate, durationMonths, employeeType, sectorType, mortgageMode, loanAmount]);

  // ── Validation ───────────────────────────────────────────────────────
  function validate(): boolean {
    const errs: Record<string, string> = {};
    for (const { key, val } of [
      { key: "salary", val: salary },
      { key: "loanAmount", val: loanAmount },
      { key: "annualRate", val: annualRate },
      { key: "durationMonths", val: durationMonths },
    ]) {
      const n = parseFloat(val);
      if (!val || isNaN(n) || n <= 0) errs[key] = t(lang, "mustBeGreaterThanZero");
    }
    const oblN = parseFloat(monthlyObligations);
    if (monthlyObligations && (isNaN(oblN) || oblN < 0)) errs.monthlyObligations = t(lang, "mustBePositive");
    const debtN = parseFloat(totalDebt);
    if (totalDebt && (isNaN(debtN) || debtN < 0)) errs.totalDebt = t(lang, "mustBePositive");
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
      sectorType,
      mortgageMode,
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
    setSectorType("private");
    setMortgageMode(false);
    onReset();
  }

  const inputClass = (err?: string) =>
    `w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition-colors
    focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground ios-input
    ${err ? "border-destructive" : "border-input"}`;

  const labelClass = "block text-xs font-medium text-foreground/75 mb-1.5";

  const canUseMortgageMode = employeeType === "employee" && sectorType === "public";

  return (
    <div className="space-y-4">

      {/* ── Section 1: Borrower Type ─────────────────────────────────── */}
      <div className="bg-muted/40 rounded-2xl p-3.5 space-y-3.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {lang === "ar" ? "نوع المقترض" : "Borrower Type"}
        </p>

        {/* Employee type */}
        <div>
          <label className={labelClass}>{t(lang, "employeeType")}</label>
          <SegmentedControl<EmployeeType>
            value={employeeType}
            onChange={setEmployeeType}
            options={[
              {
                value: "employee",
                label: lang === "ar" ? "موظف فعّال" : "Employee",
                icon: <span className="text-[10px]">👤</span>,
              },
              {
                value: "retiree",
                label: lang === "ar" ? "متقاعد" : "Retiree",
                icon: <span className="text-[10px]">🏅</span>,
              },
            ]}
          />
        </div>

        {/* Sector type — only for employees */}
        <div>
          <label className={labelClass}>
            {lang === "ar" ? "القطاع" : "Sector"}
          </label>
          <SegmentedControl<SectorType>
            value={sectorType}
            onChange={setSectorType}
            disabled={employeeType === "retiree"}
            options={[
              {
                value: "private",
                label: lang === "ar" ? "قطاع خاص" : "Private",
                icon: <Building2 className="w-3 h-3" />,
              },
              {
                value: "public",
                label: lang === "ar" ? "قطاع عام" : "Public (Gov.)",
                icon: <Landmark className="w-3 h-3" />,
              },
            ]}
          />
          {employeeType === "retiree" && (
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
              <Info className="w-3 h-3 flex-shrink-0" />
              {lang === "ar"
                ? "المتقاعدون يخضعون لحد DSR ثابت 25% بغض النظر عن القطاع"
                : "Retirees have a fixed 25% DSR limit regardless of sector"}
            </p>
          )}
        </div>

        {/* Mortgage Mode — public employees only */}
        {canUseMortgageMode && (
          <div className="bg-background/70 border border-border rounded-xl px-3.5 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {lang === "ar" ? "وضع التمويل العقاري" : "Mortgage Mode"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {lang === "ar"
                    ? "يرفع حد DSR إلى 45% للقطاع العام (عقاري فقط)"
                    : "Raises DSR limit to 45% for public sector mortgage loans"}
                </p>
              </div>
              <IOSToggle value={mortgageMode} onChange={setMortgageMode} />
            </div>

            {mortgageMode && (
              <div className="mt-2.5 flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl px-3 py-2">
                <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  {lang === "ar"
                    ? "حد DSR 45% مخصص للتمويل العقاري فقط وفق قرارات ساما للقطاع الحكومي"
                    : "45% DSR applies to mortgage financing only for public sector per SAMA regulations"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* DSR limit badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {lang === "ar" ? "حد DSR المطبّق:" : "Active DSR limit:"}
          </span>
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
            mortgageMode && canUseMortgageMode
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
              : "bg-primary/12 text-primary"
          }`}>
            {getDSRLimit(employeeType, sectorType, mortgageMode)}%
            {mortgageMode && canUseMortgageMode && (
              <span className="text-[10px] font-medium opacity-80">
                {lang === "ar" ? "(عقاري)" : "(mortgage)"}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* ── Section 2: Personal Info ─────────────────────────────────── */}
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

      {/* ── Real-time Max Eligibility Card ───────────────────────────── */}
      {eligibility && (
        <MaxEligibilityCard
          lang={lang}
          eligibility={eligibility}
          employeeType={employeeType}
          sectorType={sectorType}
          mortgageMode={mortgageMode}
        />
      )}

      {/* ── Section 3: Loan Details ──────────────────────────────────── */}
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
              <span className="ms-1 text-primary font-normal">(max {MAX_CONSUMER_LOAN_MONTHS})</span>
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

      {/* ── Action Buttons ───────────────────────────────────────────── */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleCalculate}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-sm press-scale"
        >
          <Calculator className="w-4 h-4" />
          {t(lang, "calculate")}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-input text-foreground font-semibold text-sm hover:bg-muted transition-colors press-scale"
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
  sectorType,
  mortgageMode,
}: {
  lang: Lang;
  eligibility: EligibilityData;
  employeeType: EmployeeType;
  sectorType: SectorType;
  mortgageMode: boolean;
}) {
  const { maxPrincipal, maxMonthlyInstallment, dsrLimit, currentDSR, exceedsDSR, requestedAmount } = eligibility;

  const barFill = Math.min(100, (currentDSR / dsrLimit) * 100);
  const barColor =
    barFill >= 100 ? "bg-destructive" : barFill >= 85 ? "bg-amber-500" : "bg-primary";

  const isInsufficient = maxPrincipal <= 0;

  // Sector label
  const sectorLabel = (() => {
    if (employeeType === "retiree") return lang === "ar" ? "متقاعد" : "Retiree";
    if (sectorType === "public" && mortgageMode) return lang === "ar" ? "قطاع عام · عقاري" : "Gov. · Mortgage";
    if (sectorType === "public") return lang === "ar" ? "قطاع عام" : "Public Gov.";
    return lang === "ar" ? "قطاع خاص" : "Private";
  })();

  const isMortgageBoosted = mortgageMode && sectorType === "public" && employeeType === "employee";

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        exceedsDSR
          ? "bg-destructive/8 border-destructive/30"
          : isMortgageBoosted
          ? "bg-gradient-to-br from-amber-50/80 to-amber-50/40 dark:from-amber-950/30 dark:to-amber-950/10 border-amber-300/50 dark:border-amber-700/40"
          : isInsufficient
          ? "bg-muted/60 border-border"
          : "bg-gradient-to-br from-primary/8 to-primary/4 border-primary/25"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
            exceedsDSR ? "bg-destructive/15"
            : isMortgageBoosted ? "bg-amber-100 dark:bg-amber-900/40"
            : "bg-primary/15"
          }`}>
            <TrendingUp className={`w-3.5 h-3.5 ${
              exceedsDSR ? "text-destructive"
              : isMortgageBoosted ? "text-amber-600 dark:text-amber-400"
              : "text-primary"
            }`} />
          </div>
          <span className={`text-sm font-bold ${
            exceedsDSR ? "text-destructive"
            : isMortgageBoosted ? "text-amber-700 dark:text-amber-300"
            : "text-primary"
          }`}>
            {lang === "ar" ? "الحد الأقصى للأهلية" : "Max Eligibility"}
          </span>
        </div>

        {/* Sector + SAMA badge */}
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            isMortgageBoosted
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
              : "bg-primary/10 text-primary"
          }`}>
            {sectorLabel}
          </span>
          {!exceedsDSR && !isInsufficient && (
            <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 rounded-full px-1.5 py-0.5">
              <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
              <span className="text-[10px] font-semibold text-green-700 dark:text-green-400">SAMA</span>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
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
              {lang === "ar" ? "أقصى مبلغ يمكنك اقتراضه" : "Maximum borrowable amount"}
            </p>
            <p className={`text-2xl font-bold tracking-tight ${exceedsDSR ? "text-destructive" : "text-foreground"}`}>
              {formatSAR(maxPrincipal, 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lang === "ar" ? "أقصى قسط شهري:" : "Max monthly installment:"}{" "}
              <span className="font-semibold text-foreground">{formatSAR(maxMonthlyInstallment, 0)}</span>
            </p>
          </div>

          {/* DSR bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {lang === "ar" ? "استخدام DSR" : "DSR Usage"}
              </span>
              <span className={`text-xs font-semibold ${
                barFill >= 100 ? "text-destructive"
                : barFill >= 85 ? "text-amber-600"
                : isMortgageBoosted ? "text-amber-700 dark:text-amber-400"
                : "text-primary"
              }`}>
                {currentDSR.toFixed(1)}% / {dsrLimit}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isMortgageBoosted && barFill < 85 ? "bg-amber-500" : barColor
                }`}
                style={{ width: `${barFill}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {lang === "ar" ? "الحد:" : "Limit:"}{" "}
                <span className={`font-semibold ${isMortgageBoosted ? "text-amber-700 dark:text-amber-300" : "text-foreground"}`}>
                  {dsrLimit}%
                  {isMortgageBoosted && (
                    <span className="text-amber-600 dark:text-amber-400 ms-1">
                      {lang === "ar" ? "↑ عقاري" : "↑ mortgage"}
                    </span>
                  )}
                </span>
              </span>
              {requestedAmount > 0 && (
                <span className={exceedsDSR ? "text-destructive font-medium" : "text-primary font-medium"}>
                  {exceedsDSR
                    ? (lang === "ar" ? "⚠ يتجاوز الحد" : "⚠ Exceeds limit")
                    : (lang === "ar" ? "✓ ضمن الحد" : "✓ Within limit")}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
