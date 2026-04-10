import type { SectorType } from "@/lib/loanCalculations";

const HISTORY_KEY = "loan-calc-history";
const MAX_HISTORY = 20;

export interface HistoryEntry {
  id: string;
  timestamp: string;
  loanAmount: number;
  annualRate: number;
  durationMonths: number;
  employeeType: "employee" | "retiree";
  sectorType: SectorType;
  mortgageMode: boolean;
  monthlyInstallment: number;
  totalRepayment: number;
  totalInterest: number;
  effectiveAPR: number;
  isDsrCompliant: boolean;
  dsrRatio: number;
  dsrLimit: number;
  maxEligibleAmount: number;
  salary: number;
}

export function saveToHistory(entry: Omit<HistoryEntry, "id" | "timestamp">): void {
  const history = loadHistory();
  const newEntry: HistoryEntry = {
    ...entry,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  };
  const updated = [newEntry, ...history].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function deleteHistoryEntry(id: string): void {
  const history = loadHistory().filter(e => e.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function formatHistoryDate(iso: string, lang: "ar" | "en"): string {
  return new Date(iso).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-SA", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
