import { Moon, Sun, Globe, Calculator } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

interface HeaderProps {
  lang: Lang;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onToggleLang: () => void;
}

export function Header({ lang, theme, onToggleTheme, onToggleLang }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-wide">
              {t(lang, "headerTitle")}
            </h1>
            <p className="text-xs text-white/70 leading-tight">
              {t(lang, "appSubtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors text-sm font-medium"
            aria-label="Toggle language"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs">{lang === "ar" ? "EN" : "ع"}</span>
          </button>
          <button
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
