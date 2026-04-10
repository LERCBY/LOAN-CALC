import { useState, useEffect } from "react";
import { Calculator, RotateCcw, ChevronDown } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { PersonalData } from "@/lib/storage";
import type { LoanInputs } from "@/lib/loanCalculations";

interface LoanFormProps {
  lang: Lang;
  savedData: PersonalData | null;
  onCalculate: (inputs: LoanInputs) => void;
  onReset: () => void;
}

export function LoanForm({ lang, savedData, onCalculate, onReset }: LoanFormProps) {
  const isRTL = lang === "ar";

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
    onCalculate({
      salary: parseFloat(salary),
      totalDebt: parseFloat(totalDebt) || 0,
      monthlyObligations: parseFloat(monthlyObligations) || 0,
      loanAmount: parseFloat(loanAmount),
      annualRate: parseFloat(annualRate),
      durationMonths: parseInt(durationMonths),
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

        <div className="grid grid-cols-1 gap-3">
          {/* Salary */}
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

          {/* Monthly Obligations */}
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

          {/* Total Debt */}
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
      </div>

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
            placeholder={t(lang, "loanAmountPlaceholder")}
            min="0" step="1000"
            className={inputClass(errors.loanAmount)}
            dir="ltr"
          />
          {errors.loanAmount && <p className="text-xs text-destructive mt-1">{errors.loanAmount}</p>}
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
            <label className={labelClass}>{t(lang, "duration")}</label>
            <input
              type="number"
              value={durationMonths}
              onChange={e => setDurationMonths(e.target.value)}
              placeholder={t(lang, "durationPlaceholder")}
              min="1" max="360" step="1"
              className={inputClass(errors.durationMonths)}
              dir="ltr"
            />
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
