import { useState, useEffect, useMemo } from "react";
import {
  Calculator, RotateCcw, ChevronDown, TrendingUp,
  AlertTriangle, CheckCircle, Info, ShieldX,
  Building2, Landmark, Swords, UserCheck, Home,
} from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { PersonalData } from "@/lib/storage";
import type { LoanInputs, JobSector, LoanCategory } from "@/lib/loanCalculations";
import {
  calculateMaxEligibleAmount,
  calculateMonthlyPayment,
  getDSRLimit,
  getMaxTerm,
  checkSAMACompliance,
  MAX_ADMIN_FEE_SAR,
  DEFAULT_ADMIN_FEE_RATE,
  formatSAR,
} from "@/lib/loanCalculations";

interface LoanFormProps {
  lang: Lang;
  savedData: PersonalData | null;
  onCalculate: (inputs: LoanInputs) => void;
  onReset: () => void;
}

// ── iOS Segmented Control ─────────────────────────────────────────────────
function SegmentedControl<T extends string>({
  options, value, onChange, cols,
}: {
  options: { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  cols?: number;
}) {
  return (
    <div
      className={`grid bg-muted rounded-[11px] p-[3px] gap-[3px]`}
      style={{ gridTemplateColumns: `repeat(${cols ?? options.length}, 1fr)` }}
    >
      {options.map(opt => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`
              flex items-center justify-center gap-1 py-2 px-1 rounded-[9px]
              text-xs font-semibold transition-all duration-200 select-none press-scale
              ${isActive
                ? "bg-card text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.14)]"
                : "text-muted-foreground hover:text-foreground/80"}
            `}
          >
            {opt.icon && <span className="opacity-90 flex-shrink-0">{opt.icon}</span>}
            <span className="truncate leading-tight text-center">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── iOS Toggle ────────────────────────────────────────────────────────────
function IOSToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative w-12 h-[28px] rounded-full transition-colors duration-200 flex-shrink-0 ${
        value ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <span className={`absolute top-[3px] w-[22px] h-[22px] bg-white rounded-full shadow-md transition-transform duration-200 ${
        value ? "translate-x-[22px]" : "translate-x-[3px]"
      }`} />
    </button>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-muted/40 rounded-2xl p-3.5 space-y-3.5">
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
      {children}
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────────
export function LoanForm({ lang, savedData, onCalculate, onReset }: LoanFormProps) {
  const [jobSector, setJobSector] = useState<JobSector>("public");
  const [loanCategory, setLoanCategory] = useState<LoanCategory>("consumer");
  const [isFirstHome, setIsFirstHome] = useState(false);
  const [salary, setSalary] = useState(savedData?.salary?.toString() ?? "");
  const [totalDebt, setTotalDebt] = useState(savedData?.totalDebt?.toString() ?? "");
  const [monthlyObligations, setMonthlyObligations] = useState(savedData?.monthlyObligations?.toString() ?? "");
  const [loanAmount, setLoanAmount] = useState("");
  const [annualRate, setAnnualRate] = useState("5.0");
  const [durationMonths, setDurationMonths] = useState("60");
  const [adminFeeRate, setAdminFeeRate] = useState("1.0");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const maxTerm = getMaxTerm(loanCategory);
  const dsrLimit = getDSRLimit(jobSector, loanCategory, isFirstHome);

  // When category changes, reset first home
  useEffect(() => { if (loanCategory === "consumer") setIsFirstHome(false); }, [loanCategory]);
  // When category changes, clamp or expand term
  useEffect(() => {
    const cur = parseInt(durationMonths) || 60;
    if (loanCategory === "consumer" && cur > 60) setDurationMonths("60");
    if (loanCategory === "mortgage" && cur <= 60) setDurationMonths("240");
  }, [loanCategory]);

  useEffect(() => {
    if (savedData) {
      setSalary(savedData.salary?.toString() ?? "");
      setTotalDebt(savedData.totalDebt?.toString() ?? "");
      setMonthlyObligations(savedData.monthlyObligations?.toString() ?? "");
    }
  }, [savedData]);

  // ── Real-time eligibility ────────────────────────────────────────────
  const eligibility = useMemo(() => {
    const s = parseFloat(salary);
    const obl = parseFloat(monthlyObligations) || 0;
    const rate = parseFloat(annualRate) || 5;
    const dur = Math.min(parseInt(durationMonths) || maxTerm, maxTerm);
    if (!s || s <= 0) return null;

    const maxMonthlyInstallment = s * (dsrLimit / 100) - obl;
    const maxPrincipal = calculateMaxEligibleAmount(s, obl, rate, dur, jobSector, loanCategory, isFirstHome);

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
      currentDSR,
      exceedsDSR,
      requestedAmount,
    };
  }, [salary, monthlyObligations, annualRate, durationMonths, jobSector, loanCategory, isFirstHome, loanAmount, dsrLimit, maxTerm]);

  // ── Pre-flight compliance check for button state ─────────────────────
  const preflightViolations = useMemo(() => {
    const s = parseFloat(salary);
    const obl = parseFloat(monthlyObligations) || 0;
    const la = parseFloat(loanAmount);
    const rate = parseFloat(annualRate);
    const dur = parseInt(durationMonths);
    if (!s || !la || !rate || !dur) return [];
    return checkSAMACompliance({
      salary: s, totalDebt: parseFloat(totalDebt) || 0,
      monthlyObligations: obl, loanAmount: la,
      annualRate: rate, durationMonths: dur,
      jobSector, loanCategory, isFirstHome,
    }).filter(v => v.severity === "error");
  }, [salary, monthlyObligations, loanAmount, annualRate, durationMonths, totalDebt, jobSector, loanCategory, isFirstHome]);

  const hasErrors = preflightViolations.length > 0;

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
    onCalculate({
      salary: parseFloat(salary),
      totalDebt: parseFloat(totalDebt) || 0,
      monthlyObligations: parseFloat(monthlyObligations) || 0,
      loanAmount: parseFloat(loanAmount),
      annualRate: parseFloat(annualRate),
      durationMonths: parseInt(durationMonths),
      jobSector,
      loanCategory,
      isFirstHome,
      adminFeeRate: parseFloat(adminFeeRate) / 100,
    });
  }

  function handleReset() {
    setSalary(savedData?.salary?.toString() ?? "");
    setTotalDebt(savedData?.totalDebt?.toString() ?? "");
    setMonthlyObligations(savedData?.monthlyObligations?.toString() ?? "");
    setLoanAmount(""); setAnnualRate("5.0");
    setDurationMonths("60"); setAdminFeeRate("1.0");
    setJobSector("public"); setLoanCategory("consumer");
    setIsFirstHome(false); setErrors({});
    onReset();
  }

  const inputClass = (err?: string) =>
    `w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition-colors
    focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground ios-input
    ${err ? "border-destructive" : "border-input"}`;

  const labelClass = "block text-xs font-medium text-foreground/75 mb-1.5";

  // Sector options
  const sectorOptions: { value: JobSector; label: string; icon: React.ReactNode }[] = [
    { value: "public",   label: lang === "ar" ? "حكومي" : "Public", icon: <Landmark className="w-3 h-3" /> },
    { value: "private",  label: lang === "ar" ? "خاص"   : "Private", icon: <Building2 className="w-3 h-3" /> },
    { value: "military", label: lang === "ar" ? "عسكري" : "Military", icon: <Swords className="w-3 h-3" /> },
    { value: "retired",  label: lang === "ar" ? "متقاعد": "Retired", icon: <UserCheck className="w-3 h-3" /> },
  ];

  // Category options
  const categoryOptions: { value: LoanCategory; label: string }[] = [
    { value: "consumer", label: lang === "ar" ? "استهلاكي" : "Consumer" },
    { value: "mortgage", label: lang === "ar" ? "عقاري"    : "Mortgage"  },
  ];

  return (
    <div className="space-y-4">

      {/* ── Section 1: Borrower Classification ───────────────────── */}
      <Section title={lang === "ar" ? "تصنيف المقترض" : "Borrower Classification"}>
        <div>
          <label className={labelClass}>{t(lang, "jobSector")}</label>
          <SegmentedControl<JobSector>
            value={jobSector}
            onChange={setJobSector}
            options={sectorOptions}
            cols={4}
          />
        </div>

        <div>
          <label className={labelClass}>{t(lang, "loanCategory")}</label>
          <SegmentedControl<LoanCategory>
            value={loanCategory}
            onChange={setLoanCategory}
            options={categoryOptions}
            cols={2}
          />
        </div>

        {/* First Home toggle — mortgage only */}
        {loanCategory === "mortgage" && (
          <div className="bg-background/70 border border-border rounded-xl px-3.5 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-primary/12 flex items-center justify-center flex-shrink-0">
                  <Home className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{t(lang, "firstHome")}</p>
                  <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                    {t(lang, "firstHomeNote")}
                  </p>
                </div>
              </div>
              <IOSToggle value={isFirstHome} onChange={setIsFirstHome} />
            </div>
            {isFirstHome && (
              <div className="mt-2.5 flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl px-3 py-2">
                <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  {lang === "ar"
                    ? `حد الاستقطاع لتمويل السكن الأول: ${getDSRLimit(jobSector, "mortgage", true)}%`
                    : `DSR limit for first home mortgage: ${getDSRLimit(jobSector, "mortgage", true)}%`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Active DSR & term pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-primary/10 rounded-full px-2.5 py-1">
            <span className="text-[10px] text-muted-foreground">
              {lang === "ar" ? "حد الاستقطاع:" : "DSR limit:"}
            </span>
            <span className="text-[11px] font-bold text-primary">{dsrLimit}%</span>
          </div>
          <div className="flex items-center gap-1.5 bg-muted rounded-full px-2.5 py-1">
            <span className="text-[10px] text-muted-foreground">
              {lang === "ar" ? "أقصى مدة:" : "Max term:"}
            </span>
            <span className="text-[11px] font-bold text-foreground">{maxTerm} {lang === "ar" ? "شهر" : "mo"}</span>
          </div>
        </div>
      </Section>

      {/* ── Section 2: Personal Info ──────────────────────────────── */}
      <Section title={lang === "ar" ? "البيانات المالية" : "Financial Profile"}>
        <div>
          <label className={labelClass}>{t(lang, "salary")} ({t(lang, "sar")})</label>
          <input
            type="number" value={salary}
            onChange={e => setSalary(e.target.value)}
            placeholder={t(lang, "salaryPlaceholder")}
            min="0" step="100"
            className={inputClass(errors.salary)} dir="ltr"
          />
          {errors.salary && <p className="text-xs text-destructive mt-1">{errors.salary}</p>}
        </div>

        <div>
          <label className={labelClass}>{t(lang, "monthlyObligations")} ({t(lang, "sar")})</label>
          <input
            type="number" value={monthlyObligations}
            onChange={e => setMonthlyObligations(e.target.value)}
            placeholder={t(lang, "monthlyObligationsPlaceholder")}
            min="0" step="100"
            className={inputClass(errors.monthlyObligations)} dir="ltr"
          />
          {errors.monthlyObligations && <p className="text-xs text-destructive mt-1">{errors.monthlyObligations}</p>}
          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
            <Info className="w-3 h-3 flex-shrink-0" />
            {lang === "ar"
              ? "تُستقطع من الراتب قبل احتساب الأهلية"
              : "Deducted from salary before eligibility calculation"}
          </p>
        </div>

        <div>
          <label className={labelClass}>{t(lang, "totalDebt")} ({t(lang, "sar")})</label>
          <input
            type="number" value={totalDebt}
            onChange={e => setTotalDebt(e.target.value)}
            placeholder={t(lang, "totalDebtPlaceholder")}
            min="0" step="1000"
            className={inputClass(errors.totalDebt)} dir="ltr"
          />
          {errors.totalDebt && <p className="text-xs text-destructive mt-1">{errors.totalDebt}</p>}
        </div>
      </Section>

      {/* ── Real-time Max Eligibility Card ───────────────────────── */}
      {eligibility && (
        <MaxEligibilityCard lang={lang} eligibility={eligibility}
          jobSector={jobSector} loanCategory={loanCategory} isFirstHome={isFirstHome} />
      )}

      {/* ── Section 3: Loan Details ───────────────────────────────── */}
      <Section title={lang === "ar" ? "تفاصيل طلب التمويل" : "Financing Request"}>
        <div>
          <label className={labelClass}>{t(lang, "loanAmount")} ({t(lang, "sar")})</label>
          <input
            type="number" value={loanAmount}
            onChange={e => setLoanAmount(e.target.value)}
            placeholder={
              eligibility
                ? `${lang === "ar" ? "الحد الأقصى:" : "Max:"} ${formatSAR(eligibility.maxPrincipal, 0)}`
                : t(lang, "loanAmountPlaceholder")
            }
            min="0" step="1000"
            className={`${inputClass(errors.loanAmount)} ${eligibility?.exceedsDSR ? "border-destructive bg-destructive/5" : ""}`}
            dir="ltr"
          />
          {errors.loanAmount && !eligibility?.exceedsDSR && (
            <p className="text-xs text-destructive mt-1">{errors.loanAmount}</p>
          )}
          {eligibility?.exceedsDSR && (
            <div className="mt-2 flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-destructive">{t(lang, "exceedsDsrWarning")}</p>
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
              type="number" value={annualRate}
              onChange={e => setAnnualRate(e.target.value)}
              placeholder={t(lang, "interestRatePlaceholder")}
              min="0" max="100" step="0.1"
              className={inputClass(errors.annualRate)} dir="ltr"
            />
            {errors.annualRate && <p className="text-xs text-destructive mt-1">{errors.annualRate}</p>}
          </div>
          <div>
            <label className={labelClass}>
              {t(lang, "duration")}
              <span className="ms-1 text-primary/70 font-normal text-[10px]">
                (≤{maxTerm})
              </span>
            </label>
            <input
              type="number" value={durationMonths}
              onChange={e => {
                const n = parseInt(e.target.value);
                setDurationMonths(!isNaN(n) && n > maxTerm ? String(maxTerm) : e.target.value);
              }}
              placeholder={t(lang, "durationPlaceholder")}
              min="1" max={maxTerm} step="1"
              className={inputClass(errors.durationMonths)} dir="ltr"
            />
            {parseInt(durationMonths) >= maxTerm && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3" />
                {loanCategory === "consumer" ? t(lang, "maxTermNote") : (lang === "ar" ? "الحد الأقصى للتمويل العقاري 360 شهراً" : "Mortgage max term is 360 months")}
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
              type="number" value={adminFeeRate}
              onChange={e => setAdminFeeRate(e.target.value)}
              placeholder="1.0" min="0" max="100" step="0.1"
              className={inputClass()} dir="ltr"
            />
            <p className="text-xs text-muted-foreground mt-1">{t(lang, "adminFeeInfo")}</p>
          </div>
        )}
      </Section>

      {/* ── Pre-flight compliance violations ─────────────────────── */}
      {hasErrors && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-destructive flex items-center gap-1.5 uppercase tracking-wide">
            <ShieldX className="w-3.5 h-3.5" />
            {t(lang, "violations")}
          </p>
          {preflightViolations.map(v => (
            <div key={v.code} className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/25 rounded-xl px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-xs text-destructive leading-relaxed font-medium">
                {lang === "ar" ? v.messageAr : v.messageEn}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Action Buttons ────────────────────────────────────────── */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleCalculate}
          disabled={hasErrors}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-sm press-scale ${
            hasErrors
              ? "bg-destructive/15 text-destructive border border-destructive/30 cursor-not-allowed"
              : "lavender-gradient text-white hover:opacity-90 active:scale-[0.98]"
          }`}
        >
          {hasErrors ? (
            <>
              <ShieldX className="w-4 h-4" />
              {t(lang, "nonCompliantWarning")}
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4" />
              {t(lang, "calculate")}
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-3.5 rounded-xl border border-input text-foreground font-semibold text-sm hover:bg-muted transition-colors press-scale"
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
  currentDSR: number;
  exceedsDSR: boolean;
  requestedAmount: number;
}

function MaxEligibilityCard({
  lang, eligibility, jobSector, loanCategory, isFirstHome,
}: {
  lang: Lang;
  eligibility: EligibilityData;
  jobSector: JobSector;
  loanCategory: LoanCategory;
  isFirstHome: boolean;
}) {
  const { maxPrincipal, maxMonthlyInstallment, dsrLimit, currentDSR, exceedsDSR, requestedAmount } = eligibility;
  const barFill = Math.min(100, (currentDSR / dsrLimit) * 100);
  const barColor =
    barFill >= 100 ? "bg-destructive" :
    barFill >= 85  ? "bg-amber-500"   :
    "lavender-gradient";
  const isInsufficient = maxPrincipal <= 0;
  const isFirstHomeMortgage = loanCategory === "mortgage" && isFirstHome;

  return (
    <div className={`rounded-2xl border p-4 transition-all ${
      exceedsDSR
        ? "bg-destructive/8 border-destructive/30"
        : isInsufficient
        ? "bg-muted/60 border-border"
        : isFirstHomeMortgage
        ? "bg-amber-50/80 dark:bg-amber-950/20 border-amber-300/50 dark:border-amber-700/40"
        : "lavender-gradient-soft border-primary/25"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
            exceedsDSR ? "bg-destructive/15"
            : isFirstHomeMortgage ? "bg-amber-100 dark:bg-amber-900/40"
            : "bg-primary/15"
          }`}>
            <TrendingUp className={`w-3.5 h-3.5 ${
              exceedsDSR ? "text-destructive"
              : isFirstHomeMortgage ? "text-amber-600 dark:text-amber-400"
              : "text-primary"
            }`} />
          </div>
          <span className={`text-sm font-bold ${
            exceedsDSR ? "text-destructive"
            : isFirstHomeMortgage ? "text-amber-700 dark:text-amber-300"
            : "text-primary"
          }`}>
            {t(lang, "maxEligibilityTitle")}
          </span>
        </div>
        {!exceedsDSR && !isInsufficient && (
          <div className="flex items-center gap-1 bg-primary/10 rounded-full px-1.5 py-0.5">
            <CheckCircle className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-semibold text-primary">SAMA</span>
          </div>
        )}
      </div>

      {isInsufficient ? (
        <p className="text-sm font-semibold text-muted-foreground text-center py-2">
          {lang === "ar"
            ? "الالتزامات الحالية تستنفد حد الاستقطاع بالكامل"
            : "Existing obligations exhaust DSR capacity"}
        </p>
      ) : (
        <>
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-0.5">
              {t(lang, "maxEligibilityLabel")}
            </p>
            <p className={`text-2xl font-bold tracking-tight ${exceedsDSR ? "text-destructive" : "text-foreground"}`}>
              {formatSAR(maxPrincipal, 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t(lang, "maxMonthlyInstallment")}{" "}
              <span className="font-semibold text-foreground">{formatSAR(maxMonthlyInstallment, 0)}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {lang === "ar" ? "نسبة الاستقطاع" : "DSR Usage"}
              </span>
              <span className={`text-xs font-bold ${
                barFill >= 100 ? "text-destructive" :
                barFill >= 85  ? "text-amber-600"   :
                "text-primary"
              }`}>
                {currentDSR.toFixed(1)}% / {dsrLimit}%
              </span>
            </div>
            <div className="h-2 bg-black/8 dark:bg-white/8 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                style={{ width: `${barFill}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {lang === "ar" ? "الحد:" : "Limit:"}{" "}
                <span className="font-semibold text-foreground">{dsrLimit}%</span>
                {isFirstHomeMortgage && (
                  <span className="text-amber-600 dark:text-amber-400 ms-1">
                    {lang === "ar" ? "(سكن أول)" : "(first home)"}
                  </span>
                )}
              </span>
              {requestedAmount > 0 && (
                <span className={exceedsDSR ? "text-destructive font-semibold" : "text-primary font-semibold"}>
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
