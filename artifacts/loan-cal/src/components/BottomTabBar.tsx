import { Calculator, Clock, Settings } from "lucide-react";
import type { Lang } from "@/lib/i18n";

export type AppTab = "home" | "history" | "settings";

interface BottomTabBarProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
  lang: Lang;
}

const tabs: { id: AppTab; icon: typeof Calculator; labelAr: string; labelEn: string }[] = [
  { id: "home",     icon: Calculator, labelAr: "الحاسبة", labelEn: "Calculator" },
  { id: "history",  icon: Clock,      labelAr: "السجل",   labelEn: "History"    },
  { id: "settings", icon: Settings,   labelAr: "الإعدادات",labelEn: "Settings"  },
];

export function BottomTabBar({ active, onChange, lang }: BottomTabBarProps) {
  return (
    /* Safe-area bottom padding so bar clears home indicator on iPhone */
    <nav
      className="fixed bottom-0 inset-x-0 z-50 glass border-t border-border/60"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="max-w-lg mx-auto flex">
        {tabs.map(({ id, icon: Icon, labelAr, labelEn }) => {
          const isActive = active === id;
          const label = lang === "ar" ? labelAr : labelEn;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 pt-2.5 press-scale"
              aria-label={label}
            >
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-2xl transition-all duration-200 ${
                isActive ? "bg-primary/15" : ""
              }`}>
                <Icon
                  className={`w-[22px] h-[22px] transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                {isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors duration-200 leading-none ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
