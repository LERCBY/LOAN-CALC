import { useState } from "react";
import { Calculator, User, Table } from "lucide-react";
import { Header } from "@/components/Header";
import { LoanForm } from "@/components/LoanForm";
import { ResultsPanel } from "@/components/ResultsPanel";
import { LoanChart } from "@/components/LoanChart";
import { AmortizationTable } from "@/components/AmortizationTable";
import { PersonalDataForm } from "@/components/PersonalDataForm";
import { SAMABadge } from "@/components/SAMABadge";
import { AdBanner } from "@/components/AdBanner";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { loadPersonalData } from "@/lib/storage";
import type { PersonalData } from "@/lib/storage";
import { calculate } from "@/lib/loanCalculations";
import type { LoanResults, LoanInputs } from "@/lib/loanCalculations";
import { t } from "@/lib/i18n";

type Tab = "calculator" | "data" | "schedule";

export default function LoanCalculator() {
  const { lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("calculator");
  const [savedData, setSavedData] = useState<PersonalData | null>(loadPersonalData);
  const [results, setResults] = useState<(LoanResults & { loanAmount: number }) | null>(null);

  function handleCalculate(inputs: LoanInputs) {
    const res = calculate(inputs);
    setResults({ ...res, loanAmount: inputs.loanAmount });
    // Auto scroll to results on mobile
    setTimeout(() => {
      const el = document.getElementById("results-section");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function handleReset() {
    setResults(null);
  }

  function handleSaveData(data: PersonalData) {
    setSavedData(data);
  }

  function handleClearData() {
    setSavedData(null);
  }

  const tabs: { id: Tab; labelKey: "tabCalculator" | "tabData" | "tabSchedule"; icon: React.ReactNode }[] = [
    { id: "calculator", labelKey: "tabCalculator", icon: <Calculator className="w-4 h-4" /> },
    { id: "data", labelKey: "tabData", icon: <User className="w-4 h-4" /> },
    { id: "schedule", labelKey: "tabSchedule", icon: <Table className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        lang={lang}
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleLang={() => setLang(lang === "ar" ? "en" : "ar")}
      />

      {/* Tab Bar */}
      <div className="sticky top-[56px] z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{t(lang, tab.labelKey)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 pb-6 space-y-4">

        {/* Calculator Tab */}
        {activeTab === "calculator" && (
          <>
            {/* Saved data banner */}
            {savedData && (
              <div className="bg-primary/8 border border-primary/20 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                <User className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-primary">
                    {lang === "ar" ? `مرحباً، ${savedData.name}` : `Welcome back, ${savedData.name}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lang === "ar" ? "تم تحميل بياناتك المحفوظة" : "Your saved data has been loaded"}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-card rounded-2xl border border-card-border p-4 shadow-sm">
              <LoanForm
                lang={lang}
                savedData={savedData}
                onCalculate={handleCalculate}
                onReset={handleReset}
              />
            </div>

            {/* Results */}
            <div id="results-section">
              {results ? (
                <>
                  <div className="bg-card rounded-2xl border border-card-border p-4 shadow-sm">
                    <ResultsPanel lang={lang} results={results} />
                  </div>

                  <div className="bg-card rounded-2xl border border-card-border p-4 shadow-sm">
                    <LoanChart lang={lang} results={results} />
                  </div>
                </>
              ) : (
                <div className="bg-card rounded-2xl border border-card-border p-4 shadow-sm">
                  <ResultsPanel lang={lang} results={null} />
                </div>
              )}
            </div>

            <SAMABadge lang={lang} />
          </>
        )}

        {/* Data Management Tab */}
        {activeTab === "data" && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-card-border p-4 shadow-sm">
              <PersonalDataForm
                lang={lang}
                savedData={savedData}
                onSave={handleSaveData}
                onClear={handleClearData}
              />
            </div>
            <SAMABadge lang={lang} />
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === "schedule" && (
          <div className="space-y-4">
            {results ? (
              <div className="bg-card rounded-2xl border border-card-border p-4 shadow-sm">
                <AmortizationTable lang={lang} schedule={results.amortizationSchedule} />
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-card-border p-12 shadow-sm text-center">
                <Table className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  {lang === "ar"
                    ? "احسب القرض أولاً لعرض جدول الاستهلاك"
                    : "Calculate a loan first to view the payment schedule"}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Ad Banner */}
      <AdBanner lang={lang} />
    </div>
  );
}
