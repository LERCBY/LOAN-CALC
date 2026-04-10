import { useState, useCallback } from "react";
import { User } from "lucide-react";
import { IOSHeader } from "@/components/IOSHeader";
import { LoanForm } from "@/components/LoanForm";
import { ResultsPanel } from "@/components/ResultsPanel";
import { LoanChart } from "@/components/LoanChart";
import { AmortizationTable } from "@/components/AmortizationTable";
import { PersonalDataForm } from "@/components/PersonalDataForm";
import { SAMABadge } from "@/components/SAMABadge";
import { BottomTabBar } from "@/components/BottomTabBar";
import type { AppTab } from "@/components/BottomTabBar";
import { HistoryPage } from "@/pages/HistoryPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { loadPersonalData } from "@/lib/storage";
import type { PersonalData } from "@/lib/storage";
import { calculate } from "@/lib/loanCalculations";
import type { LoanResults, LoanInputs } from "@/lib/loanCalculations";
import { saveToHistory } from "@/lib/history";
import { t } from "@/lib/i18n";

type SubTab = "calculator" | "data" | "schedule";

export default function LoanCalculator() {
  const { lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [appTab, setAppTab] = useState<AppTab>("home");
  const [subTab, setSubTab] = useState<SubTab>("calculator");
  const [savedData, setSavedData] = useState<PersonalData | null>(loadPersonalData);
  const [results, setResults] = useState<(LoanResults & { loanAmount: number }) | null>(null);

  const handleCalculate = useCallback((inputs: LoanInputs) => {
    const res = calculate(inputs);
    const combined = { ...res, loanAmount: inputs.loanAmount };
    setResults(combined);
    // Save to history
    saveToHistory({
      loanAmount: inputs.loanAmount,
      annualRate: inputs.annualRate,
      durationMonths: inputs.durationMonths,
      employeeType: inputs.employeeType,
      sectorType: inputs.sectorType,
      mortgageMode: inputs.mortgageMode,
      monthlyInstallment: res.monthlyInstallment,
      totalRepayment: res.totalRepayment,
      totalInterest: res.totalInterest,
      effectiveAPR: res.effectiveAPR,
      isDsrCompliant: res.isDsrCompliant,
      dsrRatio: res.dsrRatio,
      dsrLimit: res.dsrLimit,
      maxEligibleAmount: res.maxEligibleAmount,
      salary: inputs.salary,
    });
    // Switch to results
    setSubTab("calculator");
    setTimeout(() => {
      document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  const handleReset = useCallback(() => setResults(null), []);

  const headerProps = {
    lang,
    theme,
    onToggleTheme: toggleTheme,
    onToggleLang: () => setLang(lang === "ar" ? "en" : "ar"),
  };

  // ── Bottom tab bar height offset ───────────────────────────────────────
  // 64px tab bar + safe area inset bottom — applied as padding on scroll containers
  const bottomPad = "pb-[calc(64px+env(safe-area-inset-bottom,0px)+1rem)]";

  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-hidden">

      {/* ── Home Tab ─────────────────────────────────────────────────────── */}
      {appTab === "home" && (
        <>
          <IOSHeader {...headerProps} showLogo />

          {/* Sub-tabs — segmented control style */}
          <div className="glass border-b border-border/60 z-40">
            <div className="max-w-lg mx-auto px-4 py-2">
              <div className="flex bg-muted rounded-xl p-0.5 gap-0.5">
                {(["calculator", "data", "schedule"] as SubTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSubTab(tab)}
                    className={`flex-1 py-1.5 rounded-[10px] text-xs font-semibold transition-all duration-200 press-scale ${
                      subTab === tab
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    {tab === "calculator" ? t(lang, "tabCalculator")
                      : tab === "data" ? t(lang, "tabData")
                      : t(lang, "tabSchedule")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll content */}
          <div className={`flex-1 scroll-area ${bottomPad}`}>
            <div className="max-w-lg mx-auto px-4 py-4 space-y-4">

              {/* ── Calculator sub-tab ─────────────────────────────────── */}
              {subTab === "calculator" && (
                <div className="tab-content space-y-4">
                  {savedData && (
                    <div className="bg-primary/8 border border-primary/20 rounded-2xl px-4 py-3 flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/15 rounded-xl flex items-center justify-center flex-shrink-0">
                        <User className="w-4.5 h-4.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          {lang === "ar" ? `مرحباً، ${savedData.name}` : `Welcome back, ${savedData.name}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lang === "ar" ? "تم تحميل بياناتك المحفوظة" : "Your saved data has been loaded"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-card border border-card-border rounded-2xl p-4 shadow-sm">
                    <LoanForm
                      lang={lang}
                      savedData={savedData}
                      onCalculate={handleCalculate}
                      onReset={handleReset}
                    />
                  </div>

                  <div id="results-section">
                    {results ? (
                      <>
                        <div className="bg-card border border-card-border rounded-2xl p-4 shadow-sm">
                          <ResultsPanel lang={lang} results={results} />
                        </div>
                        <div className="mt-4 bg-card border border-card-border rounded-2xl p-4 shadow-sm">
                          <LoanChart lang={lang} results={results} />
                        </div>
                      </>
                    ) : (
                      <div className="bg-card border border-card-border rounded-2xl p-4 shadow-sm">
                        <ResultsPanel lang={lang} results={null} />
                      </div>
                    )}
                  </div>

                  <SAMABadge lang={lang} />
                </div>
              )}

              {/* ── Data sub-tab ───────────────────────────────────────── */}
              {subTab === "data" && (
                <div className="tab-content space-y-4">
                  <div className="bg-card border border-card-border rounded-2xl p-4 shadow-sm">
                    <PersonalDataForm
                      lang={lang}
                      savedData={savedData}
                      onSave={d => setSavedData(d)}
                      onClear={() => setSavedData(null)}
                    />
                  </div>
                  <SAMABadge lang={lang} />
                </div>
              )}

              {/* ── Schedule sub-tab ───────────────────────────────────── */}
              {subTab === "schedule" && (
                <div className="tab-content space-y-4">
                  {results ? (
                    <div className="bg-card border border-card-border rounded-2xl p-4 shadow-sm">
                      <AmortizationTable lang={lang} schedule={results.amortizationSchedule} />
                    </div>
                  ) : (
                    <div className="bg-card border border-card-border rounded-2xl p-12 shadow-sm text-center">
                      <div className="w-14 h-14 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📊</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-1">
                        {lang === "ar" ? "لا توجد نتائج بعد" : "No results yet"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lang === "ar"
                          ? "احسب القرض أولاً لعرض جدول الاستهلاك"
                          : "Calculate a loan first to view the payment schedule"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── History Tab ──────────────────────────────────────────────────── */}
      {appTab === "history" && (
        <>
          <IOSHeader
            {...headerProps}
            title={lang === "ar" ? "السجل" : "History"}
          />
          <div className={`flex-1 scroll-area ${bottomPad}`}>
            <div className="max-w-lg mx-auto">
              <HistoryPage lang={lang} />
            </div>
          </div>
        </>
      )}

      {/* ── Settings Tab ─────────────────────────────────────────────────── */}
      {appTab === "settings" && (
        <>
          <IOSHeader
            {...headerProps}
            title={lang === "ar" ? "الإعدادات" : "Settings"}
          />
          <div className={`flex-1 scroll-area ${bottomPad}`}>
            <div className="max-w-lg mx-auto">
              <SettingsPage
                lang={lang}
                theme={theme}
                onToggleTheme={toggleTheme}
                onToggleLang={() => setLang(lang === "ar" ? "en" : "ar")}
                savedData={savedData}
                onClearData={() => setSavedData(null)}
              />
            </div>
          </div>
        </>
      )}

      {/* ── Bottom Tab Bar (always visible) ─────────────────────────────── */}
      <BottomTabBar active={appTab} onChange={setAppTab} lang={lang} />
    </div>
  );
}
