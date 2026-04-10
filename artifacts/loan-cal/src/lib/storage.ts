const PERSONAL_DATA_KEY = "loan-cal-personal-data";
const LANGUAGE_KEY = "loan-cal-language";
const THEME_KEY = "loan-cal-theme";

export interface PersonalData {
  name: string;
  salary: number;
  totalDebt: number;
  monthlyObligations: number;
  employeeType: "employee" | "retiree";
  savedAt: string;
}

export function savePersonalData(data: Omit<PersonalData, "savedAt">): void {
  const toSave: PersonalData = {
    ...data,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(PERSONAL_DATA_KEY, JSON.stringify(toSave));
}

export function loadPersonalData(): PersonalData | null {
  try {
    const raw = localStorage.getItem(PERSONAL_DATA_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersonalData;
  } catch {
    return null;
  }
}

export function clearPersonalData(): void {
  localStorage.removeItem(PERSONAL_DATA_KEY);
}

export function saveLanguage(lang: "ar" | "en"): void {
  localStorage.setItem(LANGUAGE_KEY, lang);
}

export function loadLanguage(): "ar" | "en" {
  const raw = localStorage.getItem(LANGUAGE_KEY);
  return raw === "en" ? "en" : "ar";
}

export function saveTheme(theme: "light" | "dark"): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function loadTheme(): "light" | "dark" {
  const raw = localStorage.getItem(THEME_KEY);
  return raw === "dark" ? "dark" : "light";
}
