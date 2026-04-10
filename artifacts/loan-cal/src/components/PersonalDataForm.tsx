import { useState } from "react";
import { User, Save, Trash2, CheckCircle } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { PersonalData } from "@/lib/storage";
import { savePersonalData, clearPersonalData } from "@/lib/storage";

interface PersonalDataFormProps {
  lang: Lang;
  savedData: PersonalData | null;
  onSave: (data: PersonalData) => void;
  onClear: () => void;
}

export function PersonalDataForm({ lang, savedData, onSave, onClear }: PersonalDataFormProps) {
  const isRTL = lang === "ar";
  const [name, setName] = useState(savedData?.name ?? "");
  const [salary, setSalary] = useState(savedData?.salary?.toString() ?? "");
  const [totalDebt, setTotalDebt] = useState(savedData?.totalDebt?.toString() ?? "");
  const [monthlyObligations, setMonthlyObligations] = useState(savedData?.monthlyObligations?.toString() ?? "");
  const [employeeType, setEmployeeType] = useState<"employee" | "retiree">(savedData?.employeeType ?? "employee");
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t(lang, "required");
    const salaryNum = parseFloat(salary);
    if (!salary || isNaN(salaryNum) || salaryNum <= 0) errs.salary = t(lang, "salaryMustBePositive");
    const debtNum = parseFloat(totalDebt);
    if (totalDebt && (isNaN(debtNum) || debtNum < 0)) errs.totalDebt = t(lang, "mustBePositive");
    const oblNum = parseFloat(monthlyObligations);
    if (monthlyObligations && (isNaN(oblNum) || oblNum < 0)) errs.monthlyObligations = t(lang, "mustBePositive");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const data: PersonalData = {
      name: name.trim(),
      salary: parseFloat(salary) || 0,
      totalDebt: parseFloat(totalDebt) || 0,
      monthlyObligations: parseFloat(monthlyObligations) || 0,
      employeeType,
      savedAt: new Date().toISOString(),
    };
    savePersonalData(data);
    onSave(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleClear() {
    clearPersonalData();
    setName("");
    setSalary("");
    setTotalDebt("");
    setMonthlyObligations("");
    setEmployeeType("employee");
    setErrors({});
    onClear();
  }

  const inputClass = `w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition-colors 
    focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 mb-1">
        <User className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-base">{t(lang, "editPersonalData")}</h2>
      </div>

      {savedData && (
        <div className="bg-primary/8 border border-primary/20 rounded-lg p-2.5 text-xs text-primary flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {t(lang, "lastSaved")}:{" "}
            {new Date(savedData.savedAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-SA", {
              year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
            })}
          </span>
        </div>
      )}

      <div className="space-y-3">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-foreground/80 mb-1">
            {lang === "ar" ? "الاسم" : "Name"}
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={lang === "ar" ? "اسمك الكامل" : "Your full name"}
            className={`${inputClass} ${errors.name ? "border-destructive" : "border-input"}`}
            dir={isRTL ? "rtl" : "ltr"}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>

        {/* Employee Type */}
        <div>
          <label className="block text-xs font-medium text-foreground/80 mb-1">{t(lang, "employeeType")}</label>
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

        {/* Salary */}
        <div>
          <label className="block text-xs font-medium text-foreground/80 mb-1">
            {t(lang, "salary")} ({t(lang, "sar")})
          </label>
          <input
            type="number"
            value={salary}
            onChange={e => setSalary(e.target.value)}
            placeholder={t(lang, "salaryPlaceholder")}
            min="0"
            step="100"
            className={`${inputClass} ${errors.salary ? "border-destructive" : "border-input"}`}
            dir="ltr"
          />
          {errors.salary && <p className="text-xs text-destructive mt-1">{errors.salary}</p>}
        </div>

        {/* Total Debt */}
        <div>
          <label className="block text-xs font-medium text-foreground/80 mb-1">
            {t(lang, "totalDebt")} ({t(lang, "sar")})
          </label>
          <input
            type="number"
            value={totalDebt}
            onChange={e => setTotalDebt(e.target.value)}
            placeholder={t(lang, "totalDebtPlaceholder")}
            min="0"
            step="1000"
            className={`${inputClass} ${errors.totalDebt ? "border-destructive" : "border-input"}`}
            dir="ltr"
          />
          {errors.totalDebt && <p className="text-xs text-destructive mt-1">{errors.totalDebt}</p>}
        </div>

        {/* Monthly Obligations */}
        <div>
          <label className="block text-xs font-medium text-foreground/80 mb-1">
            {t(lang, "monthlyObligations")} ({t(lang, "sar")})
          </label>
          <input
            type="number"
            value={monthlyObligations}
            onChange={e => setMonthlyObligations(e.target.value)}
            placeholder={t(lang, "monthlyObligationsPlaceholder")}
            min="0"
            step="100"
            className={`${inputClass} ${errors.monthlyObligations ? "border-destructive" : "border-input"}`}
            dir="ltr"
          />
          {errors.monthlyObligations && <p className="text-xs text-destructive mt-1">{errors.monthlyObligations}</p>}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            saved
              ? "bg-green-500 text-white"
              : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? t(lang, "dataSaved") : t(lang, "saveData")}
        </button>
        {savedData && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
