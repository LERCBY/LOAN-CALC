import type { Lang } from "@/lib/i18n";

interface AdBannerProps {
  lang: Lang;
}

export function AdBanner({ lang }: AdBannerProps) {
  return (
    <div className="mx-4 mb-4">
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-2xl p-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(0,0,0,0.05) 10px,
              rgba(0,0,0,0.05) 20px
            )`
          }} />
        </div>
        <p className="text-xs font-semibold text-primary relative z-10">
          {lang === "ar"
            ? "احصل على أفضل عروض التمويل من البنوك السعودية"
            : "Get the best financing offers from Saudi banks"}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 relative z-10">
          {lang === "ar" ? "إعلان تجريبي" : "Advertisement banner"}
        </p>
      </div>
    </div>
  );
}
