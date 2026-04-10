import { Shield, Info } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

interface SAMABadgeProps {
  lang: Lang;
}

export function SAMABadge({ lang }: SAMABadgeProps) {
  return (
    <div className="bg-primary/8 border border-primary/20 rounded-xl p-3 flex items-start gap-2.5">
      <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
      <div className="space-y-1">
        <p className="text-xs font-semibold text-primary">
          {t(lang, "samaInfo")}
        </p>
        <div className="flex items-start gap-1.5">
          <Info className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t(lang, "dsrInfo")}
          </p>
        </div>
        <div className="flex items-start gap-1.5">
          <Info className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t(lang, "adminFeeInfo")}
          </p>
        </div>
      </div>
    </div>
  );
}
