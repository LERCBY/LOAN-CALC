import { useState } from "react";
import { Moon, Sun, Globe, Trash2, Shield, Info, ChevronRight, ChevronLeft, User, Bell } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { clearHistory } from "@/lib/history";
import { clearPersonalData } from "@/lib/storage";
import type { PersonalData } from "@/lib/storage";
import { Logo } from "@/components/Logo";

interface SettingsPageProps {
  lang: Lang;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onToggleLang: () => void;
  savedData: PersonalData | null;
  onClearData: () => void;
}

function SettingsRow({
  icon,
  label,
  sublabel,
  right,
  danger,
  onPress,
  isRTL,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  danger?: boolean;
  onPress?: () => void;
  isRTL: boolean;
}) {
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
  return (
    <button
      className="w-full flex items-center gap-3.5 px-4 py-3.5 text-start hover:bg-muted/50 active:bg-muted transition-colors press-scale"
      onClick={onPress}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
        danger ? "bg-destructive/12" : "bg-primary/12"
      }`}>
        <span className={danger ? "text-destructive" : "text-primary"}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? "text-destructive" : "text-foreground"}`}>{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
      {right ?? <ChevronIcon className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />}
    </button>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 mb-2">
        {title}
      </p>
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden divide-y divide-border/60 shadow-sm">
        {children}
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${value ? "bg-primary" : "bg-muted"}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
          value ? "translate-x-5.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function SettingsPage({
  lang,
  theme,
  onToggleTheme,
  onToggleLang,
  savedData,
  onClearData,
}: SettingsPageProps) {
  const isRTL = lang === "ar";
  const [historyCleared, setHistoryCleared] = useState(false);
  const [dataCleared, setDataCleared] = useState(false);

  function handleClearHistory() {
    clearHistory();
    setHistoryCleared(true);
    setTimeout(() => setHistoryCleared(false), 1500);
  }

  function handleClearData() {
    clearPersonalData();
    onClearData();
    setDataCleared(true);
    setTimeout(() => setDataCleared(false), 1500);
  }

  return (
    <div className="tab-content px-4 py-4 space-y-5">
      {/* App identity card */}
      <div className="bg-card border border-card-border rounded-2xl p-5 flex flex-col items-center text-center shadow-sm">
        <Logo variant="icon" size="lg" className="mb-3" />
        <Logo variant="full" size="md" className="text-primary mb-1.5" />
        <p className="text-xs text-muted-foreground">
          {lang === "ar" ? "حاسبة التمويل المتوافقة مع أنظمة ساما" : "SAMA-Compliant Loan Calculator"}
        </p>
        <div className="flex items-center gap-1.5 mt-2.5 bg-primary/8 border border-primary/20 rounded-full px-3 py-1">
          <Shield className="w-3 h-3 text-primary" />
          <span className="text-xs font-medium text-primary">
            {lang === "ar" ? "متوافق مع ساما" : "SAMA Compliant"}
          </span>
        </div>
      </div>

      {/* Appearance */}
      <SettingsSection title={lang === "ar" ? "المظهر" : "Appearance"}>
        <SettingsRow
          isRTL={isRTL}
          icon={theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          label={lang === "ar" ? "الوضع الليلي" : "Dark Mode"}
          sublabel={theme === "dark"
            ? (lang === "ar" ? "مفعّل" : "Enabled")
            : (lang === "ar" ? "معطّل" : "Disabled")}
          right={<Toggle value={theme === "dark"} onChange={() => onToggleTheme()} />}
        />
        <SettingsRow
          isRTL={isRTL}
          icon={<Globe className="w-4 h-4" />}
          label={lang === "ar" ? "اللغة / Language" : "Language / اللغة"}
          sublabel={lang === "ar" ? "العربية (RTL)" : "English (LTR)"}
          onPress={onToggleLang}
          right={
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {lang === "ar" ? "AR" : "EN"}
              </span>
            </div>
          }
        />
      </SettingsSection>

      {/* Personal data */}
      <SettingsSection title={lang === "ar" ? "البيانات الشخصية" : "Personal Data"}>
        <SettingsRow
          isRTL={isRTL}
          icon={<User className="w-4 h-4" />}
          label={lang === "ar" ? "البيانات المحفوظة" : "Saved Profile"}
          sublabel={savedData
            ? (lang === "ar" ? `محفوظ: ${savedData.name}` : `Saved: ${savedData.name}`)
            : (lang === "ar" ? "لا توجد بيانات محفوظة" : "No data saved")}
          right={savedData ? (
            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
          ) : undefined}
        />
        {savedData && (
          <SettingsRow
            isRTL={isRTL}
            icon={<Trash2 className="w-4 h-4" />}
            label={dataCleared
              ? (lang === "ar" ? "تم المسح ✓" : "Cleared ✓")
              : (lang === "ar" ? "مسح البيانات الشخصية" : "Clear Personal Data")}
            danger
            onPress={handleClearData}
            right={null}
          />
        )}
      </SettingsSection>

      {/* History */}
      <SettingsSection title={lang === "ar" ? "السجل" : "History"}>
        <SettingsRow
          isRTL={isRTL}
          icon={<Trash2 className="w-4 h-4" />}
          label={historyCleared
            ? (lang === "ar" ? "تم مسح السجل ✓" : "History Cleared ✓")
            : (lang === "ar" ? "مسح سجل الحسابات" : "Clear Calculation History")}
          sublabel={lang === "ar" ? "حذف جميع الحسابات المحفوظة" : "Delete all saved calculations"}
          danger
          onPress={handleClearHistory}
          right={null}
        />
      </SettingsSection>

      {/* About */}
      <SettingsSection title={lang === "ar" ? "حول التطبيق" : "About"}>
        <SettingsRow
          isRTL={isRTL}
          icon={<Shield className="w-4 h-4" />}
          label={lang === "ar" ? "أنظمة ساما" : "SAMA Regulations"}
          sublabel={lang === "ar"
            ? "DSR: 33.33% موظف / 25% متقاعد · حد القرض: 60 شهراً"
            : "DSR: 33.33% employee / 25% retiree · Max term: 60 months"}
          right={null}
        />
        <SettingsRow
          isRTL={isRTL}
          icon={<Info className="w-4 h-4" />}
          label={lang === "ar" ? "الإصدار" : "Version"}
          sublabel="LOAN CALC. v2.0"
          right={null}
        />
      </SettingsSection>
    </div>
  );
}
