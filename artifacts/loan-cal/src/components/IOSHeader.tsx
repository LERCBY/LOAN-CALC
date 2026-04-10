import { Moon, Sun, Globe } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { Logo } from "@/components/Logo";

interface IOSHeaderProps {
  lang: Lang;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onToggleLang: () => void;
  title?: string;
  showLogo?: boolean;
}

export function IOSHeader({
  lang,
  theme,
  onToggleTheme,
  onToggleLang,
  title,
  showLogo = false,
}: IOSHeaderProps) {
  const isRTL = lang === "ar";

  return (
    <>
      {/* Status bar spacer — fills safe area */}
      <div className="status-bar-spacer bg-primary" />
      <header className="glass border-b border-border/60 z-50 sticky top-0">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between gap-3">
          {/* Leading */}
          <div className="flex items-center gap-2.5 flex-1">
            {showLogo ? (
              <div className="flex items-center gap-2">
                <Logo variant="icon" size="sm" />
                <Logo variant="full" size="sm" className="text-primary" />
              </div>
            ) : (
              <h1 className="text-[17px] font-semibold tracking-tight text-foreground">
                {title}
              </h1>
            )}
          </div>

          {/* Trailing controls */}
          <div className={`flex items-center gap-1.5 ${isRTL ? "flex-row-reverse" : ""}`}>
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors text-xs font-semibold text-foreground press-scale"
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "EN" : "ع"}</span>
            </button>
            <button
              onClick={onToggleTheme}
              className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center press-scale"
              aria-label="Toggle theme"
            >
              {theme === "dark"
                ? <Sun className="w-4 h-4 text-amber-500" />
                : <Moon className="w-4 h-4 text-foreground/70" />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
